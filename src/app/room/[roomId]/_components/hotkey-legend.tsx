"use client";

import React from "react";
import { Keyboard, Mic, Video, Hand } from "lucide-react";

export function HotkeyLegend() {
  return (
    <div className="flex items-center justify-between gap-2 px-4 py-2 rounded-xl border border-slate-800/80 bg-slate-950/60 text-xs text-slate-400 backdrop-blur-md">
      <div className="flex items-center space-x-2">
        <Keyboard className="h-4 w-4 text-indigo-400 shrink-0" />
        <span className="font-semibold text-slate-300">Keyboard Shortcuts:</span>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-indigo-300 border border-slate-700">M</kbd>
          <span className="text-[11px]">Toggle Mic</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-purple-300 border border-slate-700">V</kbd>
          <span className="text-[11px]">Toggle Camera</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <kbd className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-emerald-300 border border-slate-700">Space</kbd>
          <span className="text-[11px]">Hold to Talk</span>
        </div>
      </div>
    </div>
  );
}
