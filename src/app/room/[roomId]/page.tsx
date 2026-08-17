"use client";

import React, { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";
import { RoomHeader } from "./_components/room-header";
import { RoomSidebar } from "./_components/room-sidebar";
import { RoomStage } from "./_components/room-stage";
import { useP2PRoom } from "@/hooks/use-p2p-room";
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
  const [userColor, setUserColor] = useState("from-indigo-500 to-purple-600");
  const [showSignalingModal, setShowSignalingModal] = useState(false);

  const initialName = getStoredDisplayName() || "User";

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
    isHost: true,
  });

  useEffect(() => {
    setUserColor(getStoredUserColor());
  }, []);

  const handleCopyLink = async () => {
    const url = getRoomJoinUrl(roomId);
    try {
      await navigator.clipboard.writeText(url);
    } catch {}
  };

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Room Header */}
      <RoomHeader
        roomId={roomId}
        roomName={roomNameParam}
        memberCount={connectedPeers.length + 1}
      />

      {/* Main Layout */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Participant Sidebar */}
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
          onCreateOfferSignal={createOfferSignal}
          onProcessSignalPayload={processRemoteSignal}
          onAcceptJoinRequest={acceptJoinRequest}
          onRejectJoinRequest={rejectJoinRequest}
          onSendTextMessage={sendTextMessage}
          onSendFile={sendFile}
          onSendTyping={sendTypingSignal}
          onClearHistory={clearHistory}
        />
      </div>
    </div>
  );
}
