"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  findNearestStation,
  stations,
  type Station,
} from "@/data/stations";
import AudioController from "@/components/AudioController";
import PowerSwitch from "@/components/PowerSwitch";
import StationDisplay from "@/components/StationDisplay";
import TuningDial from "@/components/TuningDial";
import TuningKnob from "@/components/TuningKnob";
import VolumeKnob from "@/components/VolumeKnob";
import VUMeter from "@/components/VUMeter";
import { useAudioController } from "@/hooks/useAudioController";

export default function ReceiverFace() {
  const [powered, setPowered] = useState(false);
  const [dialPosition, setDialPosition] = useState(stations[0].dialPosition);
  const [activeStation, setActiveStation] = useState<Station | null>(null);
  const tuneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const audio = useAudioController(0.65);

  const selectStation = useCallback(
    async (station: Station, shouldPlay: boolean) => {
      setDialPosition(station.dialPosition);
      setActiveStation(station);
      if (shouldPlay && powered) {
        await audio.playStation(station);
      }
    },
    [audio, powered]
  );

  const handlePower = useCallback(async () => {
    if (powered) {
      audio.stop();
      setPowered(false);
      return;
    }

    setPowered(true);
    const station = activeStation ?? stations[0];
    setActiveStation(station);
    setDialPosition(station.dialPosition);
    // Power-on counts as the iOS user gesture for first playback
    await audio.playStation(station);
  }, [activeStation, audio, powered]);

  const commitTune = useCallback(
    (position: number) => {
      const nearest = findNearestStation(position);
      void selectStation(nearest, true);
    },
    [selectStation]
  );

  const handleTuneChange = useCallback(
    (position: number) => {
      setDialPosition(position);
      const nearest = findNearestStation(position);
      setActiveStation(nearest);

      if (tuneTimer.current) clearTimeout(tuneTimer.current);
      tuneTimer.current = setTimeout(() => {
        commitTune(position);
      }, 280);
    },
    [commitTune]
  );

  useEffect(() => {
    return () => {
      if (tuneTimer.current) clearTimeout(tuneTimer.current);
    };
  }, []);

  return (
    <div className={`receiver-shell ${powered ? "powered" : "unpowered"}`}>
      <AudioController audioRef={audio.audioRef} />

      <div className="receiver-face">
        <header className="receiver-face__brand">
          <div className="receiver-face__model">VR-1974</div>
          <h1 className="receiver-face__name">Vintage Receiver</h1>
          <div className="receiver-face__badge">STEREO</div>
        </header>

        <div className="receiver-face__meters">
          <VUMeter label="L" level={audio.levels[0]} powered={powered} />
          <StationDisplay
            station={activeStation}
            powered={powered}
            buffering={audio.isBuffering}
            error={audio.error}
          />
          <VUMeter label="R" level={audio.levels[1]} powered={powered} />
        </div>

        <TuningDial
          dialPosition={dialPosition}
          powered={powered}
          activeStation={activeStation}
          onSelectStation={(station) => {
            void selectStation(station, true);
          }}
        />

        <div className="receiver-face__controls">
          <PowerSwitch powered={powered} onToggle={() => void handlePower()} />
          <TuningKnob
            value={dialPosition}
            powered={powered}
            onChange={handleTuneChange}
            onCommit={commitTune}
          />
          <VolumeKnob
            value={audio.volume}
            powered={powered}
            onChange={audio.setVolume}
          />
        </div>

        <footer className="receiver-face__footer">
          <span>PHONO</span>
          <span>TUNER</span>
          <span className="active-source">NET</span>
          <span>AUX</span>
        </footer>
      </div>
    </div>
  );
}
