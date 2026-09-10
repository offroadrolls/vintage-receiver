"use client";

type DecorKnobProps = {
  label: string;
  /** Visual rotation in degrees */
  rotation?: number;
  size?: "sm" | "md";
};

/** Cosmetic brushed-metal knob (Bass / Treble / Balance / Source). */
export default function DecorKnob({
  label,
  rotation = -40,
  size = "sm",
}: DecorKnobProps) {
  return (
    <div className={`decor-knob decor-knob--${size}`}>
      <div
        className="decor-knob__body"
        style={{ transform: `rotate(${rotation}deg)` }}
        aria-hidden
      >
        <span className="decor-knob__ring" />
        <span className="decor-knob__indicator" />
      </div>
      <div className="decor-knob__label">{label}</div>
    </div>
  );
}
