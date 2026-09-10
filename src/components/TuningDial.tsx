"use client";

import { stations, type Station } from "@/data/stations";

type TuningDialProps = {
  dialPosition: number;
  powered: boolean;
  activeStation: Station | null;
  onSelectStation: (station: Station) => void;
};

export default function TuningDial({
  dialPosition,
  powered,
  activeStation,
  onSelectStation,
}: TuningDialProps) {
  return (
    <div className={`tuning-dial ${powered ? "lit" : "dim"}`}>
      <div className="tuning-dial__glass">
        <div className="tuning-dial__scale">
          <div className="tuning-dial__band">FM</div>
          <div className="tuning-dial__marks" aria-hidden>
            {Array.from({ length: 21 }).map((_, i) => (
              <span
                key={i}
                className={`tuning-dial__tick ${i % 5 === 0 ? "major" : ""}`}
                style={{ left: `${(i / 20) * 100}%` }}
              />
            ))}
          </div>
          <div className="tuning-dial__freqs" aria-hidden>
            <span>88</span>
            <span>92</span>
            <span>96</span>
            <span>100</span>
            <span>104</span>
            <span>108</span>
          </div>
          <div className="tuning-dial__stations">
            {stations.map((station) => (
              <button
                key={station.id}
                type="button"
                className={`tuning-dial__station ${
                  activeStation?.id === station.id ? "active" : ""
                }`}
                style={{ left: `${station.dialPosition * 100}%` }}
                onClick={() => onSelectStation(station)}
                disabled={!powered}
                title={station.name}
              >
                <span className="tuning-dial__station-dot" />
                <span className="tuning-dial__station-label">
                  {station.frequency}
                </span>
              </button>
            ))}
          </div>
          <div
            className="tuning-dial__pointer"
            style={{ left: `${dialPosition * 100}%` }}
          />
        </div>
      </div>
      <div className="tuning-dial__caption">TUNING</div>
    </div>
  );
}
