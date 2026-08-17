"use client";

import React, { useEffect, useRef } from "react";
import { Mic, MicOff, VideoOff, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PeerVideoTileProps {
  displayName: string;
  stream: MediaStream | null;
  isLocal?: boolean;
  isMicMuted?: boolean;
  isVideoMuted?: boolean;
  userColor?: string;
}

export function PeerVideoTile({
  displayName,
  stream,
  isLocal = false,
  isMicMuted = false,
  isVideoMuted = false,
  userColor = "from-indigo-500 to-purple-600",
}: PeerVideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const hasVideoTrack =
    stream &&
    stream.getVideoTracks().length > 0 &&
    stream.getVideoTracks().some((t) => t.enabled);

  const showAvatar = isVideoMuted || !hasVideoTrack;

  return (
    <div className="relative group flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl transition-all duration-300 w-full h-full min-h-[220px]">
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          isLocal ? "-scale-x-100" : ""
        } ${showAvatar ? "opacity-0 absolute" : "opacity-100"}`}
      />

      {/* Camera Off Fallback Avatar */}
      {showAvatar && (
        <div className="flex flex-col items-center justify-center space-y-3 p-6 text-center z-10">
          <div
            className={`flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr ${userColor} text-white font-bold text-3xl shadow-xl border border-white/10`}
          >
            {(displayName || "U").charAt(0).toUpperCase()}
          </div>
          <div className="flex items-center space-x-1 text-xs text-slate-400">
            <VideoOff className="h-3.5 w-3.5 text-rose-400" />
            <span>Camera Muted</span>
          </div>
        </div>
      )}

      {/* Top Left Tag: Name & Local/Remote badge */}
      <div className="absolute top-3 left-3 flex items-center space-x-2 z-20">
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/80 px-2.5 py-1 text-xs font-semibold text-white shadow-md backdrop-blur-md flex items-center space-x-1.5">
          <span>{displayName}</span>
          {isLocal && (
            <Badge variant="outline" className="text-[10px] py-0 px-1 text-indigo-300 border-indigo-500/40">
              You
            </Badge>
          )}
        </div>
      </div>

      {/* Bottom Right Mic Status */}
      <div className="absolute bottom-3 right-3 z-20">
        <div
          className={`p-2 rounded-xl backdrop-blur-md border shadow-md ${
            isMicMuted
              ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
              : "bg-slate-950/80 text-emerald-400 border-slate-800"
          }`}
        >
          {isMicMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </div>
      </div>
    </div>
  );
}
