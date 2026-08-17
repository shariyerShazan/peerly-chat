"use client";

import React, { useState } from "react";
import { UserPlus, Check, X, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function JoinRequestModalPreview() {
  const [sampleRequest, setSampleRequest] = useState<{
    id: string;
    peerName: string;
  } | null>({
    id: "peer-demo-123",
    peerName: "Alex",
  });

  if (!sampleRequest) return null;

  return (
    <div className="w-full rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-slate-950/80 p-4 shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-bold text-white">
                {sampleRequest.peerName} wants to join this room
              </h4>
              <Badge variant="warning" className="text-[10px] py-0.5">
                Peer Request
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Incoming WebRTC connection attempt. Grant access to establish peer channels.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSampleRequest(null)}
            className="h-9 px-3 border-rose-500/30 text-rose-300 hover:bg-rose-500/20 space-x-1"
          >
            <X className="h-4 w-4" />
            <span>Reject</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setSampleRequest(null)}
            className="h-9 px-4 bg-emerald-600 hover:bg-emerald-500 text-white space-x-1 shadow-lg shadow-emerald-600/20"
          >
            <Check className="h-4 w-4" />
            <span>Accept Peer</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
