import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Gabber } from "gabber-client-core";
import { useSettings } from "../conversational/SettingsProvider";
import { BarAudioVisualizer } from "../conversational/BarAudioVisualizer";

type Props = {
  token: string;
}

export function MainView({ token }: Props) {
  const { settings } = useSettings();
  const [text, setText] = React.useState<string>("");
  const [voices, setVoices] = React.useState<Gabber.Voice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [playing, setPlaying] = useState(false);
  const mp3BufferRef = useRef<ArrayBuffer | null>(null);
  const [pcmBuffer, setPcmBuffer] = useState<AudioBuffer | null>(null);
  const [audioVisualizerValues, setAudioVisualizerValues] = useState<number[]>([]);

  const api = useRef<Gabber.Api | null>(null); 
  const apiProm = useRef<Promise<Gabber.Api> | null>(null);

  const createApi = useCallback(async () => {
    if (api.current) {
      return api.current;
    }

    if (apiProm.current) {
      return apiProm.current;
    }

    const prom = new Promise<Gabber.Api>(async (resolve, reject) => {
      try {
        api.current = new Gabber.Api(token);
        resolve(api.current);
      } catch (e) {
        reject(e);
      }
    });
    apiProm.current = prom;
    return prom;
  }, []);

  const loadVoices = useCallback(async () => {
    const api = await createApi();
    const voices = await api.getVoices();
    setVoices(voices.values);
  }, []);

  useEffect(() => {
    loadVoices();
  }, []);

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
      toast.error("Failed to generate audio" + e);
    } finally {
      setGenerating(false);
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

  useEffect(() => {
    if (playing && pcmBuffer) {
      const intervalId = setInterval(() => {
        setAudioVisualizerValues(Array.from({ length: 10 }, () => Math.random()));
      }, 100);
      return () => clearInterval(intervalId);
    } else {
      setAudioVisualizerValues([]);
    }
  }, [playing, pcmBuffer]);

  return (
    <div 
      className="flex flex-col items-center justify-center p-4" 
      style={{ 
        backgroundColor: settings.baseColor,
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0
      }}
    >
      <div className="w-full max-w-[800px] flex flex-col gap-4 items-center bg-white rounded-lg shadow-md p-6" style={{ borderColor: settings.primaryColor }}>
        <h2 className="text-2xl font-bold" style={{ color: settings.primaryColor }}>Voice Preview</h2>
        <textarea
          className="w-full p-2 rounded-md border"
          style={{ 
            backgroundColor: settings.baseColorPlusOne,
            color: settings.baseColorContent,
            borderColor: settings.primaryColor
          }}
          placeholder="Type something..."
          onChange={(e) => {
            if (pcmBuffer) {
              mp3BufferRef.current = null;
              setPcmBuffer(null);
            }
            setText(e.target.value);
          }}
          value={text}
        />
        <div className="flex gap-2 items-center">
          <div style={{ color: settings.baseColorContent }}>Voice:</div>
          <div className="italic" style={{ color: settings.primaryColor }}>{voices[selectedVoiceIndex]?.name}</div>
        </div>
        <div className="flex gap-2">
          {text !== "" && (
            <button 
              className="px-4 py-2 rounded-md font-semibold transition-colors border"
              style={{ 
                color: settings.primaryColor,
                borderColor: settings.primaryColor,
              }}
              onClick={onPlay}
            >
              {playButtonText}
            </button>
          )}
          {pcmBuffer && (
            <button 
              className="px-4 py-2 rounded-md font-semibold"
              style={{ 
                backgroundColor: settings.secondaryColor,
                color: settings.secondaryColorContent
              }}
              onClick={onDownload}
            >
              Download
            </button>
          )}
        </div>
        <select
          className="p-2 rounded-md border"
          style={{ 
            backgroundColor: settings.baseColorPlusOne,
            color: settings.baseColorContent,
            borderColor: settings.primaryColor
          }}
          onChange={(e) => {
            if (pcmBuffer) {
              mp3BufferRef.current = null;
              setPcmBuffer(null);
            }
            const idx = parseInt(e.target.value);
            setSelectedVoiceIndex(idx);
          }}
          value={selectedVoiceIndex}
        >
          {voices.map((voice, idx) => (
            <option key={voice.id} value={idx}>
              {voice.name} ({voice.language})
            </option>
          ))}
        </select>
        <div className="w-full h-24">
          <BarAudioVisualizer
            color={settings.secondaryColor}
            gap={4}
            values={audioVisualizerValues}
          />
        </div>
      </div>
    </div>
  );
}