"use client";

import React, { useState, useEffect } from "react";
import { JoinRequestModalPreview } from "./join-request-modal-preview";
import { SignalingExchangeModal } from "./signaling-exchange-modal";
import { RoomChat } from "./room-chat";
import { MediaGrid } from "./media-grid";
import { MediaControls } from "./media-controls";
import { DeviceSettingsModal } from "./device-settings-modal";
import { HotkeyLegend } from "./hotkey-legend";
import { ReconnectBanner } from "./reconnect-banner";
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
import { Button } from "@/components/ui/button";
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
  onUpdateLocalStream?: (stream: MediaStream | null) => void;
  onCreateOfferSignal: (stream?: MediaStream | null) => void;
  onProcessSignalPayload: (payload: string, stream?: MediaStream | null) => Promise<any>;
  onAcceptJoinRequest: (req: PendingJoinRequest) => void;
  onRejectJoinRequest: (peerId: string) => void;
  onSendTextMessage: (text: string) => void;
  onSendFile: (file: File) => void;
  onSendTyping?: (isTyping?: boolean) => void;
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
  onUpdateLocalStream,
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
  const [activeTab, setActiveTab] = useState<"media" | "chat" | "signaling">("chat");
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

  // Sync localStream to WebRTC Connection Manager
  useEffect(() => {
    onUpdateLocalStream?.(localStream);
  }, [localStream, onUpdateLocalStream]);

  // Global Keyboard Shortcuts (M, V, Space push-to-talk)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger hotkeys when typing in input fields
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      if (e.key === "m" || e.key === "M") {
        toggleMic();
      } else if (e.key === "v" || e.key === "V") {
        toggleCamera();
      } else if (e.code === "Space" && isMicMuted) {
        e.preventDefault();
        toggleMic(); // Unmute while holding
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      if (e.code === "Space" && !isMicMuted) {
        toggleMic(); // Remute on keyup
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [toggleMic, toggleCamera, isMicMuted]);

  // Auto-start camera & mic stream on room entrance for real-time video/audio call
  useEffect(() => {
    let isMounted = true;
    startLocalStream().then((stream) => {
      if (isMounted && stream) {
        onCreateOfferSignal(stream);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleStartVideo = async () => {
    const stream = await startLocalStream();
    if (stream) {
      onCreateOfferSignal(stream);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-5 space-y-4 flex flex-col h-full overflow-hidden">
      {/* Reconnect Resilience Banner */}
      <ReconnectBanner
        connectionStatus={connectionStatus}
        onReconnect={() => onCreateOfferSignal(localStream)}
      />

      {/* Main Workspace Stage Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Pure P2P Workspace</h2>
            <Badge variant="success" className="capitalize text-[11px]">
              STEP-5 Complete
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Zero-backend P2P video calling, E2E chat & chunked file transfers for room{" "}
            <code className="text-indigo-400 font-mono">{roomId}</code>.
          </p>
        </div>

        {/* Tab Controls - Positioned on the Right Side */}
        <div className="flex items-center space-x-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 shrink-0 ml-auto">
          <button
            onClick={() => setActiveTab("media")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
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
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
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
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
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

      {/* Main Workspace Active Tab Viewport */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Tab 1: Audio / Video Media Grid */}
        {activeTab === "media" && (
          <div className="space-y-4 overflow-y-auto flex-1 p-1">
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
            <HotkeyLegend />
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
            onTyping={() => onSendTyping?.(true)}
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
