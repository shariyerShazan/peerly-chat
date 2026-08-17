"use client";

import React, { useState, useRef } from "react";
import { Send, Paperclip, Lock, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;

    onSendText(text.trim());
    setText("");
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    onTyping();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onSendFile(files[0]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
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
        className="h-11 w-11 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-900 border border-slate-800"
        title="Attach File (E2E Encrypted)"
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
        disabled={!text.trim() || disabled}
        className="h-11 px-5 rounded-xl font-semibold shadow-lg shadow-indigo-500/25"
      >
        <Send className="h-4 w-4 mr-1 sm:mr-1.5" />
        <span className="hidden sm:inline">Send</span>
      </Button>
    </form>
  );
}
