"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Station } from "@/data/stations";

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
    // Same-origin proxy — fixes Chrome NotSupportedError on many Icecast URLs
    `/api/stream/${station.id}`,
    // Direct fallback
    station.streamUrl,
  ];
}

async function tryPlay(
  audio: HTMLAudioElement,
  url: string,
  volume: number
): Promise<void> {
  audio.muted = false;
  audio.volume = volume;
  if (!audio.paused) {
    audio.pause();
  }
  audio.src = url;
  await audio.play();
}

/**
 * HTMLAudioElement playback with same-origin stream proxy first.
 */
export function useAudioController(
  initialVolume = 0.85
): AudioControllerState {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerRef = useRef<HTMLAudioElement | null>(null);
  const fakeLevelRef = useRef(0);
  const volumeRef = useRef(initialVolume);
  const playTokenRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolumeState] = useState(initialVolume);
  const [levels, setLevels] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audio.muted = false;
    audio.volume = volumeRef.current;
    audio.setAttribute("playsinline", "true");
    audio.setAttribute("webkit-playsinline", "true");
    playerRef.current = audio;
    audioRef.current = audio;

    const onPlaying = () => {
      setIsPlaying(true);
      setIsBuffering(false);
      setError(null);
    };
    const onWaiting = () => setIsBuffering(true);
    const onPause = () => setIsPlaying(false);
    const onStalled = () => setIsBuffering(true);

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("stalled", onStalled);

    return () => {
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("stalled", onStalled);
      audio.pause();
      audio.removeAttribute("src");
      playerRef.current = null;
    };
  }, []);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const audio = playerRef.current;
      const playing = Boolean(audio && !audio.paused && !audio.ended);
      let left = 0;
      let right = 0;
      if (playing) {
        const vol = Math.max(0.2, volumeRef.current);
        const target = (0.3 + Math.random() * 0.5) * vol;
        fakeLevelRef.current += (target - fakeLevelRef.current) * 0.14;
        const wobble = Math.sin(Date.now() / 160) * 0.06;
        left = Math.min(1, Math.max(0.1, fakeLevelRef.current + wobble));
        right = Math.min(
          1,
          Math.max(
            0.1,
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
    const clamped = Math.min(1, Math.max(0, next));
    setVolumeState(clamped);
    volumeRef.current = clamped;
    if (playerRef.current) {
      playerRef.current.volume = clamped;
      playerRef.current.muted = false;
    }
  }, []);

  const stop = useCallback(() => {
    playTokenRef.current += 1;
    const audio = playerRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      try {
        audio.load();
      } catch {
        /* ignore */
      }
    }
    setIsPlaying(false);
    setIsBuffering(false);
  }, []);

  const playStation = useCallback(async (station: Station) => {
    const audio = playerRef.current;
    if (!audio) {
      setError("Audio not ready — tap Power again");
      return;
    }

    const token = ++playTokenRef.current;
    setError(null);
    setIsBuffering(true);

    const vol = Math.max(0.05, volumeRef.current);
    const candidates = streamCandidates(station);
    let lastError: unknown = null;

    for (const url of candidates) {
      if (token !== playTokenRef.current) return;
      try {
        // play() must stay near the user gesture; try each candidate quickly
        await tryPlay(audio, url, vol);
        if (token !== playTokenRef.current) return;
        setIsPlaying(true);
        setIsBuffering(false);
        setError(null);
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
