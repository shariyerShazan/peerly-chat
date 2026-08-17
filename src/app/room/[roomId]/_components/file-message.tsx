"use client";

import React from "react";
import { Download, FileText, ImageIcon, Lock } from "lucide-react";
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

      {/* Image Message - Zero Outer Padding, Clean Small Border */}
      {isImage && meta.blobUrl ? (
        <div className="relative rounded-2xl border border-slate-700/70 overflow-hidden shadow-xl max-w-xs sm:max-w-sm bg-black/60 group">
          <img
            src={meta.blobUrl}
            alt={meta.fileName}
            className="max-h-72 w-auto max-w-full object-contain block"
          />
          {/* Subtle Bottom Download Bar */}
          <div className="flex items-center justify-between p-2 bg-slate-950/90 border-t border-slate-800/80 backdrop-blur-md">
            <div className="flex flex-col truncate pr-2">
              <span className="text-[11px] font-semibold text-slate-200 truncate">{meta.fileName}</span>
              <span className="text-[10px] text-slate-400">{formatFileSize(meta.fileSize)}</span>
            </div>
            <a
              href={meta.blobUrl}
              download={meta.fileName}
              className="inline-flex items-center shrink-0 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 text-xs font-medium shadow-md transition-colors"
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              <span>Save</span>
            </a>
          </div>
        </div>
      ) : (
        /* Regular Document / Non-Image File Card */
        <div
          className={`rounded-2xl p-3 shadow-xl border backdrop-blur-md space-y-2 w-full ${
            isSelf
              ? "bg-indigo-950/80 border-indigo-500/30 text-white rounded-br-none"
              : "bg-slate-900/90 border-slate-800 text-slate-100 rounded-bl-none"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                <FileText className="h-5 w-5" />
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
                className="inline-flex items-center justify-center shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 text-xs font-semibold shadow-md transition-transform active:scale-95"
              >
                <Download className="h-4 w-4 mr-1" />
                <span>Save</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
