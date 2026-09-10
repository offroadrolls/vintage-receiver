"use client";

type VUMeterProps = {
  label: string;
  level: number;
  powered: boolean;
};

/** Analog-style VU meter with a swinging needle. Level is 0–1. */
export default function VUMeter({ label, level, powered }: VUMeterProps) {
  const angle = powered ? -48 + level * 96 : -48;

  return (
    <div className={`vu-meter ${powered ? "lit" : "dim"}`}>
      <div className="vu-meter__glass">
        <svg className="vu-meter__scale" viewBox="0 0 120 70" aria-hidden>
          <path
            d="M12 58 A48 48 0 0 1 108 58"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            opacity="0.55"
          />
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const a = (-48 + t * 96) * (Math.PI / 180);
            const x1 = 60 + Math.sin(a) * 38;
            const y1 = 58 - Math.cos(a) * 38;
            const x2 = 60 + Math.sin(a) * 46;
            const y2 = 58 - Math.cos(a) * 46;
            return (
              <line
                key={t}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth={t >= 0.75 ? 1.6 : 1}
                opacity={t >= 0.75 ? 0.9 : 0.5}
              />
            );
          })}
          <text x="18" y="64" fontSize="7" fill="currentColor" opacity="0.7">
            −
          </text>
          <text x="56" y="22" fontSize="7" fill="currentColor" opacity="0.75">
            VU
          </text>
          <text x="96" y="64" fontSize="7" fill="#b44" opacity="0.85">
            +
          </text>
        </svg>
        <div
          className="vu-meter__needle"
          style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
        />
        <div className="vu-meter__pivot" />
      </div>
      <div className="vu-meter__label">{label}</div>
    </div>
  );
}
