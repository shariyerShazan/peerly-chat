import React from "react";
import { Navbar } from "./_components/navbar";
import { LandingHero } from "./_components/landing-hero";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <main className="flex-1">
        <LandingHero />
      </main>
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4">
          <p>
            PureP2P — 100% Client-Side WebRTC Application. No server message storage, database, or backend.
          </p>
        </div>
      </footer>
    </div>
  );
}
