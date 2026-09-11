"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Station } from "@/data/stations";
import { getSharedAudio, setSharedVolume } from "@/lib/sharedAudio";

export type AudioControllerState = {
  isPlaying: boolean;
  isBuffering: boolean;
  error: string | null;
  volume: number;
  levels: [number, number];
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playStation: (station: Station) => Promise<void>;
  stop: () => void;
  setVolume: (volume: number) => void;
  clearError: () => void;
};

function streamCandidates(station: Station): string[] {
  return [
    `/api/stream/${station.id}`,
    station.streamUrl,
    "/audio/test-clip.mp3",
  ];
}

export function useAudioController(
  initialVolume = 0.85
): AudioControllerState {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeRef = useRef(initialVolume);
  const playTokenRef = useRef(0);
  const fakeLevelRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolumeState] = useState(initialVolume);
  const [levels, setLevels] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    const audio = getSharedAudio();
    audioRef.current = audio;
    setSharedVolume(volumeRef.current);

    const onPlaying = () => {
      setIsPlaying(true);
      setIsBuffering(false);
      setError(null);
    };
    const onWaiting = () => setIsBuffering(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setIsBuffering(false);
    };

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      // Do NOT destroy shared audio on unmount — keeps volume control working
    };
  }, []);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const audio = audioRef.current ?? (typeof window !== "undefined" ? getSharedAudio() : null);
      const playing = Boolean(audio && !audio.paused && !audio.ended);
      let left = 0;
      let right = 0;
      if (playing) {
        const vol = Math.max(0.15, volumeRef.current);
        const target = (0.3 + Math.random() * 0.5) * vol;
        fakeLevelRef.current += (target - fakeLevelRef.current) * 0.14;
        const wobble = Math.sin(Date.now() / 160) * 0.06;
        left = Math.min(1, Math.max(0.08, fakeLevelRef.current + wobble));
        right = Math.min(
          1,
          Math.max(
            0.08,
            fakeLevelRef.current - wobble + (Math.random() - 0.5) * 0.1
          )
        );
      } else {
        fakeLevelRef.current *= 0.82;
        left = fakeLevelRef.current < 0.02 ? 0 : fakeLevelRef.current;
        right = left * 0.92;
      }
      setLevels([left, right]);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const setVolume = useCallback((next: number) => {
    const clamped = setSharedVolume(next);
    volumeRef.current = clamped;
    setVolumeState(clamped);
  }, []);

  const stop = useCallback(() => {
    playTokenRef.current += 1;
    const audio = getSharedAudio();
    audio.pause();
    audio.removeAttribute("src");
    try {
      audio.load();
    } catch {
      /* ignore */
    }
    setIsPlaying(false);
    setIsBuffering(false);
  }, []);

  const playStation = useCallback(async (station: Station) => {
    const audio = getSharedAudio();
    audioRef.current = audio;

    const token = ++playTokenRef.current;
    setError(null);
    setIsBuffering(true);

    const vol = setSharedVolume(Math.max(0.05, volumeRef.current));
    volumeRef.current = vol;
    setVolumeState(vol);

    const candidates = streamCandidates(station);
    let lastError: unknown = null;

    for (const url of candidates) {
      if (token !== playTokenRef.current) return;
      try {
        audio.src = url;
        await audio.play();
        if (token !== playTokenRef.current) return;

        const usedFallbackClip = url.endsWith("test-clip.mp3");
        setIsPlaying(true);
        setIsBuffering(false);
        setError(
          usedFallbackClip
            ? "Radio stream blocked — playing local test clip"
            : null
        );
        return;
      } catch (err) {
        lastError = err;
        console.warn("Candidate failed", station.name, url, err);
      }
    }

    if (token !== playTokenRef.current) return;
    console.warn("All stream candidates failed", station.name, lastError);
    setIsPlaying(false);
    setIsBuffering(false);
    setError("Stream unavailable — try another station");
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
