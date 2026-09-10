"use client";

import { useKnobDrag } from "@/hooks/useKnobDrag";

type VolumeKnobProps = {
  value: number;
  powered: boolean;
  onChange: (value: number) => void;
};

export default function VolumeKnob({
  value,
  powered,
  onChange,
}: VolumeKnobProps) {
  const rotation = -135 + value * 270;
  const { onPointerDown } = useKnobDrag(value, onChange, {
    sensitivity: 0.004,
    disabled: !powered,
  });

  return (
    <div className="knob-wrap knob-wrap--volume">
      <button
        type="button"
        className={`knob knob--volume ${powered ? "lit" : "dim"}`}
        style={{ transform: `rotate(${rotation}deg)` }}
        onPointerDown={onPointerDown}
        aria-label="Volume knob"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value * 100)}
        disabled={!powered}
      >
        <span className="knob__knurl" />
        <span className="knob__core" />
        <span className="knob__indicator" />
      </button>
      <div className="knob-wrap__label">VOLUME</div>
    </div>
  );
}
