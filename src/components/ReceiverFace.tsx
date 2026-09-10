"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  findNearestStation,
  stations,
  type Station,
} from "@/data/stations";
import AudioController from "@/components/AudioController";
import DecorKnob from "@/components/DecorKnob";
import PowerSwitch from "@/components/PowerSwitch";
import TuningDial from "@/components/TuningDial";
import TuningKnob from "@/components/TuningKnob";
import VolumeKnob from "@/components/VolumeKnob";
import VUMeter from "@/components/VUMeter";
import { useAudioController } from "@/hooks/useAudioController";

export default function ReceiverFace() {
  const [powered, setPowered] = useState(false);
  const poweredRef = useRef(false);
  const [dialPosition, setDialPosition] = useState(stations[0].dialPosition);
  const [activeStation, setActiveStation] = useState<Station | null>(
    stations[0]
  );
  const tuneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const audio = useAudioController(0.7);
  const playStation = audio.playStation;
  const stopAudio = audio.stop;
  const setVolume = audio.setVolume;

  const selectStation = useCallback(
    async (station: Station, shouldPlay: boolean) => {
      setDialPosition(station.dialPosition);
      setActiveStation(station);
      if (shouldPlay && poweredRef.current) {
        await playStation(station);
      }
    },
    [playStation]
  );

  const handlePower = useCallback(async () => {
    if (poweredRef.current) {
      stopAudio();
      poweredRef.current = false;
      setPowered(false);
      return;
    }

    poweredRef.current = true;
    setPowered(true);
    const station = activeStation ?? stations[0];
    setActiveStation(station);
    setDialPosition(station.dialPosition);
    await playStation(station);
  }, [activeStation, playStation, stopAudio]);

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
      }, 220);
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
      <AudioController />

      <div className="receiver-chassis">
        <div className="receiver-face">
          <header className="receiver-face__brand">
            <div className="receiver-face__model">VR-1974</div>
            <h1 className="receiver-face__name">Vintage Receiver</h1>
            <div className="receiver-face__badge">STEREO</div>
          </header>

          <div className="receiver-face__top">
            <div className="receiver-face__meters">
              <VUMeter
                label="LEFT CHANNEL"
                level={audio.levels[0]}
                powered={powered}
              />
              <VUMeter
                label="RIGHT CHANNEL"
                level={audio.levels[1]}
                powered={powered}
              />
            </div>
            <VolumeKnob
              value={audio.volume}
              powered={powered}
              onChange={setVolume}
            />
          </div>

          <TuningDial
            dialPosition={dialPosition}
            powered={powered}
            activeStation={activeStation}
            buffering={audio.isBuffering}
            error={audio.error}
            onSelectStation={(station) => {
              void selectStation(station, true);
            }}
          />

          <div className="receiver-face__controls">
            <PowerSwitch powered={powered} onToggle={() => void handlePower()} />
            <DecorKnob label="BASS" rotation={-55} />
            <DecorKnob label="TREBLE" rotation={20} />
            <DecorKnob label="BALANCE" rotation={0} />
            <DecorKnob label="SOURCE" rotation={75} />
            <TuningKnob
              value={dialPosition}
              powered={powered}
              onChange={handleTuneChange}
              onCommit={commitTune}
            />
          </div>

          <div className="receiver-face__status">
            <span className={`lamp ${powered ? "on" : ""}`} />
            <span>INTERNET RADIO</span>
            {powered && activeStation && (
              <span className="receiver-face__now">
                {activeStation.name}
                {audio.isPlaying ? "" : audio.isBuffering ? " · tuning…" : ""}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
