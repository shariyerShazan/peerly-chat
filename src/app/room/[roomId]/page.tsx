"use client";

import React, { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";
import { RoomHeader } from "./_components/room-header";
import { RoomSidebar } from "./_components/room-sidebar";
import { RoomStage } from "./_components/room-stage";
import { JoinRoomNameModal } from "./_components/join-room-name-modal";
import { useP2PRoom } from "@/hooks/use-p2p-room";
import { getStoredDisplayName, setStoredDisplayName, getStoredUserColor } from "@/lib/storage";
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
  const [userColor, setUserColor] = useState("from-indigo-500 to-purple-600");
  const [showSignalingModal, setShowSignalingModal] = useState(false);
  const [isHost, setIsHost] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isNameConfirmed, setIsNameConfirmed] = useState(false);

  // Determine host vs guest role & initial state safely
  useEffect(() => {
    setMounted(true);
    setUserColor(getStoredUserColor());
    const storedName = getStoredDisplayName();
    if (storedName && storedName.trim()) {
      setIsNameConfirmed(true);
    }

    const isGuestRole =
      searchParams.get("role") === "guest" ||
      searchParams.get("join") === "true" ||
      searchParams.get("host") === "false" ||
      (typeof window !== "undefined" && window.location.hash.includes("signal="));

    if (isGuestRole) {
      setIsHost(false);
    }
  }, [searchParams]);

  const initialName = mounted ? getStoredDisplayName() || "" : "";

  const {
    localPeerId,
    displayName,
    setDisplayName,
    connectedPeers,
    pendingRequests,
    activeSignal,
    signalType,
    connectionStatus,
    messages,
    typingPeers,
    activeTransfers,
    remoteStreams,
    createOfferSignal,
    processRemoteSignal,
    acceptJoinRequest,
    rejectJoinRequest,
    sendTextMessage,
    sendFile,
    sendTypingSignal,
    clearHistory,
    leaveRoom,
  } = useP2PRoom({
    roomId,
    initialDisplayName: initialName,
    isHost,
  });

  const handleJoinWithName = (name: string) => {
    setDisplayName(name);
    setStoredDisplayName(name);
    setIsNameConfirmed(true);
  };

  // Auto-process URL signal hash if guest opens an invite link with #signal=
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (hash.startsWith("#signal=")) {
      try {
        const rawSignal = decodeURIComponent(hash.replace("#signal=", ""));
        if (rawSignal) {
          processRemoteSignal(rawSignal);
        }
      } catch (err) {
        console.warn("Failed to parse signal from URL hash:", err);
      }
    }
  }, [processRemoteSignal]);

  const handleCopyLink = async () => {
    let signalToSend = activeSignal;
    if (!signalToSend && createOfferSignal) {
      signalToSend = await createOfferSignal();
    }

    let url = getRoomJoinUrl(roomId);
    if (signalToSend) {
      url += `#signal=${encodeURIComponent(signalToSend)}`;
    } else {
      url += `?role=guest`;
    }

    try {
      await navigator.clipboard.writeText(url);
    } catch {}
  };

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-100 overflow-hidden" suppressHydrationWarning>
      {/* Join Room Name Modal - Prompt user to enter name before joining */}
      <JoinRoomNameModal
        isOpen={mounted && !isNameConfirmed}
        initialName={displayName}
        onJoin={handleJoinWithName}
      />

      {/* Room Header */}
      <RoomHeader
        roomId={roomId}
        roomName={roomNameParam}
        memberCount={connectedPeers.length + 1}
      />

      {/* Main Layout */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Left Participant Sidebar */}
        <RoomSidebar
          displayName={displayName}
          userColor={userColor}
          roomId={roomId}
          connectedPeers={connectedPeers}
          onCopyLink={handleCopyLink}
          onOpenSignaling={() => setShowSignalingModal(true)}
        />

        {/* Central Workspace Stage */}
        <RoomStage
          roomId={roomId}
          displayName={displayName}
          connectedPeers={connectedPeers}
          pendingRequests={pendingRequests}
          activeSignal={activeSignal}
          signalType={signalType}
          connectionStatus={connectionStatus}
          messages={messages}
          typingPeers={typingPeers}
          activeTransfers={activeTransfers}
          remoteStreams={remoteStreams}
          onCreateOfferSignal={createOfferSignal}
          onProcessSignalPayload={processRemoteSignal}
          onAcceptJoinRequest={acceptJoinRequest}
          onRejectJoinRequest={rejectJoinRequest}
          onSendTextMessage={sendTextMessage}
          onSendFile={sendFile}
          onSendTyping={sendTypingSignal}
          onClearHistory={clearHistory}
          onLeaveRoom={leaveRoom}
        />
      </div>
    </div>
  );
}
