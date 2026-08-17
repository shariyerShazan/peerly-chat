"use client";

import React, { useState } from "react";
import { User, Video, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JoinRoomNameModalProps {
  isOpen: boolean;
  initialName: string;
  onJoin: (name: string) => void;
}

export function JoinRoomNameModal({
  isOpen,
  initialName,
  onJoin,
}: JoinRoomNameModalProps) {
  const [nameInput, setNameInput] = useState(initialName || "");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setError("Please enter your name to join the call");
      return;
    }
    setError("");
    onJoin(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Icon */}
        <div className="flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-inner">
            <Video className="h-8 w-8" />
          </div>
        </div>

        {/* Modal Info */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Join P2P Encrypted Room
          </h2>
          <p className="text-xs text-slate-400">
            Please enter your name to join the room and start your real-time video/audio call.
          </p>
        </div>

        {/* Name Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
              <User className="h-3.5 w-3.5 text-indigo-400" />
              <span>Your Display Name</span>
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. Alex"
              autoFocus
              maxLength={24}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            {error && <p className="text-xs text-rose-400 mt-1.5">{error}</p>}
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>End-to-End Encrypted & Zero-Server Data Storage</span>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
          >
            <span>Join Room & Start Call</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
