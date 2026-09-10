"use client";

import type { RefObject } from "react";

type AudioControllerProps = {
  audioRef: RefObject<HTMLAudioElement | null>;
};

/** Hidden audio element owned by the receiver. */
export default function AudioController({ audioRef }: AudioControllerProps) {
  return (
    <audio
      ref={audioRef}
      preload="none"
      playsInline
      aria-hidden
    />
  );
}
