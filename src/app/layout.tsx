import type { Metadata, Viewport } from "next";
import "@/styles/receiver.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vintage Receiver",
  description:
    "A full-screen vintage stereo receiver PWA for internet radio on iPhone.",
  applicationName: "Vintage Receiver",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vintage Receiver",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1a1612",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
