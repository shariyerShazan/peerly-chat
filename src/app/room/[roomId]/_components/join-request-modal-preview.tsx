"use client";

import React, { useState } from "react";
import { UserPlus, Check, X, ShieldAlert, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PendingJoinRequest } from "@/hooks/use-p2p-room";

interface JoinRequestModalProps {
  pendingRequests: PendingJoinRequest[];
  onAccept: (request: PendingJoinRequest, answerSignal?: string) => void;
  onReject: (peerId: string) => void;
}

export function JoinRequestModalPreview({
  pendingRequests,
  onAccept,
  onReject,
}: JoinRequestModalProps) {
  const [answerInput, setAnswerInput] = useState<{ [peerId: string]: string }>({});

  if (pendingRequests.length === 0) return null;

  return (
    <div className="space-y-3">
      {pendingRequests.map((req) => (
        <div
          key={req.peerId}
          className="w-full rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/90 via-slate-900/90 to-slate-950/90 p-4 shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-white">
                    {req.displayName} wants to join this room
                  </h4>
                  <Badge variant="warning" className="text-[10px] py-0.5">
                    Admission Request
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">
                  Peer ID: <code className="font-mono text-indigo-300">{req.peerId.slice(0, 8)}...</code> • WebRTC Offer Signal Received
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReject(req.peerId)}
                className="h-9 px-3 border-rose-500/30 text-rose-300 hover:bg-rose-500/20 space-x-1"
              >
                <X className="h-4 w-4" />
                <span>Reject</span>
              </Button>
              <Button
                size="sm"
                onClick={() => onAccept(req)}
                className="h-9 px-4 bg-emerald-600 hover:bg-emerald-500 text-white space-x-1 shadow-lg shadow-emerald-600/20"
              >
                <Check className="h-4 w-4" />
                <span>Accept & Connect Peer</span>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
