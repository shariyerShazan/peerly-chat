"use client";

import { useState } from "react";
import Image from "next/image";
import { OWNER_PROFILE } from "@/lib/owner-profile";
import { SOCIAL_ICON_MAP } from "@/components/social-icons";
import {
  GraduationCap,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Globe,
  Mail,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AppOwnerSection() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section id="creator" className="relative py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-900 bg-slate-950/80 backdrop-blur-md overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-5xl space-y-10 relative z-10">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <Badge variant="outline" className="px-3.5 py-1 text-xs border-indigo-500/40 text-indigo-300 bg-indigo-500/10 inline-flex items-center space-x-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Behind Peerly</span>
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            About the Creator
          </h2>
          <p className="max-w-2xl mx-auto text-sm text-slate-400">
            Meet the developer behind Peerly&apos;s backendless architecture and secure peer-to-peer engineering.
          </p>
        </div>

        {/* 50% Photo / 50% Details Split Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden backdrop-blur-2xl">
          {/* Left Column (50% Photo) */}
          <div className="relative min-h-[380px] sm:min-h-[440px] md:min-h-[520px] w-full overflow-hidden bg-slate-950 group">
            <Image
              src={OWNER_PROFILE.profileImage}
              alt={OWNER_PROFILE.imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              priority
            />
            {/* Subtle Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent md:bg-gradient-to-r md:from-transparent md:via-slate-950/30 md:to-slate-950/90" />
            
            {/* Active Status Floating Badge */}
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex items-center space-x-2 rounded-full border border-slate-800/80 bg-slate-950/80 px-3.5 py-1.5 backdrop-blur-md text-xs text-slate-200 shadow-xl">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="font-medium text-slate-300">Creator & Lead Architect</span>
            </div>
          </div>

          {/* Right Column (50% Details) */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Header Info */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary" className="border border-slate-800 bg-slate-950/80 text-[11px] px-2.5 py-0.5 text-indigo-300 font-semibold">
                    Full-Stack & Backend Specialist
                  </Badge>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {OWNER_PROFILE.name}
                </h3>
                <p className="text-sm font-semibold text-indigo-400">
                  {OWNER_PROFILE.role}
                </p>
              </div>

              {/* Summary Bio */}
              <div className="space-y-2">
                <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
                  {OWNER_PROFILE.conciseSummary}
                </p>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-7 px-2 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 space-x-1"
                >
                  <span>{isExpanded ? "Show Concise Bio" : "Read Full Professional Summary"}</span>
                  {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </Button>

                {isExpanded && (
                  <div className="p-3.5 rounded-2xl border border-slate-800/80 bg-slate-950/90 text-xs leading-relaxed text-slate-300 animate-in fade-in duration-200">
                    {OWNER_PROFILE.fullSummary}
                  </div>
                )}
              </div>

              {/* Education & Open Source */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-2xl border border-slate-800/80 bg-slate-950/60 space-y-1">
                  <div className="flex items-center space-x-1.5 text-purple-400">
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Education</span>
                  </div>
                  <p className="text-xs font-bold text-slate-100">
                    {OWNER_PROFILE.education.institution}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {OWNER_PROFILE.education.degree}
                  </p>
                </div>

                <div className="p-3 rounded-2xl border border-slate-800/80 bg-slate-950/60 space-y-1">
                  <div className="flex items-center justify-between text-emerald-400">
                    <div className="flex items-center space-x-1.5">
                      <Globe className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Open Source</span>
                    </div>
                    <a
                      href={OWNER_PROFILE.openSource.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-indigo-400 hover:underline flex items-center space-x-0.5"
                    >
                      <span>GitHub</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                  <p className="text-[10px] leading-relaxed text-slate-400">
                    Node.js & NestJS ecosystem contributor.
                  </p>
                </div>
              </div>

              {/* Peerly Creator Statement */}
              <div className="p-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 space-y-1">
                <div className="flex items-center space-x-1.5 text-indigo-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                    Why Peerly?
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-300 italic">
                  &ldquo;{OWNER_PROFILE.peerlyInfo.creatorStatement}&rdquo;
                </p>
              </div>
            </div>

            {/* Social & Contact Grid */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Connect with Shariyer Shazan
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {OWNER_PROFILE.socialLinks.map((link) => {
                  const IconComponent = SOCIAL_ICON_MAP[link.icon] || Mail;
                  return (
                    <a
                      key={link.label}
                      href={link.url}
                      target={link.isEmail ? "_self" : "_blank"}
                      rel={link.isEmail ? undefined : "noopener noreferrer"}
                      aria-label={`Connect via ${link.label}`}
                      className="flex items-center space-x-2 p-2 rounded-xl border border-slate-800 bg-slate-950/80 hover:bg-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white transition-all group"
                    >
                      <IconComponent className="h-3.5 w-3.5 text-indigo-400 group-hover:scale-110 transition-transform shrink-0" />
                      <span className="text-xs font-medium truncate">{link.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
