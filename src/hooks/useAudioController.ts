"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import type { Station } from "@/data/stations";

export type AudioControllerState = {
  isPlaying: boolean;
  isBuffering: boolean;
  error: string | null;
  volume: number;
  levels: [number, number];
  audioRef: RefObject<HTMLAudioElement | null>;
  playStation: (station: Station) => Promise<void>;
  stop: () => void;
  setVolume: (volume: number) => void;
  clearError: () => void;
};

/**
 * HTML audio + optional Web Audio analysis for VU meters.
 * Falls back to smoothed fake levels when CORS blocks AnalyserNode data.
 */
export function useAudioController(
  initialVolume = 0.65
): AudioControllerState {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const fakeLevelRef = useRef(0);
  const analysisOkRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolumeState] = useState(initialVolume);
  const [levels, setLevels] = useState<[number, number]>([0, 0]);

  const ensureGraph = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!ctxRef.current) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      ctxRef.current = new Ctx();
    }

    if (ctxRef.current.state === "suspended") {
      await ctxRef.current.resume();
    }

    if (!sourceRef.current) {
      try {
        const source = ctxRef.current.createMediaElementSource(audio);
        const analyser = ctxRef.current.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.75;
        const gain = ctxRef.current.createGain();
        gain.gain.value = volume;

        source.connect(analyser);
        analyser.connect(gain);
        gain.connect(ctxRef.current.destination);

        sourceRef.current = source;
        analyserRef.current = analyser;
        gainRef.current = gain;
        analysisOkRef.current = true;
      } catch {
        // Already connected or CORS / browser restriction
        analysisOkRef.current = false;
      }
    }
  }, [volume]);

  const stopMeterLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startMeterLoop = useCallback(() => {
    stopMeterLoop();
    const data = new Uint8Array(128);

    const tick = () => {
      const playing = !(audioRef.current?.paused ?? true);
      let left = 0;
      let right = 0;

      if (playing && analyserRef.current && analysisOkRef.current) {
        analyserRef.current.getByteFrequencyData(data);
        let sumL = 0;
        let sumR = 0;
        const mid = Math.floor(data.length / 2);
        for (let i = 0; i < mid; i++) sumL += data[i];
        for (let i = mid; i < data.length; i++) sumR += data[i];
        left = Math.min(1, (sumL / mid / 255) * 1.8);
        right = Math.min(1, (sumR / (data.length - mid) / 255) * 1.8);
        if (left < 0.02 && right < 0.02) {
          // Likely silent due to CORS — fall back to fake motion
          analysisOkRef.current = false;
        }
      }

      if (playing && !analysisOkRef.current) {
        const target = 0.25 + Math.random() * 0.55;
        fakeLevelRef.current += (target - fakeLevelRef.current) * 0.12;
        const wobble = Math.sin(Date.now() / 180) * 0.05;
        left = Math.min(1, Math.max(0.05, fakeLevelRef.current + wobble));
        right = Math.min(
          1,
          Math.max(0.05, fakeLevelRef.current - wobble + (Math.random() - 0.5) * 0.08)
        );
      }

      if (!playing) {
        fakeLevelRef.current *= 0.85;
        left *= 0.75;
        right *= 0.75;
        if (left < 0.01) left = 0;
        if (right < 0.01) right = 0;
      }

      setLevels([left, right]);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [stopMeterLoop]);

  useEffect(() => {
    startMeterLoop();
    return stopMeterLoop;
  }, [startMeterLoop, stopMeterLoop]);

  const setVolume = useCallback((next: number) => {
    const clamped = Math.min(1, Math.max(0, next));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    if (gainRef.current) {
      gainRef.current.gain.value = clamped;
    }
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    setIsPlaying(false);
    setIsBuffering(false);
  }, []);

  const playStation = useCallback(
    async (station: Station) => {
      const audio = audioRef.current;
      if (!audio) return;

      setError(null);
      setIsBuffering(true);

      try {
        await ensureGraph();
        // Avoid crossOrigin — many radio CDNs lack CORS and Safari will refuse playback.
        audio.volume = volume;
        if (gainRef.current) {
          gainRef.current.gain.value = volume;
        }
        if (audio.src !== station.streamUrl) {
          audio.src = station.streamUrl;
        }
        await audio.play();
        setIsPlaying(true);
        setIsBuffering(false);
        // Analysis often returns silence without CORS; meter loop falls back automatically.
        analysisOkRef.current = Boolean(analyserRef.current);
      } catch {
        setIsPlaying(false);
        setIsBuffering(false);
        setError("Stream unavailable");
      }
    },
    [ensureGraph, volume]
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlaying = () => {
      setIsPlaying(true);
      setIsBuffering(false);
      setError(null);
    };
    const onWaiting = () => setIsBuffering(true);
    const onPause = () => setIsPlaying(false);
    const onError = () => {
      setIsPlaying(false);
      setIsBuffering(false);
      setError("Stream unavailable");
    };

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
    };
  }, []);

  return {
    isPlaying,
    isBuffering,
    error,
    volume,
    levels,
    audioRef,
    playStation,
    stop,
    setVolume,
    clearError: () => setError(null),
  };
}
