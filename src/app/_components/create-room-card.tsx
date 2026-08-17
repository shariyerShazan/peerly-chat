"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, User, MessageSquare, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { generateRoomId } from "@/lib/room-id";
import { getStoredDisplayName, setStoredDisplayName } from "@/lib/storage";

export function CreateRoomCard() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [roomName, setRoomName] = useState("Private P2P Space");
  const [previewId, setPreviewId] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setDisplayName(getStoredDisplayName());
    setPreviewId(generateRoomId());
  }, []);

  const handleRegenerateId = () => {
    setIsGenerating(true);
    setPreviewId(generateRoomId());
    setTimeout(() => setIsGenerating(false), 200);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setStoredDisplayName(displayName);
    const finalRoomId = previewId || generateRoomId();
    router.push(`/room/${finalRoomId}?name=${encodeURIComponent(roomName.trim() || "Private Space")}`);
  };

  return (
    <Card className="border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
      <CardHeader>
        <div className="flex items-center space-x-3 mb-1">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <PlusCircle className="h-6 w-6" />
          </div>
          <div>
            <CardTitle>Create Peer Room</CardTitle>
            <CardDescription>Instant encrypted P2P space. No login required.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleCreate}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <User className="h-3.5 w-3.5 text-indigo-400" />
              <span>Your Display Name</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Alex"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              maxLength={32}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-purple-400" />
              <span>Room Title</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Project Sync / Private Chat"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              maxLength={48}
            />
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Generated Temp Room ID
              </span>
              <code className="text-sm font-mono font-semibold text-indigo-300">
                {previewId || "..."}
              </code>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRegenerateId}
              title="Generate new Room ID"
            >
              <RefreshCw className={`h-4 w-4 text-slate-400 ${isGenerating ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            disabled={!displayName.trim()}
            className="w-full h-12 text-base font-semibold group"
          >
            <span>Launch P2P Room</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
