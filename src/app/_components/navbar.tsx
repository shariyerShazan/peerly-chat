"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 transition-transform duration-300 group-hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <ShieldCheck className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
              Peerly<span className="text-indigo-500">.</span>
            </span>
            <span className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">
              Pure P2P Security
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-3">
          <a
            href="#creator"
            className="hidden sm:inline-flex items-center space-x-1.5 py-1.5 px-3 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 hover:border-indigo-500/40 text-xs font-semibold text-slate-300 hover:text-white transition-all"
          >
            <User className="h-3.5 w-3.5 text-indigo-400" />
            <span>About Creator</span>
          </a>

          <Badge variant="success" className="hidden md:inline-flex items-center space-x-1.5 py-1 px-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Backendless Ready</span>
          </Badge>

          <Badge variant="secondary" className="inline-flex items-center space-x-1 py-1 px-3 border border-slate-700/60">
            <Lock className="h-3 w-3 text-purple-400" />
            <span className="text-slate-300">E2E Encrypted</span>
          </Badge>
        </div>
      </div>
    </header>
  );
}
