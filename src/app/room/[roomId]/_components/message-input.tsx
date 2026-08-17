"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Lock, X, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatFileSize } from "@/lib/file-transfer/file-chunker";

interface MessageInputProps {
  onSendText: (text: string) => void;
  onSendFile: (file: File) => void;
  onTyping: () => void;
  disabled?: boolean;
}

export function MessageInput({
  onSendText,
  onSendFile,
  onTyping,
  disabled = false,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedFile) {
      setFilePreviewUrl(null);
      return;
    }

    if (selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setFilePreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setFilePreviewUrl(null);
    }
  }, [selectedFile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;

    const hasText = Boolean(text.trim());
    const hasFile = Boolean(selectedFile);

    if (!hasText && !hasFile) return;

    if (hasText) {
      onSendText(text.trim());
      setText("");
    }

    if (selectedFile) {
      onSendFile(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    onTyping();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isSendDisabled = disabled || (!text.trim() && !selectedFile);

  return (
    <div className="space-y-2">
      {/* Selected File Preview Banner */}
      {selectedFile && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-indigo-500/40 text-slate-200 shadow-md animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center space-x-3 overflow-hidden">
            {filePreviewUrl ? (
              <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-700 bg-black shrink-0">
                <img src={filePreviewUrl} alt={selectedFile.name} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
                <FileText className="h-5 w-5" />
              </div>
            )}
            <div className="flex flex-col truncate text-xs">
              <span className="font-semibold text-slate-100 truncate">{selectedFile.name}</span>
              <span className="text-[11px] text-slate-400">
                {formatFileSize(selectedFile.size)} • Ready to send
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemoveFile}
            className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 shrink-0"
            title="Remove attachment"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative flex items-center space-x-2">
        {/* File input trigger */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="h-11 w-11 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-900 border border-slate-800 shrink-0"
          title="Attach File or Image"
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        {/* Main Text Input */}
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder={disabled ? "Connect to peer to start E2E chat..." : "Type E2E encrypted message..."}
            value={text}
            onChange={handleTextChange}
            disabled={disabled}
            className="h-11 pl-4 pr-10 text-sm font-medium"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            <span title="AES-GCM-256 Encrypted">
              <Lock className="h-4 w-4 text-emerald-400 opacity-60" />
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSendDisabled}
          className="h-11 px-5 rounded-xl font-semibold shadow-lg shadow-indigo-500/25 shrink-0"
        >
          <Send className="h-4 w-4 mr-1 sm:mr-1.5" />
          <span className="hidden sm:inline">Send</span>
        </Button>
      </form>
    </div>
  );
}
