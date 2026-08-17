"use client";

import React, { useState } from "react";
import { Radio, Copy, Check, ArrowRight, ShieldCheck, HelpCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface SignalingExchangeModalProps {
  activeSignal: string | null;
  signalType: "offer" | "answer" | null;
  connectionStatus: string;
  onCreateOffer: () => void;
  onProcessSignal: (payload: string) => Promise<any>;
}

export function SignalingExchangeModal({
  activeSignal,
  signalType,
  connectionStatus,
  onCreateOffer,
  onProcessSignal,
}: SignalingExchangeModalProps) {
  const [pasteInput, setPasteInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCopySignal = async () => {
    if (!activeSignal) return;
    try {
      await navigator.clipboard.writeText(activeSignal);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!pasteInput.trim()) return;

    setIsProcessing(true);
    try {
      await onProcessSignal(pasteInput.trim());
      setPasteInput("");
    } catch (err: any) {
      setError(err?.message || "Invalid or incompatible signal payload");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Radio className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Backendless Signal Exchange</span>
              <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-300">
                P2P Signaling
              </Badge>
            </h3>
            <p className="text-xs text-slate-400">
              Direct WebRTC SDP signal exchange. Zero server interaction.
            </p>
          </div>
        </div>

        <Badge
          variant={
            connectionStatus === "connected"
              ? "success"
              : connectionStatus === "signaling"
              ? "warning"
              : "secondary"
          }
          className="capitalize text-xs px-3 py-1"
        >
          Status: {connectionStatus}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Your Local Signal */}
        <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] text-indigo-400 font-bold">1</span>
              <span>Your {signalType ? signalType.toUpperCase() : "Offer"} Code</span>
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCreateOffer}
              className="text-xs h-7 px-2 border-slate-700 hover:bg-slate-800"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              <span>Generate New Offer</span>
            </Button>
          </div>

          {activeSignal ? (
            <div className="space-y-2">
              <textarea
                readOnly
                value={activeSignal}
                rows={4}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 p-3 text-[11px] font-mono text-indigo-300 focus:outline-none resize-none select-all"
              />
              <Button
                type="button"
                onClick={handleCopySignal}
                className="w-full h-9 text-xs font-semibold"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                    <span>Copied Signal Code to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    <span>Copy Signal Code</span>
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="py-6 text-center space-y-2">
              <p className="text-xs text-slate-400">No active offer generated yet.</p>
              <Button
                type="button"
                onClick={onCreateOffer}
                className="h-9 text-xs"
              >
                Generate Offer Signal Code
              </Button>
            </div>
          )}
        </div>

        {/* Right Column: Paste Remote Signal */}
        <form onSubmit={handleProcess} className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-[10px] text-purple-400 font-bold">2</span>
              <span>Paste Peer's Signal Code</span>
            </span>

            <textarea
              placeholder="Paste Answer or Offer signal code from peer here..."
              value={pasteInput}
              onChange={(e) => {
                setPasteInput(e.target.value);
                if (error) setError(null);
              }}
              rows={4}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 p-3 text-[11px] font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />

            {error && (
              <p className="text-xs text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="secondary"
            disabled={!pasteInput.trim() || isProcessing}
            className="w-full h-10 text-xs font-semibold border-purple-500/30 hover:bg-purple-500/20"
          >
            {isProcessing ? (
              <span>Connecting Peer...</span>
            ) : (
              <>
                <span>Complete Peer Handshake</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Guide Footer */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 flex items-start space-x-2 text-xs text-slate-400">
        <HelpCircle className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong className="text-slate-200">How backendless exchange works:</strong> User A copies their Offer Signal and sends it to User B. User B pastes User A's Offer Signal and generates an Answer Signal, which User A pastes back to complete the WebRTC DataChannel connection.
        </p>
      </div>
    </div>
  );
}
