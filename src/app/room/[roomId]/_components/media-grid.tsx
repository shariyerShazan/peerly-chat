"use client";

import React from "react";
import { PeerVideoTile } from "./peer-video-tile";
import { PeerMember } from "@/lib/webrtc/room-state";

interface MediaGridProps {
  localDisplayName: string;
  localStream: MediaStream | null;
  isMicMuted: boolean;
  isVideoMuted: boolean;
  connectedPeers: PeerMember[];
  remoteStreams: { [peerId: string]: MediaStream };
  userColor?: string;
}

export function MediaGrid({
  localDisplayName,
  localStream,
  isMicMuted,
  isVideoMuted,
  connectedPeers,
  remoteStreams,
  userColor,
}: MediaGridProps) {
  const totalCount = 1 + connectedPeers.length;

  // Messenger twin / multi grid layout styling
  let gridLayoutClass = "grid-cols-1 max-w-3xl mx-auto";
  if (totalCount === 2) {
    gridLayoutClass = "grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto";
  } else if (totalCount >= 3 && totalCount <= 4) {
    gridLayoutClass = "grid-cols-1 sm:grid-cols-2 max-w-6xl mx-auto";
  } else if (totalCount >= 5) {
    gridLayoutClass = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  }

  return (
    <div className={`grid gap-4 w-full flex-1 min-h-[480px] p-2 overflow-y-auto ${gridLayoutClass}`}>
      {/* Local Video Tile */}
      <PeerVideoTile
        displayName={localDisplayName}
        stream={localStream}
        isLocal={true}
        isMicMuted={isMicMuted}
        isVideoMuted={isVideoMuted}
        userColor={userColor}
      />

      {/* Remote Video Tiles */}
      {connectedPeers.map((peer) => {
        const stream = remoteStreams[peer.peerId] || null;
        const hasVideo =
          !!stream &&
          stream.getVideoTracks().length > 0 &&
          stream.getVideoTracks().some((t) => t.enabled);

        return (
          <PeerVideoTile
            key={peer.peerId}
            displayName={peer.displayName}
            stream={stream}
            isLocal={false}
            isMicMuted={false}
            isVideoMuted={!hasVideo}
            userColor="from-purple-600 to-indigo-600"
          />
        );
      })}
    </div>
  );
}
