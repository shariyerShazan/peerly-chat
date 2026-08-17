"use client";

import React, { useRef, useEffect } from "react";
import { ChatMessage } from "./chat-message";
import { FileMessage } from "./file-message";
import { MessageInput } from "./message-input";
import { Lock, Trash2, FileUp, Sparkles, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessageItem } from "@/hooks/use-p2p-room";
import { FileTransferProgress } from "@/lib/file-transfer/file-chunker";

interface RoomChatProps {
  messages: ChatMessageItem[];
  typingPeers: { [peerId: string]: string };
  activeTransfers: { [transferId: string]: FileTransferProgress };
  isConnected: boolean;
  onSendText: (text: string) => void;
  onSendFile: (file: File) => void;
  onTyping: () => void;
  onClearHistory: () => void;
}

export function RoomChat({
  messages,
  typingPeers,
  activeTransfers,
  isConnected,
  onSendText,
  onSendFile,
  onTyping,
  onClearHistory,
}: RoomChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeTransfers]);

  const typingNames = Object.values(typingPeers);
  const transferList = Object.values(activeTransfers);

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 w-full rounded-2xl border border-slate-800 bg-slate-950/80 shadow-2xl backdrop-blur-xl overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3 bg-slate-900/60">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>E2E Encrypted P2P Chat</span>
            </h3>
            <span className="text-[10px] text-slate-400 block">
              AES-GCM-256 WebCrypto • {isConnected ? "Live Direct RTCDataChannel" : "Local Storage Ready"}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isConnected && (
            <div className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md flex items-center space-x-1">
              <Radio className="h-3 w-3 animate-pulse text-amber-400" />
              <span>Waiting for Peer</span>
            </div>
          )}
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearHistory}
              className="text-xs text-slate-400 hover:text-rose-400 h-8 px-2"
              title="Clear Local Chat History"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              <span>Clear History</span>
            </Button>
          )}
        </div>
      </div>

      {/* Message Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 p-6 text-slate-500">
            <div className="p-3 rounded-full bg-slate-900 border border-slate-800">
              <Sparkles className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-300">Encrypted Channel Ready</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Messages and files sent here are encrypted using AES-GCM-256 WebCrypto before leaving your browser.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) =>
            msg.fileMeta ? (
              <FileMessage key={msg.id} message={msg} />
            ) : (
              <ChatMessage key={msg.id} message={msg} />
            )
          )
        )}
      </div>

      {/* Active File Transfers Progress Bar */}
      {transferList.length > 0 && (
        <div className="border-t border-slate-800 bg-slate-900/90 p-3 space-y-2">
          {transferList.map((t) => (
            <div key={t.transferId} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center space-x-1.5 truncate">
                  <FileUp className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">{t.fileName}</span>
                </span>
                <span className="text-[11px] font-mono text-indigo-400">
                  {t.progressPercentage}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-200"
                  style={{ width: `${t.progressPercentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Typing Indicator */}
      {typingNames.length > 0 && (
        <div className="px-4 py-1.5 bg-slate-900/40 text-[11px] text-indigo-400 italic flex items-center space-x-1.5 border-t border-slate-800/40">
          <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
          <span>{typingNames.join(", ")} {typingNames.length === 1 ? "is" : "are"} typing...</span>
        </div>
      )}

      {/* Input Box - Always enabled for seamless typing */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950">
        <MessageInput
          onSendText={onSendText}
          onSendFile={onSendFile}
          onTyping={onTyping}
          disabled={false}
        />
      </div>
    </div>
  );
}
