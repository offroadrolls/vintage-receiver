"use client";

type PowerSwitchProps = {
  powered: boolean;
  onToggle: () => void;
};

export default function PowerSwitch({ powered, onToggle }: PowerSwitchProps) {
  return (
    <button
      type="button"
      className={`power-switch ${powered ? "on" : "off"}`}
      onClick={onToggle}
      aria-pressed={powered}
      aria-label={powered ? "Power off" : "Power on"}
    >
      <span className="power-switch__toggle" />
      <span className="power-switch__label">POWER</span>
    </button>
  );
}
