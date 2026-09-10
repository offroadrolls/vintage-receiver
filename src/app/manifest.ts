import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vintage Receiver",
    short_name: "Receiver",
    description:
      "Internet radio that looks and feels like a 1970s stereo receiver.",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#0c0b09",
    theme_color: "#1a1612",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
