"use client";

import dynamic from "next/dynamic";

const ReceiverFace = dynamic(() => import("@/components/ReceiverFace"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "100dvh",
        display: "grid",
        placeItems: "center",
        background: "#0a0908",
        color: "#c4bdb0",
        letterSpacing: "0.2em",
        fontSize: 12,
      }}
    >
      VINTAGE RECEIVER
    </div>
  ),
});

export default function Home() {
  return <ReceiverFace />;
}
