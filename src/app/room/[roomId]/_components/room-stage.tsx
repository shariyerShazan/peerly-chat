"use client";

import React, { useState } from "react";
import { JoinRequestModalPreview } from "./join-request-modal-preview";
import { MessageSquare, Video, Radio, Lock, FileText, CheckCircle2, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RoomStageProps {
  roomId: string;
  displayName: string;
}

export function RoomStage({ roomId, displayName }: RoomStageProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "chat" | "media">("overview");

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
      {/* Admission Control / Join Request Banner Simulation */}
      <JoinRequestModalPreview />

      {/* Main Stage Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-6">
        {/* Stage Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white tracking-tight">P2P Workspace Stage</h2>
              <Badge variant="default" className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                STEP-1 Ready
              </Badge>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Backendless WebRTC structure active for room <code className="text-indigo-400 font-mono">{roomId}</code>.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === "overview" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Architecture & Signaling
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === "chat" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Chat & Files
            </button>
            <button
              onClick={() => setActiveTab("media")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === "media" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Audio / Video
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>STEP-1 Completed</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Next.js App Router shell, dark responsive UI, display name persistence, browser capability detector.
                </p>
              </div>

              <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4 space-y-2">
                <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-sm">
                  <Radio className="h-4 w-4" />
                  <span>STEP-2 Up Next</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Backendless signaling, WebRTC DataChannel connection lifecycle, and P2P peer state distribution.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2 opacity-80">
                <div className="flex items-center space-x-2 text-purple-400 font-semibold text-sm">
                  <Lock className="h-4 w-4" />
                  <span>STEPS 3-5 Roadmap</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  WebCrypto AES-GCM encryption, chunked file transfer, audio/video MediaStream grid, and production security polish.
                </p>
              </div>
            </div>

            {/* Architecture diagram view */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-5 space-y-3 font-mono text-xs text-slate-300">
              <div className="flex items-center justify-between text-indigo-400 border-b border-slate-800 pb-2">
                <span className="font-bold flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Zero-Backend P2P Data Flow</span>
                </span>
                <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                  Client-Only Architecture
                </Badge>
              </div>
              <div className="py-2 text-slate-400 leading-loose">
                <div>[Browser A ({displayName || "You"})]</div>
                <div className="pl-4 text-indigo-400">↕ WebRTC RTCPeerConnection (RTCDataChannel + MediaStream)</div>
                <div>[Browser B (Peer)]</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "chat" && (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/50 p-8 text-center space-y-3">
            <MessageSquare className="h-8 w-8 text-indigo-400 mx-auto" />
            <h3 className="text-base font-bold text-white">E2E Encrypted Chat & File Sharing</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Text & file transfer UI will be activated in STEP-3 after establishing the P2P DataChannel connection.
            </p>
          </div>
        )}

        {activeTab === "media" && (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/50 p-8 text-center space-y-3">
            <Video className="h-8 w-8 text-purple-400 mx-auto" />
            <h3 className="text-base font-bold text-white">P2P Audio & Video Calling</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Microphone, camera controls, and responsive grid layout will be hooked up to MediaStream in STEP-4.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
