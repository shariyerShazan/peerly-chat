"use client";

import React, { useState } from "react";
import { Settings, Mic, Video, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaDeviceItem } from "@/lib/webrtc/media-manager";

interface DeviceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: {
    audioInputs: MediaDeviceItem[];
    videoInputs: MediaDeviceItem[];
    audioOutputs: MediaDeviceItem[];
  };
  onSelectDevice: (type: "audio" | "video", deviceId: string) => void;
}

export function DeviceSettingsModal({
  isOpen,
  onClose,
  devices,
  onSelectDevice,
}: DeviceSettingsModalProps) {
  const [selectedAudio, setSelectedAudio] = useState("");
  const [selectedVideo, setSelectedVideo] = useState("");

  if (!isOpen) return null;

  const handleApply = () => {
    if (selectedAudio) onSelectDevice("audio", selectedAudio);
    if (selectedVideo) onSelectDevice("video", selectedVideo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Media Device Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Microphone Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
            <Mic className="h-4 w-4 text-indigo-400" />
            <span>Microphone Input</span>
          </label>
          <select
            value={selectedAudio}
            onChange={(e) => setSelectedAudio(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Default Microphone</option>
            {devices.audioInputs.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Camera Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
            <Video className="h-4 w-4 text-indigo-400" />
            <span>Camera Input</span>
          </label>
          <select
            value={selectedVideo}
            onChange={(e) => setSelectedVideo(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Default Camera</option>
            {devices.videoInputs.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose} className="h-9 px-4">
            Cancel
          </Button>
          <Button size="sm" onClick={handleApply} className="h-9 px-4 space-x-1">
            <Check className="h-4 w-4" />
            <span>Apply Settings</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
