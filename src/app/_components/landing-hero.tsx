"use client";

import React, { useState } from "react";
import { CreateRoomCard } from "./create-room-card";
import { JoinRoomCard } from "./join-room-card";
import { BrowserCompatBanner } from "./browser-compat-banner";
import { Shield, Zap, Lock, Users, Radio, Database } from "lucide-react";

export function LandingHero() {
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");

  return (
    <section className="relative overflow-hidden py-12 lg:py-20">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading & Value Proposition */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 backdrop-blur-md">
              <Shield className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-semibold tracking-wide text-indigo-300">
                100% Pure Peer-to-Peer • Zero Server Overhead
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                Private Chat & Calls <br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Direct Between Browsers
                </span>
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
                Connect instantly with friends or team members without accounts, databases, or cloud servers. All audio, video, text messages, and files stay strictly on your device.
              </p>
            </div>

            {/* Core Feature Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md">
                <Lock className="h-5 w-5 text-indigo-400 mb-2" />
                <h3 className="text-sm font-semibold text-white">E2E Encrypted</h3>
                <p className="text-xs text-slate-400 mt-1">AES-GCM WebCrypto</p>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md">
                <Radio className="h-5 w-5 text-purple-400 mb-2" />
                <h3 className="text-sm font-semibold text-white">Direct WebRTC</h3>
                <p className="text-xs text-slate-400 mt-1">Full Mesh P2P</p>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md col-span-2 sm:col-span-1">
                <Database className="h-5 w-5 text-pink-400 mb-2" />
                <h3 className="text-sm font-semibold text-white">No Database</h3>
                <p className="text-xs text-slate-400 mt-1">Zero Cloud Trace</p>
              </div>
            </div>

            {/* Browser Support Detector */}
            <BrowserCompatBanner />
          </div>

          {/* Right Column: Create/Join Room Interactive Card */}
          <div className="lg:col-span-5">
            <div className="space-y-4">
              {/* Tab Selector */}
              <div className="flex rounded-xl border border-slate-800 bg-slate-950/80 p-1 backdrop-blur-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab("create")}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === "create"
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Create Room
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("join")}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === "join"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Join Room
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === "create" ? <CreateRoomCard /> : <JoinRoomCard />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
