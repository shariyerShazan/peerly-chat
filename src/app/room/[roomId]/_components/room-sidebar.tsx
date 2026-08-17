"use client";

import React from "react";
import { Users, Crown, ShieldCheck, UserCheck, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RoomSidebarProps {
  displayName: string;
  userColor: string;
  roomId: string;
  onCopyLink: () => void;
}

export function RoomSidebar({ displayName, userColor, roomId, onCopyLink }: RoomSidebarProps) {
  return (
    <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-slate-950/60 p-4 flex flex-col justify-between space-y-6 backdrop-blur-md">
      <div className="space-y-4">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">Participants</h2>
          </div>
          <Badge variant="secondary" className="text-[11px] font-mono px-2 py-0.5">
            1 Active Peer
          </Badge>
        </div>

        {/* Member List */}
        <div className="space-y-2">
          {/* Current User */}
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr ${userColor} text-white font-bold text-sm shadow-md`}>
                {(displayName || "You").charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white flex items-center space-x-1.5">
                  <span>{displayName || "You"}</span>
                  <span className="text-[10px] text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded font-normal">
                    You
                  </span>
                </span>
                <span className="text-[11px] text-slate-400">Room Creator</span>
              </div>
            </div>
            <Crown className="h-4 w-4 text-amber-400" />
          </div>

          {/* Peer connection slot indicator */}
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-4 text-center space-y-2">
            <UserCheck className="h-5 w-5 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-400">Waiting for peer join requests...</p>
            <Button
              variant="outline"
              size="sm"
              onClick={onCopyLink}
              className="text-xs h-8 space-x-1 border-slate-700/80 hover:bg-slate-800"
            >
              <Share2 className="h-3 w-3 text-indigo-400" />
              <span>Invite Peers</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Security Info Card */}
      <div className="rounded-xl border border-slate-800/90 bg-slate-900/70 p-3 space-y-2 text-xs text-slate-400">
        <div className="flex items-center space-x-1.5 text-slate-200 font-semibold">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Local Security Architecture</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Keys stay in browser memory. No room data is stored on remote servers.
        </p>
      </div>
    </aside>
  );
}
