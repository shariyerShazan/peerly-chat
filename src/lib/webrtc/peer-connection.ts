/**
 * WebRTC Peer Connection & DataChannel & MediaTrack Lifecycle Wrapper
 * Manages RTCPeerConnection, ICE gathering, DataChannel, MediaStreams, state events, and teardown.
 */

export interface PeerConnectionCallbacks {
  onIceCandidate?: (candidate: RTCIceCandidate) => void;
  onIceGatheringComplete?: (candidates: RTCIceCandidateInit[]) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  onDataChannelStateChange?: (state: RTCDataChannelState) => void;
  onMessage?: (data: string) => void;
  onTrack?: (track: MediaStreamTrack, streams: readonly MediaStream[]) => void;
  onError?: (err: Error) => void;
}

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
];

export class ManagedPeerConnection {
  public pc: RTCPeerConnection;
  public dataChannel: RTCDataChannel | null = null;
  public peerId: string;
  public displayName: string;
  public bufferedCandidates: RTCIceCandidateInit[] = [];
  private callbacks: PeerConnectionCallbacks;
  private isClosed = false;

  constructor(
    peerId: string,
    displayName: string,
    callbacks: PeerConnectionCallbacks = {},
    customIceServers?: RTCIceServer[]
  ) {
    this.peerId = peerId;
    this.displayName = displayName;
    this.callbacks = callbacks;

    const configuration: RTCConfiguration = {
      iceServers: customIceServers || DEFAULT_ICE_SERVERS,
    };

    this.pc = new RTCPeerConnection(configuration);
    this.setupListeners();
  }

  private setupListeners(): void {
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        const candidateInit = event.candidate.toJSON();
        this.bufferedCandidates.push(candidateInit);
        this.callbacks.onIceCandidate?.(event.candidate);
      }
    };

    this.pc.onicegatheringstatechange = () => {
      if (this.pc.iceGatheringState === "complete") {
        this.callbacks.onIceGatheringComplete?.(this.bufferedCandidates);
      }
    };

    this.pc.onconnectionstatechange = () => {
      if (this.isClosed) return;
      this.callbacks.onConnectionStateChange?.(this.pc.connectionState);
    };

    this.pc.ondatachannel = (event) => {
      this.bindDataChannel(event.channel);
    };

    this.pc.ontrack = (event) => {
      this.callbacks.onTrack?.(event.track, event.streams);
    };
  }

  /**
   * Attaches local audio/video MediaStream tracks to peer connection
   */
  public addLocalStream(stream: MediaStream): void {
    stream.getTracks().forEach((track) => {
      try {
        this.pc.addTrack(track, stream);
      } catch (err) {
        console.warn(`Failed to add track ${track.kind} to peer ${this.peerId}:`, err);
      }
    });
  }

  /**
   * Host creates DataChannel before creating SDP offer
   */
  public createDataChannel(label = "pure-p2p-channel"): RTCDataChannel {
    const dc = this.pc.createDataChannel(label, {
      ordered: true,
    });
    this.bindDataChannel(dc);
    return dc;
  }

  private bindDataChannel(channel: RTCDataChannel): void {
    this.dataChannel = channel;
    this.dataChannel.onopen = () => {
      this.callbacks.onDataChannelStateChange?.("open");
    };

    this.dataChannel.onclose = () => {
      this.callbacks.onDataChannelStateChange?.("closed");
    };

    this.dataChannel.onerror = (evt) => {
      console.warn(`DataChannel error on peer ${this.peerId}:`, evt);
      this.callbacks.onError?.(new Error("RTCDataChannel error"));
    };

    this.dataChannel.onmessage = (event) => {
      this.callbacks.onMessage?.(event.data);
    };
  }

  public async createOffer(): Promise<RTCSessionDescriptionInit> {
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    return offer;
  }

  public async createAnswer(offerSdp: string): Promise<RTCSessionDescriptionInit> {
    await this.pc.setRemoteDescription(
      new RTCSessionDescription({ type: "offer", sdp: offerSdp })
    );
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    return answer;
  }

  public async setAnswer(answerSdp: string): Promise<void> {
    if (this.pc.signalingState === "stable") return;
    await this.pc.setRemoteDescription(
      new RTCSessionDescription({ type: "answer", sdp: answerSdp })
    );
  }

  public async addIceCandidates(candidates: RTCIceCandidateInit[]): Promise<void> {
    for (const cand of candidates) {
      try {
        await this.pc.addIceCandidate(new RTCIceCandidate(cand));
      } catch (err) {
        console.warn(`Failed to add ICE candidate for peer ${this.peerId}:`, err);
      }
    }
  }

  public send(data: string): boolean {
    if (this.dataChannel && this.dataChannel.readyState === "open") {
      this.dataChannel.send(data);
      return true;
    }
    return false;
  }

  public close(): void {
    if (this.isClosed) return;
    this.isClosed = true;

    if (this.dataChannel) {
      try {
        this.dataChannel.close();
      } catch {}
      this.dataChannel = null;
    }

    try {
      this.pc.close();
    } catch {}
  }
}
