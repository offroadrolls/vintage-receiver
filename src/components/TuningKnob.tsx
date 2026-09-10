"use client";

import { useKnobDrag } from "@/hooks/useKnobDrag";

type TuningKnobProps = {
  value: number;
  powered: boolean;
  onChange: (value: number) => void;
  onCommit?: (value: number) => void;
};

export default function TuningKnob({
  value,
  powered,
  onChange,
  onCommit,
}: TuningKnobProps) {
  const rotation = -140 + value * 280;
  const { onPointerDown } = useKnobDrag(value, onChange, {
    sensitivity: 0.0035,
    disabled: !powered,
    onCommit,
  });

  return (
    <div className="knob-wrap">
      <button
        type="button"
        className={`knob knob--tuning ${powered ? "lit" : "dim"}`}
        style={{ transform: `rotate(${rotation}deg)` }}
        onPointerDown={onPointerDown}
        aria-label="Tuning knob"
        disabled={!powered}
      >
        <span className="knob__ring" />
        <span className="knob__core" />
        <span className="knob__indicator" />
      </button>
      <div className="knob-wrap__label">TUNING</div>
    </div>
  );
}
