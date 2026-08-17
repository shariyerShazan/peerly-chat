"use client";

import React, { useState } from "react";
import { JoinRequestModalPreview } from "./join-request-modal-preview";
import { SignalingExchangeModal } from "./signaling-exchange-modal";
import { RoomChat } from "./room-chat";
import { MediaGrid } from "./media-grid";
import { MediaControls } from "./media-controls";
import { DeviceSettingsModal } from "./device-settings-modal";
import { useMediaStream } from "@/hooks/use-media-stream";
import {
  MessageSquare,
  Video,
  Radio,
  Lock,
  CheckCircle2,
  Shield,
  Activity,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PendingJoinRequest, ChatMessageItem } from "@/hooks/use-p2p-room";
import { PeerMember } from "@/lib/webrtc/room-state";
import { FileTransferProgress } from "@/lib/file-transfer/file-chunker";

interface RoomStageProps {
  roomId: string;
  displayName: string;
  connectedPeers: PeerMember[];
  pendingRequests: PendingJoinRequest[];
  activeSignal: string | null;
  signalType: "offer" | "answer" | null;
  connectionStatus: string;
  messages: ChatMessageItem[];
  typingPeers: { [peerId: string]: string };
  activeTransfers: { [transferId: string]: FileTransferProgress };
  remoteStreams: { [peerId: string]: MediaStream };
  onCreateOfferSignal: (stream?: MediaStream | null) => void;
  onProcessSignalPayload: (payload: string, stream?: MediaStream | null) => Promise<any>;
  onAcceptJoinRequest: (req: PendingJoinRequest) => void;
  onRejectJoinRequest: (peerId: string) => void;
  onSendTextMessage: (text: string) => void;
  onSendFile: (file: File) => void;
  onSendTyping: () => void;
  onClearHistory: () => void;
  onLeaveRoom: () => void;
}

export function RoomStage({
  roomId,
  displayName,
  connectedPeers,
  pendingRequests,
  activeSignal,
  signalType,
  connectionStatus,
  messages,
  typingPeers,
  activeTransfers,
  remoteStreams,
  onCreateOfferSignal,
  onProcessSignalPayload,
  onAcceptJoinRequest,
  onRejectJoinRequest,
  onSendTextMessage,
  onSendFile,
  onSendTyping,
  onClearHistory,
  onLeaveRoom,
}: RoomStageProps) {
  const [activeTab, setActiveTab] = useState<"media" | "chat" | "signaling">("media");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    localStream,
    isMicMuted,
    isVideoMuted,
    isScreenSharing,
    devices,
    startLocalStream,
    stopLocalStream,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
  } = useMediaStream();

  const isConnected = connectionStatus === "connected" || connectedPeers.length > 0;

  const handleStartVideo = async () => {
    const stream = await startLocalStream();
    if (stream) {
      onCreateOfferSignal(stream);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto flex flex-col justify-between">
      <div className="space-y-6">
        {/* Admission Control Pending Join Requests */}
        <JoinRequestModalPreview
          pendingRequests={pendingRequests}
          onAccept={onAcceptJoinRequest}
          onReject={onRejectJoinRequest}
        />

        {/* Main Workspace Stage Header */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Pure P2P Workspace</h2>
                <Badge variant="success" className="capitalize">
                  STEP-4 Active
                </Badge>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Google Meet style pure P2P video calling, E2E chat & file transfers for room{" "}
                <code className="text-indigo-400 font-mono">{roomId}</code>.
              </p>
            </div>

            <div className="flex items-center space-x-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab("media")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                  activeTab === "media"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Video className="h-3.5 w-3.5" />
                <span>Audio / Video Stage</span>
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                  activeTab === "chat"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Encrypted Chat & Files</span>
              </button>
              <button
                onClick={() => setActiveTab("signaling")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                  activeTab === "signaling"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Radio className="h-3.5 w-3.5" />
                <span>P2P Handshake</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Audio / Video Media Grid */}
          {activeTab === "media" && (
            <div className="space-y-4">
              <MediaGrid
                localDisplayName={displayName}
                localStream={localStream}
                isMicMuted={isMicMuted}
                isVideoMuted={isVideoMuted}
                connectedPeers={connectedPeers}
                remoteStreams={remoteStreams}
              />
              <MediaControls
                isMicMuted={isMicMuted}
                isVideoMuted={isVideoMuted}
                isScreenSharing={isScreenSharing}
                hasLocalStream={!!localStream}
                onToggleMic={toggleMic}
                onToggleCamera={toggleCamera}
                onToggleScreenShare={toggleScreenShare}
                onStartVideo={handleStartVideo}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onLeaveCall={() => {
                  stopLocalStream();
                  onLeaveRoom();
                }}
              />
            </div>
          )}

          {/* Tab 2: Encrypted Chat & Chunked P2P File Transfer */}
          {activeTab === "chat" && (
            <RoomChat
              messages={messages}
              typingPeers={typingPeers}
              activeTransfers={activeTransfers}
              isConnected={isConnected}
              onSendText={onSendTextMessage}
              onSendFile={onSendFile}
              onTyping={onSendTyping}
              onClearHistory={onClearHistory}
            />
          )}

          {/* Tab 3: P2P Signal Exchange Handshake */}
          {activeTab === "signaling" && (
            <SignalingExchangeModal
              activeSignal={activeSignal}
              signalType={signalType}
              connectionStatus={connectionStatus}
              onCreateOffer={() => onCreateOfferSignal(localStream)}
              onProcessSignal={(payload) => onProcessSignalPayload(payload, localStream)}
            />
          )}
        </div>
      </div>

      {/* Device Settings Modal */}
      <DeviceSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        devices={devices}
        onSelectDevice={(type, id) => {
          startLocalStream(type === "audio" ? { audioId: id } : { videoId: id });
        }}
      />
    </div>
  );
}
