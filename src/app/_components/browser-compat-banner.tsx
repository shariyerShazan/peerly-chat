"use client";

import React, { useEffect, useState } from "react";
import { detectBrowserCapabilities, BrowserCapabilities } from "@/lib/browser-compat";
import { CheckCircle2, AlertTriangle, Cpu, Key, Database, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function BrowserCompatBanner() {
  const [caps, setCaps] = useState<BrowserCapabilities | null>(null);

  useEffect(() => {
    setCaps(detectBrowserCapabilities());
  }, []);

  if (!caps) return null;

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-md">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl ${caps.isFullySupported ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
            {caps.isFullySupported ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">
              {caps.isFullySupported ? "Browser Support Verified" : "Capability Notice"}
            </h4>
            <p className="text-xs text-slate-400">
              {caps.isFullySupported
                ? "Your browser supports all P2P, Media & Web Crypto primitives."
                : "Some WebRTC or Web Crypto features may be limited."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={caps.webrtc ? "success" : "destructive"} className="space-x-1 py-1">
            <Cpu className="h-3 w-3" />
            <span>WebRTC</span>
          </Badge>
          <Badge variant={caps.webCrypto ? "success" : "destructive"} className="space-x-1 py-1">
            <Key className="h-3 w-3" />
            <span>WebCrypto</span>
          </Badge>
          <Badge variant={caps.mediaDevices ? "success" : "destructive"} className="space-x-1 py-1">
            <Video className="h-3 w-3" />
            <span>MediaStreams</span>
          </Badge>
          <Badge variant={caps.indexedDB ? "success" : "destructive"} className="space-x-1 py-1">
            <Database className="h-3 w-3" />
            <span>IndexedDB</span>
          </Badge>
        </div>
      </div>

      {caps.warnings.length > 0 && (
        <div className="mt-3 border-t border-slate-800/80 pt-2">
          <ul className="text-xs text-amber-400 space-y-1 list-disc list-inside">
            {caps.warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
