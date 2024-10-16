import React, { useCallback, useMemo, useRef, useState } from "react";
import { useSettings } from "./SettingsProvider";
import { useToken } from "../providers/TokenProvider";
import { VoiceItem } from "./VoiceItem";
import { useUsage } from "../providers/UsageProvider";
import { useVoice } from "../providers/VoiceProvider";

type Props = {};

export function MainView({  }: Props) {
  const { token } = useToken();
  const { settings } = useSettings();
  const [text, setText] = React.useState<string>("");
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [playing, setPlaying] = useState(false);
  const mp3BufferRef = useRef<ArrayBuffer | null>(null);
  const [pcmBuffer, setPcmBuffer] = useState<AudioBuffer | null>(null);
  const { checkUsage } = useUsage();
  const {voices} = useVoice();
  const audioContext = useRef(new AudioContext());

  const playAudioBuffer = useCallback(async (buffer: AudioBuffer) => {
    try {
      audioContext.current.resume();
      const source = audioContext.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.current.destination);
      setPlaying(true);
      source.start(0);
      source.onended = () => {
        console.log("ended");
        setPlaying(false);
      };
    } catch (e) {
      console.error(e);
      setPlaying(false);
    }
  }, []);

  const playButtonText = useMemo(() => {
    if (playing) {
      return <div className="loading loading-bars" />;
    }

    if (generating) {
      return <div className="loading loading-dots" />;
    }

    if (!pcmBuffer && text !== "") {
      return settings.generateButtonText || "Generate";
    }
    if (pcmBuffer) {
      return "Play Again";
    }

    return settings.generateButtonText || "Generate";
  }, [generating, pcmBuffer, playing, text, settings.generateButtonText]);

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

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-start p-2 gap-2"
      style={{ backgroundColor: settings.baseColor }}
    >
      <h2
        className="text-2xl font-bold text-center mb-4"
        style={{ color: settings.primaryColor }}
      >
        {settings.titleText || "Voice Preview"}
      </h2>
      <textarea
        className="textarea w-full grow basis-0 text-base transition-all duration-300 ease-in-out p-2"
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
        className="rounded-md basis-0 grow-[5] w-full relative"
        style={{ backgroundColor: settings.baseColorPlusTwo }}
      >
        <div
          className="h-[40px] flex items-center justify-center text-lg font-semibold w-full"
          style={{
            color: settings.primaryColor,
            borderColor: settings.primaryColor,
            borderBottomWidth: "2px",
            borderBottomStyle: "solid",
          }}
        >
          Voice:
        </div>
        <div className="absolute top-[40px] pt-1 left-0 bottom-0 right-0 m-0 p-0 flex flex-col overflow-y-scroll">
          {voices.map((voice, idx) => (
            <div key={voice.id}>
              <VoiceItem
                selected={selectedVoiceIndex === idx}
                onClick={() => {
                  setSelectedVoiceIndex((prev) => {
                    if (prev !== idx) {
                      setPcmBuffer(null);
                    }
                    return idx;
                  });
                }}
                voice={voice}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex h-[60px] w-full justify-center items-center gap-2 mt-4">
        <button
          className="basis-0 grow h-full transition-colors duration-300 ease-in-out rounded-md"
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
          <span className="transition-colors duration-300 ease-in-out text-lg">
            {playButtonText}
          </span>
        </button>
        {pcmBuffer && (
          <button
            className="basis-0 grow h-full transition-colors duration-300 ease-in-out rounded-md"
            onClick={onDownload}
            style={{
              backgroundColor: "transparent",
              color: settings.secondaryColor,
              borderColor: settings.secondaryColor,
              borderWidth: "2px",
              borderStyle: "solid",
            }}
          >
            <span className="transition-colors duration-300 ease-in-out text-lg">
              Download
            </span>
          </button>
        )}
      </div>
    </div>
  );
}