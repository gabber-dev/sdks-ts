import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Gabber } from "gabber-client-core";
import { useSettings } from "./SettingsProvider";
import { useToken } from "../providers/TokenProvider";
import { VoiceItem } from "./VoiceItem";
import { useUsage } from "../providers/UsageProvider";

type Props = {};

export function MainView({  }: Props) {
  const { token } = useToken();
  const { settings } = useSettings();
  const [text, setText] = React.useState<string>("");
  const [voices, setVoices] = React.useState<Gabber.Voice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [playing, setPlaying] = useState(false);
  const mp3BufferRef = useRef<ArrayBuffer | null>(null);
  const [pcmBuffer, setPcmBuffer] = useState<AudioBuffer | null>(null);
  const { checkUsage } = useUsage();

  const api = useMemo(() => {
    if (!token) {
      return null;
    }
    return new Gabber.Api(token);
  }, [token]);

  const loadVoices = useCallback(async () => {
    if (!api) {
      return;
    }
    const voices = await api.getVoices();
    setVoices(voices.values);
  }, [api]);

  useEffect(() => {
    loadVoices();
  }, [loadVoices]);

  const playAudioBuffer = useCallback(async (buffer: AudioBuffer) => {
    const audioContext = new AudioContext();
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    setPlaying(true);
    source.start(0);
    source.onended = () => {
      console.log("ended");
      setPlaying(false);
    };
  }, []);

  const playButtonText = useMemo(() => {
    if (playing) {
      return <div className="loading loading-bars" />;
    }

    if (generating) {
      return <div className="loading loading-dots" />;
    }

    if (!pcmBuffer && text !== "") {
      return "Generate";
    }
    if (pcmBuffer) {
      return "Play Again";
    }

    return "";
  }, [generating, pcmBuffer, playing, text]);

  const onDownload = useCallback(() => {
    if (!mp3BufferRef.current) return;

    const blob = new Blob([new Uint8Array(mp3BufferRef.current)], {
      type: "audio/mpeg",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const firstTwoWords = text
      .split(" ")
      .slice(0, 2)
      .join(" ")
      .replace(/[^a-zA-Z0-9 ]/g, "");
    a.href = url;
    a.download = `${firstTwoWords}.mp3`;
    a.click();
    URL.revokeObjectURL(url); // Cleanup
  }, [text]);

  const onPlay = useCallback(async () => {
    if (generating || playing) {
      return;
    }
    if (pcmBuffer) {
      playAudioBuffer(pcmBuffer);
      return;
    }

    const url = `https://app.gabber.dev/api/v1/voice/generate`;
    const body = {
      text,
      voice_id: voices[selectedVoiceIndex].id,
    };

    let audioBuffer: AudioBuffer | null = null;
    let error: Error | null = null;
    try {
      setGenerating(true);
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const arrayBuffer = await response.arrayBuffer();
      mp3BufferRef.current = arrayBuffer.slice(0);
      const audioContext = new AudioContext();
      audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      setPcmBuffer(audioBuffer);
    } catch (e) {
      error = e as Error;
    } finally {
      setGenerating(false);
    }

    if(error) {
      const allowed = await checkUsage("voice_synthesis_seconds");
      // This error was unrelated
      if(allowed) {
        throw error;
      }
    }

    if (audioBuffer) {
      await playAudioBuffer(audioBuffer);
    }
  }, [
    voices,
    generating,
    pcmBuffer,
    playAudioBuffer,
    playing,
    selectedVoiceIndex,
    text,
  ]);

  if(!api) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className="w-full min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: settings.baseColor }}
    >
      <div
        className="w-full max-w-[800px] rounded-lg shadow-lg p-4 md:p-6"
        style={{
          backgroundColor: settings.baseColorPlusOne,
          borderColor: settings.primaryColor,
          borderWidth: "1px",
          borderStyle: "solid",
        }}
      >
        <h2
          className="text-2xl md:text-3xl font-bold text-center mb-4 md:mb-6"
          style={{ color: settings.primaryColor }}
        >
          Voice Preview
        </h2>
        <div className="space-y-4">
          <textarea
            className="textarea w-full h-24 md:h-32 text-base md:text-lg transition-all duration-300 ease-in-out p-2 md:p-3"
            placeholder="Type something..."
            onChange={(e) => {
              if (pcmBuffer) {
                mp3BufferRef.current = null;
                setPcmBuffer(null);
              }
              setText(e.target.value);
            }}
            value={text}
            style={{
              backgroundColor: settings.baseColorPlusTwo,
              color: settings.baseColorContent,
              borderColor: settings.primaryColor,
            }}
          />
          <div
            className="flex flex-col md:items-center md:justify-between p-2 md:p-3 rounded-md"
            style={{ backgroundColor: settings.baseColorPlusTwo }}
          >
            <div className="flex flex-col w-full items-center gap-2 mb-2 md:mb-0">
              <div
                className="font-semibold text-sm md:text-base"
                style={{ color: settings.primaryColor }}
              >
                Voice:
              </div>
              <div className="flex flex-col w-full max-h-[300px] overflow-y-scroll">
                {voices.map((voice, idx) => (
                  <div key={voice.id}>
                    <VoiceItem
                      selected={selectedVoiceIndex === idx}
                      onClick={() => {
                        setSelectedVoiceIndex(idx);
                      }}
                      voice={voice}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-center gap-2 md:gap-4 mt-4 md:mt-6">
            <button
              className="btn w-full md:w-[200px] h-8 md:h-10 transition-colors duration-300 ease-in-out rounded-md mb-2 md:mb-0"
              onClick={onPlay}
              disabled={generating || playing || text.trim() === ""}
              style={{
                backgroundColor: "transparent",
                color: settings.primaryColor,
                borderColor: settings.primaryColor,
                borderWidth: "2px",
                borderStyle: "solid",
                opacity: text.trim() === "" ? 0.5 : 1,
              }}
            >
              <span className="transition-colors duration-300 ease-in-out text-xs md:text-sm">
                {playButtonText || "Generate"}
              </span>
            </button>
            {pcmBuffer && (
              <button
                className="btn w-full md:w-[200px] h-8 md:h-10 transition-colors duration-300 ease-in-out rounded-md"
                onClick={onDownload}
                style={{
                  backgroundColor: "transparent",
                  color: settings.secondaryColor,
                  borderColor: settings.secondaryColor,
                  borderWidth: "2px",
                  borderStyle: "solid",
                }}
              >
                <span className="transition-colors duration-300 ease-in-out text-xs md:text-sm">
                  Download
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}