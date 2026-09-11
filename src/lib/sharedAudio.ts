/**
 * Module-level HTMLAudioElement so volume/play always target the same
 * instance — even across React Strict Mode remounts and Fast Refresh.
 */
let sharedAudio: HTMLAudioElement | null = null;

export function getSharedAudio(): HTMLAudioElement {
  if (typeof window === "undefined") {
    throw new Error("Audio only available in the browser");
  }

  if (!sharedAudio) {
    sharedAudio = document.createElement("audio");
    sharedAudio.setAttribute("playsinline", "true");
    sharedAudio.setAttribute("webkit-playsinline", "true");
    sharedAudio.preload = "auto";
    sharedAudio.controls = false;
    sharedAudio.muted = false;
    sharedAudio.volume = 1;
    sharedAudio.style.display = "none";
    document.body.appendChild(sharedAudio);
  }

  return sharedAudio;
}

export function setSharedVolume(volume: number): number {
  const clamped = Math.min(1, Math.max(0, volume));
  const audio = getSharedAudio();
  audio.volume = clamped;
  audio.muted = clamped <= 0.001;
  return clamped;
}
