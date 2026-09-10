import { stations } from "@/data/stations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

type Params = { params: Promise<{ id: string }> };

/**
 * Same-origin Icecast proxy. Chrome sometimes rejects direct Icecast URLs
 * with NotSupportedError; proxying with clean audio/mpeg headers fixes it.
 */
export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const station = stations.find((s) => s.id === id);
  if (!station) {
    return new Response("Unknown station", { status: 404 });
  }

  try {
    const upstream = await fetch(station.streamUrl, {
      headers: {
        "User-Agent": "VintageReceiver/1.0 (internet radio)",
        Accept: "*/*",
        "Icy-MetaData": "0",
      },
      cache: "no-store",
      redirect: "follow",
    });

    if (!upstream.ok || !upstream.body) {
      return new Response(`Upstream error ${upstream.status}`, { status: 502 });
    }

    const contentType =
      upstream.headers.get("content-type")?.split(";")[0]?.trim() ||
      "audio/mpeg";

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType.includes("audio")
          ? contentType
          : "audio/mpeg",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Accept-Ranges": "none",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Stream proxy failed", id, error);
    return new Response("Proxy failed", { status: 502 });
  }
}
