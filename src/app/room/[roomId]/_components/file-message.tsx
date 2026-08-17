"use client";

import React from "react";
import { Download, FileText, Image as ImageIcon, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/file-transfer/file-chunker";
import { ChatMessageItem } from "@/hooks/use-p2p-room";

interface FileMessageProps {
  message: ChatMessageItem;
}

export function FileMessage({ message }: FileMessageProps) {
  const isSelf = message.isSelf;
  const meta = message.fileMeta;
  if (!meta) return null;

  const isImage = meta.fileType.startsWith("image/");

  return (
    <div
      className={`flex flex-col space-y-1 my-2 max-w-[85%] sm:max-w-[70%] ${
        isSelf ? "ml-auto items-end" : "mr-auto items-start"
      }`}
    >
      {/* Header */}
      <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 px-1">
        <span className="font-semibold text-slate-300">
          {isSelf ? "You" : message.senderName}
        </span>
        <span>•</span>
        <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <span title="Decrypted P2P File">
          <Lock className="h-3 w-3 text-emerald-400 shrink-0 inline ml-1" />
        </span>
      </div>

      {/* File Card */}
      <div
        className={`rounded-2xl p-3.5 shadow-xl border backdrop-blur-md space-y-3 w-full ${
          isSelf
            ? "bg-indigo-950/80 border-indigo-500/30 text-white rounded-br-none"
            : "bg-slate-900/90 border-slate-800 text-slate-100 rounded-bl-none"
        }`}
      >
        {/* Image Preview */}
        {isImage && meta.blobUrl && (
          <div className="overflow-hidden rounded-xl border border-slate-800 max-h-60 bg-black/40">
            <img
              src={meta.blobUrl}
              alt={meta.fileName}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        )}

        {/* File Metadata & Download button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
              {isImage ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-white truncate">
                {meta.fileName}
              </span>
              <span className="text-[10px] text-slate-400">
                {formatFileSize(meta.fileSize)} • E2E Decrypted
              </span>
            </div>
          </div>

          {meta.blobUrl && (
            <a
              href={meta.blobUrl}
              download={meta.fileName}
              className="inline-flex items-center justify-center shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 text-xs font-semibold shadow-md transition-transform active:scale-95"
            >
              <Download className="h-4 w-4 mr-1" />
              <span>Save</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
