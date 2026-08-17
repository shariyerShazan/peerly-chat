import React from "react";
import { Navbar } from "./_components/navbar";
import { LandingHero } from "./_components/landing-hero";
import { AppOwnerSection } from "./_components/app-owner";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <main className="flex-1">
        <LandingHero />
        <AppOwnerSection />
      </main>
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 space-y-2">
          <p className="font-medium text-slate-400">
            Peerly — 100% Backendless Peer-to-Peer Communication Application
          </p>
          <p className="text-[11px] text-slate-600">
            Built by Shariyer Shazan • WebRTC, Web Crypto & IndexedDB Powered • No Application Database or Server
          </p>
        </div>
      </footer>
    </div>
  );
}
