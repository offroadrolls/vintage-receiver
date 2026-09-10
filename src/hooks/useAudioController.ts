"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Station } from "@/data/stations";

export type AudioControllerState = {
  isPlaying: boolean;
  isBuffering: boolean;
  error: string | null;
  volume: number;
  levels: [number, number];
  /** Kept for layout compatibility; playback uses an internal Audio element. */
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playStation: (station: Station) => Promise<void>;
  stop: () => void;
  setVolume: (volume: number) => void;
  clearError: () => void;
};

function waitForCanPlay(audio: HTMLAudioElement, timeoutMs = 8000): Promise<void> {
  if (audio.readyState >= 2) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      cleanup();
      // Live streams sometimes never hit canplay — try play anyway
      resolve();
    }, timeoutMs);

    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("Stream failed to load"));
    };
    const cleanup = () => {
      window.clearTimeout(timer);
      audio.removeEventListener("canplay", onReady);
      audio.removeEventListener("loadeddata", onReady);
      audio.removeEventListener("error", onError);
    };

    audio.addEventListener("canplay", onReady, { once: true });
    audio.addEventListener("loadeddata", onReady, { once: true });
    audio.addEventListener("error", onError, { once: true });
  });
}

/**
 * Uses a real Audio() instance (not only a React <audio> ref) so the first
 * Power press always has a playable element inside the user-gesture call stack.
 */
export function useAudioController(
  initialVolume = 0.85
): AudioControllerState {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
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
    audio.loop = false;
    audio.muted = false;
    audio.volume = volumeRef.current;
    // iOS
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
    const onError = () => {
      setIsPlaying(false);
      setIsBuffering(false);
      setError("Stream unavailable — try another station");
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
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
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
    rafRef.current = frame;
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

    try {
      audio.muted = false;
      audio.volume = Math.max(0.05, volumeRef.current);
      audio.src = station.streamUrl;

      // IMPORTANT: call play() inside the user-gesture turn.
      // Waiting for canplay first loses the gesture and Chrome blocks audio.
      const playAttempt = audio.play();

      // Don't hang forever on slow streams
      await Promise.race([
        playAttempt,
        new Promise<void>((_, reject) =>
          window.setTimeout(() => reject(new Error("Play timed out")), 12000)
        ),
      ]);

      if (token !== playTokenRef.current) return;

      setIsPlaying(true);
      setIsBuffering(false);
      setError(null);
    } catch (err) {
      if (token !== playTokenRef.current) return;

      // Retry once after a short buffer if the first play raced the network
      try {
        await waitForCanPlay(audio, 5000);
        if (token !== playTokenRef.current) return;
        await audio.play();
        if (token !== playTokenRef.current) return;
        setIsPlaying(true);
        setIsBuffering(false);
        setError(null);
        return;
      } catch (err2) {
        console.warn("Playback failed:", station.name, station.streamUrl, err, err2);
        setIsPlaying(false);
        setIsBuffering(false);
        setError("Stream unavailable — try another station");
      }
    }
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
