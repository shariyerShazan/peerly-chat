"use client";

import React from "react";
import { Lock, CheckCheck } from "lucide-react";
import { ChatMessageItem } from "@/hooks/use-p2p-room";

interface ChatMessageProps {
  message: ChatMessageItem;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isSelf = message.isSelf;

  return (
    <div
      className={`flex flex-col space-y-1 my-2 max-w-[85%] sm:max-w-[70%] ${isSelf ? "ml-auto items-end" : "mr-auto items-start"
        }`}
    >
      {/* Sender Header */}
      <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 px-1">
        <span className="font-semibold text-slate-300">
          {isSelf ? "You" : message.senderName}
        </span>
        <span>•</span>
        <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        {message.isEncrypted && (
          <span title="E2E Encrypted (AES-GCM-256)">
            <Lock className="h-3 w-3 text-emerald-400 shrink-0 inline ml-1" />
          </span>
        )}
      </div>

      {/* Message Bubble */}
      <div
        className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-md backdrop-blur-md ${isSelf
            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none"
            : "bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-none"
          }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
      </div>
    </div>
  );
}
