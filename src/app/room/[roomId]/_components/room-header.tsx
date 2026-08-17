"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Check, LogOut, Share2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getRoomJoinUrl } from "@/lib/room-id";
import { CreatorModal } from "./creator-modal";

interface RoomHeaderProps {
  roomId: string;
  roomName?: string;
  memberCount?: number;
}

export function RoomHeader({ roomId, roomName = "P2P Space", memberCount = 1 }: RoomHeaderProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [showCreatorModal, setShowCreatorModal] = useState(false);

  const handleCopyLink = async () => {
    const url = getRoomJoinUrl(roomId);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleLeave = () => {
    router.push("/");
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Brand & Room Title */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                <Shield className="h-5 w-5" />
              </div>
            </Link>

            <div className="h-5 w-px bg-slate-800 hidden sm:block" />

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-white tracking-tight">
                  {roomName}
                </h1>
                <Badge variant="outline" className="font-mono text-[10px] px-2 py-0.5 border-slate-800 text-slate-400">
                  {roomId}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Peerly • Zero Server Encrypted Room
              </p>
            </div>
          </div>

          {/* Right: Actions & Status */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreatorModal(true)}
              className="h-9 space-x-1.5 border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/40"
            >
              <User className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-xs hidden sm:inline">About Creator</span>
            </Button>

            <Badge variant="success" className="hidden sm:inline-flex items-center space-x-1.5 py-1 px-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs">Room Active</span>
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="h-9 space-x-1.5 border-slate-700/80 hover:border-indigo-500/50"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="text-xs">Invite Link</span>
                </>
              )}
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleLeave}
              className="h-9 space-x-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="text-xs hidden sm:inline">Leave</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Creator Modal */}
      <CreatorModal
        isOpen={showCreatorModal}
        onClose={() => setShowCreatorModal(false)}
      />
    </>
  );
}
