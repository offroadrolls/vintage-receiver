# Vintage Receiver

A mobile web app / PWA that turns your phone into a **1970s-style stereo receiver** for internet radio. Built for iPhone (portrait), installable to the Home Screen.

This project is standalone — it is **not** related to FoodSmart or Three Day Angel.

## Tech

- Next.js (App Router) + React + TypeScript
- Plain CSS for the brushed-aluminum UI
- HTML `<audio>` + Web Audio API (VU meters, with animated fallback)
- No database

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use Chrome DevTools device mode or an iPhone on the same network.

Production check:

```bash
npm run build
npm start
```

## Add / edit radio stations

Edit `src/data/stations.ts`. Each station needs:

| Field | Purpose |
| --- | --- |
| `name` | Display name |
| `genre` | e.g. Jazz, Classic Rock |
| `frequency` | Fake dial readout (e.g. `"97.3"`) |
| `dialPosition` | `0`–`1` position on the tuning scale |
| `streamUrl` | HTTPS direct AAC/MP3 stream URL |
| `city` / `description` | Optional |

Prefer Safari-friendly HTTPS AAC or MP3 URLs. If a stream fails on iOS, replace its `streamUrl`.

## iPhone / browser notes

- **Autoplay:** iOS blocks audio until a user gesture. Turning **Power** on (or tuning/selecting a station) starts playback.
- **Add to Home Screen:** Safari → Share → Add to Home Screen. Opens standalone via the web app manifest.
- **App volume ≠ system volume:** The VOLUME knob only controls audio inside Vintage Receiver, not the iPhone’s master volume.
- **VU meters:** Prefer live Web Audio analysis; if a stream blocks CORS analysis, meters use smoothed simulated motion while playing.
- **Failed streams:** A small “Stream unavailable” message appears; pick another station.

## Deploy to Vercel

Create a **new** Vercel project named something like `vintage-receiver`. Do **not** reuse FoodSmart or Three Day Angel projects. No env vars are required for Version 1.

### Option A — CLI

```bash
cd C:\Users\james\Projects\vintage-receiver
npx vercel login
npx vercel        # link/create project when prompted; choose a new project name
npx vercel --prod
```

### Option B — Dashboard

1. Push this folder to a new GitHub repo (separate from FoodSmart / Three Day Angel).
2. In [vercel.com/new](https://vercel.com/new), **Import** that repo.
3. Framework: Next.js. Deploy.

After deploy, open the `*.vercel.app` URL on your iPhone, then Safari → Share → **Add to Home Screen**.

## Project layout

```
src/
  components/   ReceiverFace, TuningDial, knobs, VU meters, etc.
  data/         stations.ts
  hooks/        audio + knob drag
  styles/       receiver.css
```

## Version 1 scope

Internet radio only. No Spotify/Apple Music, accounts, payments, ads, or other product integrations.
