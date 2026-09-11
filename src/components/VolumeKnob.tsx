"use client";

import { useCallback, useRef } from "react";
import { useKnobDrag } from "@/hooks/useKnobDrag";

type VolumeKnobProps = {
  value: number;
  powered: boolean;
  onChange: (value: number) => void;
};

/**
 * Volume control optimized for phones:
 * - Vertical fader (tap or drag) — primary control
 * - + / − buttons for precise steps
 * - Knob still turns visually (and remains draggable)
 */
export default function VolumeKnob({
  value,
  powered,
  onChange,
}: VolumeKnobProps) {
  const rotation = -135 + value * 270;
  const trackRef = useRef<HTMLDivElement | null>(null);

  const { onPointerDown: onKnobPointerDown } = useKnobDrag(value, onChange, {
    sensitivity: 0.008,
    disabled: !powered,
  });

  const setFromClientY = useCallback(
    (clientY: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      // Top of track = full volume, bottom = mute
      const ratio = 1 - (clientY - rect.top) / rect.height;
      onChange(Math.min(1, Math.max(0, ratio)));
    },
    [onChange]
  );

  const onFaderPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!powered) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setFromClientY(event.clientY);
  };

  const onFaderPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!powered) return;
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    event.preventDefault();
    setFromClientY(event.clientY);
  };

  const nudge = (delta: number) => {
    if (!powered) return;
    onChange(Math.min(1, Math.max(0, Math.round((value + delta) * 100) / 100)));
  };

  const percent = Math.round(value * 100);

  return (
    <div className={`volume-control ${powered ? "lit" : "dim"}`}>
      <div className="volume-control__main">
        <button
          type="button"
          className={`knob knob--volume ${powered ? "lit" : "dim"}`}
          style={{ transform: `rotate(${rotation}deg)` }}
          onPointerDown={onKnobPointerDown}
          aria-label="Volume knob"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          disabled={!powered}
        >
          <span className="knob__knurl" />
          <span className="knob__core" />
          <span className="knob__indicator" />
        </button>

        <div className="volume-fader">
          <div
            ref={trackRef}
            className="volume-fader__track"
            onPointerDown={onFaderPointerDown}
            onPointerMove={onFaderPointerMove}
            role="slider"
            aria-label="Volume slider"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-disabled={!powered}
          >
            <div
              className="volume-fader__fill"
              style={{ height: `${percent}%` }}
            />
            <div
              className="volume-fader__thumb"
              style={{ bottom: `calc(${percent}% - 10px)` }}
            />
          </div>
          <div className="volume-fader__scale" aria-hidden>
            <span>10</span>
            <span>5</span>
            <span>0</span>
          </div>
        </div>
      </div>

      <div className="volume-control__buttons">
        <button
          type="button"
          className="volume-step"
          disabled={!powered}
          onClick={() => nudge(-0.08)}
          aria-label="Volume down"
        >
          −
        </button>
        <span className="volume-control__readout">{percent}</span>
        <button
          type="button"
          className="volume-step"
          disabled={!powered}
          onClick={() => nudge(0.08)}
          aria-label="Volume up"
        >
          +
        </button>
      </div>

      <div className="knob-wrap__label">VOLUME</div>
    </div>
  );
}
