"use client";

import React, { useState } from "react";
import { JoinRequestModalPreview } from "./join-request-modal-preview";
import { SignalingExchangeModal } from "./signaling-exchange-modal";
import { RoomChat } from "./room-chat";
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
  onCreateOfferSignal: () => void;
  onProcessSignalPayload: (payload: string) => Promise<any>;
  onAcceptJoinRequest: (req: PendingJoinRequest) => void;
  onRejectJoinRequest: (peerId: string) => void;
  onSendTextMessage: (text: string) => void;
  onSendFile: (file: File) => void;
  onSendTyping: () => void;
  onClearHistory: () => void;
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
  onCreateOfferSignal,
  onProcessSignalPayload,
  onAcceptJoinRequest,
  onRejectJoinRequest,
  onSendTextMessage,
  onSendFile,
  onSendTyping,
  onClearHistory,
}: RoomStageProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "signaling" | "media">("chat");
  const isConnected = connectionStatus === "connected" || connectedPeers.length > 0;

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
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
              <h2 className="text-xl font-bold text-white tracking-tight">P2P Encrypted Workspace</h2>
              <Badge variant="success" className="capitalize">
                STEP-3 E2E Ready
              </Badge>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              WebCrypto AES-GCM-256 E2E Text & Chunked P2P File Transfer for room{" "}
              <code className="text-indigo-400 font-mono">{roomId}</code>.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
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
            <button
              onClick={() => setActiveTab("media")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                activeTab === "media"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Video className="h-3.5 w-3.5 text-purple-400" />
              <span>Audio / Video (STEP-4)</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Encrypted Chat & Chunked P2P File Transfer */}
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

        {/* Tab 2: P2P Signal Exchange Handshake */}
        {activeTab === "signaling" && (
          <SignalingExchangeModal
            activeSignal={activeSignal}
            signalType={signalType}
            connectionStatus={connectionStatus}
            onCreateOffer={onCreateOfferSignal}
            onProcessSignal={onProcessSignalPayload}
          />
        )}

        {/* Tab 3: Audio/Video Calling Roadmap */}
        {activeTab === "media" && (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/50 p-8 text-center space-y-3">
            <Video className="h-8 w-8 text-purple-400 mx-auto" />
            <h3 className="text-base font-bold text-white">P2P Audio & Video Calls</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              MediaStream microphone/camera controls, grid layout, and mute toggles will be activated in STEP-4.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
