"use client";

import React from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Settings,
  PhoneOff,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaControlsProps {
  isMicMuted: boolean;
  isVideoMuted: boolean;
  isScreenSharing: boolean;
  hasLocalStream: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onStartVideo: () => void;
  onOpenSettings: () => void;
  onLeaveCall: () => void;
}

export function MediaControls({
  isMicMuted,
  isVideoMuted,
  isScreenSharing,
  hasLocalStream,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onStartVideo,
  onOpenSettings,
  onLeaveCall,
}: MediaControlsProps) {
  if (!hasLocalStream) {
    return (
      <div className="flex items-center justify-center p-4 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl">
        <Button
          onClick={onStartVideo}
          className="h-11 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30"
        >
          <Video className="h-5 w-5 mr-2" />
          <span>Enable Camera & Microphone</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center space-x-3 p-3 rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-2xl">
      {/* Mic Mute / Unmute */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleMic}
        className={`h-11 w-11 rounded-xl transition-all ${
          isMicMuted
            ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30"
            : "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
        }`}
      >
        <span title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}>
          {isMicMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </span>
      </Button>

      {/* Camera On / Off */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleCamera}
        className={`h-11 w-11 rounded-xl transition-all ${
          isVideoMuted
            ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30"
            : "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
        }`}
      >
        <span title={isVideoMuted ? "Turn On Camera" : "Turn Off Camera"}>
          {isVideoMuted ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </span>
      </Button>

      {/* Screen Share */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleScreenShare}
        className={`h-11 w-11 rounded-xl transition-all ${
          isScreenSharing
            ? "bg-indigo-600 text-white border border-indigo-400"
            : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
        }`}
      >
        <span title={isScreenSharing ? "Stop Screen Share" : "Share Screen"}>
          <Monitor className="h-5 w-5" />
        </span>
      </Button>

      {/* Device Settings */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenSettings}
        className="h-11 w-11 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
      >
        <span title="Device Settings">
          <Settings className="h-5 w-5" />
        </span>
      </Button>

      {/* End / Leave Call */}
      <Button
        onClick={onLeaveCall}
        className="h-11 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg shadow-rose-600/30 space-x-1.5"
      >
        <PhoneOff className="h-4 w-4" />
        <span className="hidden sm:inline">Leave Call</span>
      </Button>
    </div>
  );
}
