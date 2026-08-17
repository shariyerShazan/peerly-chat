"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReconnectBannerProps {
  connectionStatus: string;
  onReconnect: () => void;
}

export function ReconnectBanner({
  connectionStatus,
  onReconnect,
}: ReconnectBannerProps) {
  if (connectionStatus !== "error" && connectionStatus !== "signaling") return null;

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-center justify-between text-xs text-amber-200 backdrop-blur-md animate-in fade-in duration-300">
      <div className="flex items-center space-x-2">
        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
        <span>
          {connectionStatus === "error"
            ? "P2P connection lost or failed. Click to re-exchange signal."
            : "Awaiting WebRTC SDP signal handshake..."}
        </span>
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={onReconnect}
        className="h-7 text-[11px] px-2.5 border-amber-500/40 text-amber-200 hover:bg-amber-500/20 space-x-1"
      >
        <RefreshCw className="h-3 w-3" />
        <span>Re-Handshake</span>
      </Button>
    </div>
  );
}
