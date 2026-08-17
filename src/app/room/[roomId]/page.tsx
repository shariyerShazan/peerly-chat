"use client";

import React, { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";
import { RoomHeader } from "./_components/room-header";
import { RoomSidebar } from "./_components/room-sidebar";
import { RoomStage } from "./_components/room-stage";
import { getStoredDisplayName, getStoredUserColor } from "@/lib/storage";
import { getRoomJoinUrl } from "@/lib/room-id";

interface RoomPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default function RoomPage({ params }: RoomPageProps) {
  const resolvedParams = use(params);
  const roomId = resolvedParams.roomId;
  const searchParams = useSearchParams();

  const roomNameParam = searchParams.get("name") || "Private P2P Space";
  const [displayName, setDisplayName] = useState("User");
  const [userColor, setUserColor] = useState("from-indigo-500 to-purple-600");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedName = getStoredDisplayName();
    if (savedName) {
      setDisplayName(savedName);
    }
    setUserColor(getStoredUserColor());
  }, []);

  const handleCopyLink = async () => {
    const url = getRoomJoinUrl(roomId);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Room Header */}
      <RoomHeader roomId={roomId} roomName={roomNameParam} memberCount={1} />

      {/* Main Body */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Participant Sidebar */}
        <RoomSidebar
          displayName={displayName}
          userColor={userColor}
          roomId={roomId}
          onCopyLink={handleCopyLink}
        />

        {/* Main Stage Workspace */}
        <RoomStage roomId={roomId} displayName={displayName} />
      </div>
    </div>
  );
}
