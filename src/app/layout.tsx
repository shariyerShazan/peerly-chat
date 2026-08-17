import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PureP2P — Secure Backendless Chat, Audio & Video",
  description:
    "100% Client-Side Pure Peer-to-Peer Encrypted Communication Web Application. No registration, no login, no backend server, no database.",
  keywords: [
    "WebRTC",
    "P2P",
    "Peer to Peer",
    "End to End Encryption",
    "Pure P2P",
    "Zero Server",
    "Backendless Chat",
    "Video Call",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
