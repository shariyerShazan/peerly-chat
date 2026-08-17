"use client";

import React from "react";
import Image from "next/image";
import { OWNER_PROFILE } from "@/lib/owner-profile";
import { SOCIAL_ICON_MAP } from "@/components/social-icons";
import { X, Sparkles, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatorModal({ isOpen, onClose }: CreatorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">About the Creator</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="flex items-start space-x-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-indigo-500/40 bg-slate-950 shadow-xl">
            <Image
              src={OWNER_PROFILE.profileImage}
              alt={OWNER_PROFILE.imageAlt}
              fill
              sizes="80px"
              className="object-cover object-top"
            />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-white">{OWNER_PROFILE.name}</h4>
            <p className="text-xs font-semibold text-indigo-400">{OWNER_PROFILE.role}</p>
            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              {OWNER_PROFILE.conciseSummary}
            </p>
          </div>
        </div>

        {/* Peerly Creator Statement */}
        <div className="p-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 text-xs text-slate-300 space-y-1">
          <p className="font-bold text-indigo-300 uppercase tracking-wider text-[10px]">
            Project Purpose
          </p>
          <p className="italic">{OWNER_PROFILE.peerlyInfo.creatorStatement}</p>
        </div>

        {/* Social Links Grid */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Connect
          </p>
          <div className="grid grid-cols-2 gap-2">
            {OWNER_PROFILE.socialLinks.map((link) => {
              const IconComp = SOCIAL_ICON_MAP[link.icon] || Mail;
              return (
                <a
                  key={link.label}
                  href={link.url}
                  target={link.isEmail ? "_self" : "_blank"}
                  rel={link.isEmail ? undefined : "noopener noreferrer"}
                  aria-label={`Connect via ${link.label}`}
                  className="flex items-center space-x-2 p-2.5 rounded-xl border border-slate-800 bg-slate-950/80 hover:bg-slate-800 text-xs text-slate-300 hover:text-white transition-all"
                >
                  <IconComp className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span className="truncate">{link.label}</span>
                </a>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose} className="h-9 px-4">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
