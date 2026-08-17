import { ManagedPeerConnection, PeerConnectionCallbacks } from "./peer-connection";

export interface ConnectionManagerCallbacks {
  onRemoteTrack?: (peerId: string, track: MediaStreamTrack, streams: readonly MediaStream[]) => void;
  onPeerConnectionStateChange?: (peerId: string, state: RTCPeerConnectionState) => void;
  onDataChannelStateChange?: (peerId: string, state: RTCDataChannelState) => void;
  onDataMessage?: (peerId: string, data: string) => void;
  onEmitSignal?: (type: "offer" | "answer" | "ice-candidate", payload: any) => void;
}

export class PeerConnectionManager {
  private localPeerId: string;
  private localDisplayName: string;
  private connections: Map<string, ManagedPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private callbacks: ConnectionManagerCallbacks;

  constructor(
    localPeerId: string,
    localDisplayName: string,
    callbacks: ConnectionManagerCallbacks = {}
  ) {
    this.localPeerId = localPeerId;
    this.localDisplayName = localDisplayName;
    this.callbacks = callbacks;
  }

  public setLocalStream(stream: MediaStream | null): void {
    this.localStream = stream;
    if (!stream) return;
    this.connections.forEach((conn) => {
      conn.addLocalStream(stream);
    });
  }

  /**
   * Deterministic Initiator Rule:
   * If localPeerId < targetPeerId, we act as Initiator and create an SDP offer.
   * If localPeerId > targetPeerId, we wait for targetPeerId to initiate the offer.
   */
  public async connectToPeer(targetPeerId: string, targetDisplayName: string): Promise<void> {
    if (this.connections.has(targetPeerId)) {
      const existing = this.connections.get(targetPeerId);
      if (existing && (existing.pc.connectionState === "connected" || existing.pc.signalingState !== "stable")) {
        return;
      }
    }

    const isInitiator = this.localPeerId < targetPeerId;
    const conn = this.getOrCreateConnection(targetPeerId, targetDisplayName);

    if (this.localStream) {
      conn.addLocalStream(this.localStream);
    }

    if (isInitiator) {
      conn.createDataChannel("pure-p2p-control");
      const offer = await conn.createOffer();

      this.callbacks.onEmitSignal?.("offer", {
        senderPeerId: this.localPeerId,
        senderName: this.localDisplayName,
        targetPeerId,
        sdp: offer.sdp,
        candidates: conn.bufferedCandidates,
      });
    }
  }

  public async handleIncomingOffer(
    senderPeerId: string,
    senderDisplayName: string,
    sdp: string,
    candidates: RTCIceCandidateInit[] = []
  ): Promise<void> {
    const conn = this.getOrCreateConnection(senderPeerId, senderDisplayName);

    if (this.localStream) {
      conn.addLocalStream(this.localStream);
    }

    const answer = await conn.createAnswer(sdp);
    if (candidates.length > 0) {
      await conn.addIceCandidates(candidates);
    }

    this.callbacks.onEmitSignal?.("answer", {
      senderPeerId: this.localPeerId,
      senderName: this.localDisplayName,
      targetPeerId: senderPeerId,
      sdp: answer.sdp,
      candidates: conn.bufferedCandidates,
    });
  }

  public async handleIncomingAnswer(
    senderPeerId: string,
    sdp: string,
    candidates: RTCIceCandidateInit[] = []
  ): Promise<void> {
    const conn = this.connections.get(senderPeerId);
    if (!conn) return;

    await conn.setAnswer(sdp);
    if (candidates.length > 0) {
      await conn.addIceCandidates(candidates);
    }
  }

  public async handleIncomingIceCandidate(
    senderPeerId: string,
    candidate: RTCIceCandidateInit
  ): Promise<void> {
    const conn = this.connections.get(senderPeerId);
    if (!conn) return;
    await conn.addIceCandidate(candidate);
  }

  public sendDataMessage(targetPeerId: string, message: string): boolean {
    const conn = this.connections.get(targetPeerId);
    if (conn) {
      return conn.send(message);
    }
    return false;
  }

  public broadcastDataMessage(message: string): void {
    this.connections.forEach((conn) => {
      conn.send(message);
    });
  }

  public closePeerConnection(peerId: string): void {
    const conn = this.connections.get(peerId);
    if (conn) {
      conn.close();
      this.connections.delete(peerId);
    }
  }

  public closeAll(): void {
    this.connections.forEach((conn) => {
      conn.close();
    });
    this.connections.clear();
  }

  private getOrCreateConnection(
    peerId: string,
    displayName: string
  ): ManagedPeerConnection {
    let conn = this.connections.get(peerId);
    if (!conn) {
      const callbacks: PeerConnectionCallbacks = {
        onIceCandidate: (candidate) => {
          this.callbacks.onEmitSignal?.("ice-candidate", {
            senderPeerId: this.localPeerId,
            targetPeerId: peerId,
            candidate: candidate.toJSON(),
          });
        },
        onConnectionStateChange: (state) => {
          this.callbacks.onPeerConnectionStateChange?.(peerId, state);
        },
        onDataChannelStateChange: (state) => {
          this.callbacks.onDataChannelStateChange?.(peerId, state);
        },
        onMessage: (data) => {
          this.callbacks.onDataMessage?.(peerId, data);
        },
        onTrack: (track, streams) => {
          this.callbacks.onRemoteTrack?.(peerId, track, streams);
        },
      };

      conn = new ManagedPeerConnection(peerId, displayName, callbacks);
      this.connections.set(peerId, conn);
    }
    return conn;
  }
}
