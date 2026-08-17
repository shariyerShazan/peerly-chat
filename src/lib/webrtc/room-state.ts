/**
 * P2P Room State & Control Protocol Engine
 * Maintains room membership, connection states, and control messages over RTCDataChannel.
 */

export interface PeerMember {
  peerId: string;
  displayName: string;
  isHost: boolean;
  connectionState: RTCPeerConnectionState;
  dataChannelState: RTCDataChannelState;
  joinedAt: number;
}

export type ControlMessageType =
  | "JOIN_REQUEST"
  | "JOIN_RESPONSE"
  | "PEER_LIST_SYNC"
  | "PEER_LEAVE"
  | "PING"
  | "PONG";

export interface P2PControlEnvelope {
  type: ControlMessageType;
  senderId: string;
  senderName: string;
  roomId: string;
  timestamp: number;
  payload?: any;
}

export function createControlEnvelope(
  type: ControlMessageType,
  senderId: string,
  senderName: string,
  roomId: string,
  payload?: any
): string {
  const envelope: P2PControlEnvelope = {
    type,
    senderId,
    senderName,
    roomId,
    timestamp: Date.now(),
    payload,
  };
  return JSON.stringify(envelope);
}

export function parseControlEnvelope(raw: string): P2PControlEnvelope | null {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.type || !parsed.senderId || !parsed.roomId) return null;
    return parsed as P2PControlEnvelope;
  } catch {
    return null;
  }
}
