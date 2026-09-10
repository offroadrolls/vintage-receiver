"use client";

type VUMeterProps = {
  label: string;
  level: number;
  powered: boolean;
};

/** Cream-faced amber-lit analog VU meter matching classic hi-fi look. */
export default function VUMeter({ label, level, powered }: VUMeterProps) {
  const angle = powered ? -42 + level * 84 : -42;

  return (
    <div className={`vu-meter ${powered ? "lit" : "dim"}`}>
      <div className="vu-meter__bezel">
        <div className="vu-meter__glass">
          <svg className="vu-meter__scale" viewBox="0 0 140 78" aria-hidden>
            <defs>
              <linearGradient id={`vuFace-${label.replace(/\s+/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f6ecd0" />
                <stop offset="100%" stopColor="#e8d4a4" />
              </linearGradient>
            </defs>
            <rect
              x="4"
              y="4"
              width="132"
              height="70"
              rx="3"
              fill={`url(#vuFace-${label.replace(/\s+/g, "")})`}
            />
            <path
              d="M18 62 A52 52 0 0 1 122 62"
              fill="none"
              stroke="#2a261f"
              strokeWidth="1.4"
              opacity="0.75"
            />
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map((t) => {
              const a = (-42 + t * 84) * (Math.PI / 180);
              const x1 = 70 + Math.sin(a) * 40;
              const y1 = 62 - Math.cos(a) * 40;
              const x2 = 70 + Math.sin(a) * 48;
              const y2 = 62 - Math.cos(a) * 48;
              const red = t >= 0.75;
              return (
                <line
                  key={t}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={red ? "#b42318" : "#2a261f"}
                  strokeWidth={t % 0.4 === 0 ? 1.6 : 1}
                  opacity={0.85}
                />
              );
            })}
            <text x="22" y="72" fontSize="8" fill="#2a261f" opacity="0.7">
              −20
            </text>
            <text x="62" y="20" fontSize="9" fill="#2a261f" fontWeight="600">
              VU
            </text>
            <text x="108" y="72" fontSize="8" fill="#b42318" opacity="0.9">
              +3
            </text>
          </svg>
          <div
            className="vu-meter__needle"
            style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
          />
          <div className="vu-meter__pivot" />
        </div>
      </div>
      <div className="vu-meter__label">{label}</div>
    </div>
  );
}
