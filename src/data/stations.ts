export type Station = {
  id: string;
  name: string;
  genre: string;
  frequency: string;
  /** 0–1 position along the tuning scale */
  dialPosition: number;
  streamUrl: string;
  city?: string;
  description?: string;
};

/**
 * HTTPS MP3 streams chosen for Chrome/Safari HTMLAudioElement compatibility.
 * Edit freely — prefer direct .mp3 endpoints over PLS/M3U playlists.
 */
export const stations: Station[] = [
  {
    id: "highway-stereo",
    name: "Highway Stereo",
    genre: "Classic Rock",
    frequency: "88.1",
    dialPosition: 0.05,
    streamUrl: "https://ice2.somafm.com/seventies-128-mp3",
    city: "San Francisco",
  },
  {
    id: "midnight-horn",
    name: "Midnight Horn",
    genre: "Jazz",
    frequency: "90.3",
    dialPosition: 0.16,
    streamUrl: "https://ice2.somafm.com/sonicuniverse-128-mp3",
    city: "San Francisco",
  },
  {
    id: "riverfront-blues",
    name: "Riverfront Blues",
    genre: "Blues",
    frequency: "91.7",
    dialPosition: 0.26,
    streamUrl: "https://ice2.somafm.com/7soul-128-mp3",
    city: "Chicago",
  },
  {
    id: "dust-road-radio",
    name: "Dust Road Radio",
    genre: "Country",
    frequency: "93.5",
    dialPosition: 0.36,
    streamUrl: "https://ice2.somafm.com/bootliquor-128-mp3",
    city: "Austin",
  },
  {
    id: "concert-hall",
    name: "Concert Hall",
    genre: "Classical",
    frequency: "95.1",
    dialPosition: 0.46,
    streamUrl: "https://ice2.somafm.com/dronezone-128-mp3",
    city: "Portland",
    description: "Ambient / instrumental stand-in",
  },
  {
    id: "golden-needle",
    name: "Golden Needle",
    genre: "Oldies",
    frequency: "97.3",
    dialPosition: 0.56,
    streamUrl: "https://ice2.somafm.com/u80s-128-mp3",
    city: "Los Angeles",
  },
  {
    id: "soft-horizon",
    name: "Soft Horizon",
    genre: "Ambient",
    frequency: "99.9",
    dialPosition: 0.68,
    streamUrl: "https://ice2.somafm.com/deepspaceone-128-mp3",
    city: "San Francisco",
  },
  {
    id: "grove-salad",
    name: "Grove Salad",
    genre: "Ambient",
    frequency: "101.5",
    dialPosition: 0.78,
    streamUrl: "https://ice2.somafm.com/groovesalad-128-mp3",
    city: "San Francisco",
  },
  {
    id: "secret-signal",
    name: "Secret Signal",
    genre: "Jazz",
    frequency: "103.7",
    dialPosition: 0.88,
    streamUrl: "https://ice2.somafm.com/secretagent-128-mp3",
    city: "New York",
  },
  {
    id: "wire-service",
    name: "Wire Service",
    genre: "News/Talk",
    frequency: "105.9",
    dialPosition: 0.97,
    streamUrl: "https://npr-ice.streamguys1.com/live.mp3",
    city: "Washington, D.C.",
  },
];

export function findNearestStation(dialPosition: number): Station {
  let best = stations[0];
  let bestDist = Math.abs(stations[0].dialPosition - dialPosition);
  for (let i = 1; i < stations.length; i++) {
    const dist = Math.abs(stations[i].dialPosition - dialPosition);
    if (dist < bestDist) {
      best = stations[i];
      bestDist = dist;
    }
  }
  return best;
}

export function stationIndex(id: string): number {
  return stations.findIndex((s) => s.id === id);
}
