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
 * Editable internet-radio station list for Vintage Receiver.
 * Prefer HTTPS MP3/AAC direct stream URLs that work in Safari/iOS.
 * SomaFM ice hosts are used as a reliable starting set; swap freely.
 */
export const stations: Station[] = [
  {
    id: "highway-stereo",
    name: "Highway Stereo",
    genre: "Classic Rock",
    frequency: "88.1",
    dialPosition: 0.05,
    streamUrl: "https://ice5.somafm.com/seventies-128-aac",
    city: "San Francisco",
    description: "Left Coast seventies rock",
  },
  {
    id: "midnight-horn",
    name: "Midnight Horn",
    genre: "Jazz",
    frequency: "90.3",
    dialPosition: 0.16,
    streamUrl: "https://ice5.somafm.com/sonicuniverse-128-aac",
    city: "San Francisco",
    description: "Exploratory jazz & beyond",
  },
  {
    id: "riverfront-blues",
    name: "Riverfront Blues",
    genre: "Blues",
    frequency: "91.7",
    dialPosition: 0.26,
    streamUrl: "https://ice5.somafm.com/7soul-128-aac",
    city: "Chicago",
    description: "Soul & blues-leaning classics",
  },
  {
    id: "dust-road-radio",
    name: "Dust Road Radio",
    genre: "Country",
    frequency: "93.5",
    dialPosition: 0.36,
    streamUrl: "https://ice5.somafm.com/bootliquor-128-aac",
    city: "Austin",
    description: "Americana & outlaw country",
  },
  {
    id: "concert-hall",
    name: "Concert Hall",
    genre: "Classical",
    frequency: "95.1",
    dialPosition: 0.46,
    streamUrl: "https://classicalking.streamguys1.com/king-fm-mp3",
    city: "Seattle",
    description: "Classical King FM",
  },
  {
    id: "golden-needle",
    name: "Golden Needle",
    genre: "Oldies",
    frequency: "97.3",
    dialPosition: 0.56,
    streamUrl: "https://ice5.somafm.com/u80s-128-aac",
    city: "Los Angeles",
    description: "Underground eighties favorites",
  },
  {
    id: "soft-horizon",
    name: "Soft Horizon",
    genre: "Ambient",
    frequency: "99.9",
    dialPosition: 0.68,
    streamUrl: "https://ice5.somafm.com/dronezone-128-aac",
    city: "Portland",
    description: "Atmospheric drone & ambient",
  },
  {
    id: "grove-salad",
    name: "Grove Salad",
    genre: "Ambient",
    frequency: "101.5",
    dialPosition: 0.78,
    streamUrl: "https://ice5.somafm.com/groovesalad-128-aac",
    city: "San Francisco",
    description: "Downtempo chill beats",
  },
  {
    id: "secret-signal",
    name: "Secret Signal",
    genre: "Jazz",
    frequency: "103.7",
    dialPosition: 0.88,
    streamUrl: "https://ice5.somafm.com/secretagent-128-aac",
    city: "New York",
    description: "Spy-jazz & lounge",
  },
  {
    id: "wire-service",
    name: "Wire Service",
    genre: "News/Talk",
    frequency: "105.9",
    dialPosition: 0.97,
    streamUrl: "https://npr-ice.streamguys1.com/live.mp3",
    city: "Washington, D.C.",
    description: "Public news stream",
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
