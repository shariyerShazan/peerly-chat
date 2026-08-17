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

  let gridColsClass = "grid-cols-1";
  if (totalCount === 2) {
    gridColsClass = "grid-cols-1 md:grid-cols-2";
  } else if (totalCount >= 3) {
    gridColsClass = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  }

  return (
    <div className={`grid gap-4 w-full h-[520px] p-2 overflow-y-auto ${gridColsClass}`}>
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
        return (
          <PeerVideoTile
            key={peer.peerId}
            displayName={peer.displayName}
            stream={stream}
            isLocal={false}
            isMicMuted={false}
            isVideoMuted={!stream}
            userColor="from-purple-600 to-indigo-600"
          />
        );
      })}
    </div>
  );
}
