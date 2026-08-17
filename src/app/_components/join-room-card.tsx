"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogIn, User, Link as LinkIcon, ArrowRight, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { isValidRoomId } from "@/lib/room-id";
import { getStoredDisplayName, setStoredDisplayName } from "@/lib/storage";

export function JoinRoomCard() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [roomInput, setRoomInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDisplayName(getStoredDisplayName());
  }, []);

  const parseRoomId = (input: string): string => {
    const trimmed = input.trim();
    if (trimmed.includes("/room/")) {
      const parts = trimmed.split("/room/");
      const lastPart = parts[parts.length - 1];
      return lastPart.split("?")[0].split("#")[0];
    }
    return trimmed;
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!displayName.trim()) {
      setError("Please enter your display name.");
      return;
    }

    const cleanRoomId = parseRoomId(roomInput);
    if (!cleanRoomId || !isValidRoomId(cleanRoomId)) {
      setError("Invalid Room ID format. Example: room-9f2k-8a4b");
      return;
    }

    setStoredDisplayName(displayName);
    router.push(`/room/${cleanRoomId}?role=guest`);
  };

  return (
    <Card className="border-purple-500/20 shadow-2xl shadow-purple-500/10">
      <CardHeader>
        <div className="flex items-center space-x-3 mb-1">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <LogIn className="h-6 w-6" />
          </div>
          <div>
            <CardTitle>Join Peer Room</CardTitle>
            <CardDescription>Enter a room code or paste an invite link.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleJoin}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <User className="h-3.5 w-3.5 text-purple-400" />
              <span>Your Display Name</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Jordan"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              maxLength={32}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <LinkIcon className="h-3.5 w-3.5 text-indigo-400" />
              <span>Room ID or Invite Link</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. room-9f2k-8a4b or full URL"
              value={roomInput}
              onChange={(e) => {
                setRoomInput(e.target.value);
                if (error) setError(null);
              }}
              required
              autoComplete="off"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 flex items-center space-x-2 text-xs text-rose-300">
              <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            variant="secondary"
            disabled={mounted && (!displayName.trim() || !roomInput.trim())}
            className="w-full h-12 text-base font-semibold border-purple-500/30 hover:bg-purple-500/20 group"
          >
            <span>Join Room</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
