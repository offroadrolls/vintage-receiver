"use client";

import type { Station } from "@/data/stations";

type StationDisplayProps = {
  station: Station | null;
  powered: boolean;
  buffering?: boolean;
  error?: string | null;
};

export default function StationDisplay({
  station,
  powered,
  buffering,
  error,
}: StationDisplayProps) {
  return (
    <div className={`station-display ${powered ? "lit" : "dim"}`}>
      <div className="station-display__source">INTERNET RADIO</div>
      <div className="station-display__freq">
        {powered && station ? `${station.frequency}` : "— — —"}
        <span className="station-display__mhz">MHz</span>
      </div>
      <div className="station-display__name">
        {powered && station ? station.name : "STANDBY"}
      </div>
      <div className="station-display__meta">
        {powered && station
          ? [station.genre, station.city].filter(Boolean).join("  ·  ")
          : "POWER OFF"}
      </div>
      {powered && buffering && !error && (
        <div className="station-display__status">Tuning…</div>
      )}
      {powered && error && (
        <div className="station-display__status station-display__status--error">
          {error}
        </div>
      )}
    </div>
  );
}
