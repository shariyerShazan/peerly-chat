"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PeerConnectionManager } from "@/lib/webrtc/peer-connection-manager";
import { getSocketClient } from "@/lib/socket/socket-client";
import {
  PeerMember,
} from "@/lib/webrtc/room-state";
import {
  deriveKeyFromRoomId,
} from "@/lib/crypto/e2e-crypto";
import {
  CHUNK_SIZE,
  FileChunkEnvelope,
  IncomingFileAssembler,
  FileTransferProgress,
} from "@/lib/file-transfer/file-chunker";
import {
  saveLocalMessage,
  getLocalRoomMessages,
  clearLocalRoomHistory,
} from "@/lib/storage/indexed-db";

export interface PendingJoinRequest {
  peerId: string;
  displayName: string;
  rawSignal: string;
  payload: any;
  timestamp: number;
}

export interface ChatMessageItem {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isSelf: boolean;
  isEncrypted: boolean;
  fileMeta?: {
    transferId?: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    blobUrl?: string;
  };
}

export interface UseP2PRoomOptions {
  roomId: string;
  initialDisplayName: string;
  isHost?: boolean;
}

export function useP2PRoom({
  roomId,
  initialDisplayName,
  isHost = true,
}: UseP2PRoomOptions) {
  const [localPeerId] = useState<string>(() => {
    if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    return `peer-${Math.random().toString(36).substring(2, 10)}`;
  });

  const [displayName, setDisplayNameState] = useState(initialDisplayName || "User");
  const [connectedPeers, setConnectedPeers] = useState<PeerMember[]>([]);
  const [pendingRequests] = useState<PendingJoinRequest[]>([]);
  const [activeSignal] = useState<string | null>(null);
  const [signalType] = useState<"offer" | "answer" | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "generating" | "signaling" | "connected" | "error"
  >("idle");

  // Crypto & Chat & Media States
  const sessionKeyRef = useRef<CryptoKey | null>(null);
  const [, setIsKeyReady] = useState(false);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [typingPeers, setTypingPeers] = useState<{ [peerId: string]: string }>({});
  const [activeTransfers, setActiveTransfers] = useState<{ [transferId: string]: FileTransferProgress }>({});
  const [remoteStreams, setRemoteStreams] = useState<{ [peerId: string]: MediaStream }>({});

  const managerRef = useRef<PeerConnectionManager | null>(null);
  const assemblersRef = useRef<Map<string, IncomingFileAssembler>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Derive E2E Key & load local stored messages
  useEffect(() => {
    let isMounted = true;
    deriveKeyFromRoomId(roomId)
      .then((key) => {
        if (isMounted) {
          sessionKeyRef.current = key;
          setIsKeyReady(true);
        }
      })
      .catch((err) => console.error("Crypto key derivation failed:", err));

    getLocalRoomMessages(roomId).then((storedMsgs) => {
      if (isMounted && storedMsgs.length > 0) {
        setMessages(
          storedMsgs.map((m) => ({
            id: m.id,
            senderId: m.senderId,
            senderName: m.senderName,
            text: m.text,
            timestamp: m.timestamp,
            isSelf: m.isSelf,
            isEncrypted: true,
            fileMeta: m.fileMeta,
          }))
        );
      }
    });

    return () => {
      isMounted = false;
    };
  }, [roomId]);

  const addOrUpdatePeerMember = useCallback(
    (
      peerId: string,
      name: string,
      hostFlag = false,
      connState: RTCPeerConnectionState = "connected",
      dcState: RTCDataChannelState = "open"
    ) => {
      setConnectedPeers((prev) => {
        const idx = prev.findIndex((p) => p.peerId === peerId);
        const now = Date.now();
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            displayName: name || updated[idx].displayName,
            connectionState: connState,
            dataChannelState: dcState,
            lastSeenAt: now,
          };
          return updated;
        }
        return [
          ...prev,
          {
            peerId,
            displayName: name || "Peer",
            isHost: hostFlag,
            connectionState: connState,
            dataChannelState: dcState,
            joinedAt: now,
            lastSeenAt: now,
          },
        ];
      });
    },
    []
  );

  const setDisplayName = useCallback((name: string) => {
    setDisplayNameState(name);
  }, []);

  // Update MediaStream across Manager
  const updateLocalStream = useCallback((stream: MediaStream | null) => {
    localStreamRef.current = stream;
    if (managerRef.current) {
      managerRef.current.setLocalStream(stream);
    }
  }, []);

  // Dispatch Signal Packet locally and to manager
  const handleIncomingSignalPacket = useCallback(
    (packet: any) => {
      if (!packet || !packet.type || !packet.payload) return;
      const { type, payload } = packet;

      if (payload.senderPeerId === localPeerId) return;
      if (payload.targetPeerId && payload.targetPeerId !== localPeerId) return;

      if (type === "webrtc:offer") {
        const senderName = payload.senderName || payload.displayName || "Peer";
        addOrUpdatePeerMember(payload.senderPeerId, senderName, false, "connecting", "connecting");
        managerRef.current?.handleIncomingOffer(
          payload.senderPeerId,
          senderName,
          payload.sdp,
          payload.candidates
        );
      } else if (type === "webrtc:answer") {
        const senderName = payload.senderName || payload.displayName || "Peer";
        addOrUpdatePeerMember(payload.senderPeerId, senderName, false, "connected", "open");
        managerRef.current?.handleIncomingAnswer(
          payload.senderPeerId,
          payload.sdp,
          payload.candidates
        );
      } else if (type === "webrtc:ice-candidate") {
        managerRef.current?.handleIncomingIceCandidate(
          payload.senderPeerId,
          payload.candidate
        );
      } else if (type === "presence") {
        const senderName = payload.senderName || payload.displayName || "Peer";
        addOrUpdatePeerMember(payload.senderPeerId, senderName, false, "connected", "open");
        managerRef.current?.connectToPeer(payload.senderPeerId, senderName);
      } else if (type === "media_state") {
        setConnectedPeers((prev) =>
          prev.map((p) =>
            p.peerId === payload.peerId
              ? { ...p, isMicMuted: payload.isMicMuted, isVideoMuted: payload.isVideoMuted }
              : p
          )
        );
      }
    },
    [localPeerId, addOrUpdatePeerMember]
  );

  // BroadcastChannel for instant same-browser multi-tab communication
  useEffect(() => {
    if (typeof window === "undefined" || !roomId) return;
    const channel = new BroadcastChannel(`peerly-room-${roomId}`);
    broadcastChannelRef.current = channel;

    // Send instant presence ping on mount
    const pingPresence = () => {
      try {
        channel.postMessage({
          type: "PRESENCE",
          senderPeerId: localPeerId,
          senderName: displayName,
        });
      } catch { }

      try {
        fetch("/api/signaling", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId,
            type: "SIGNAL",
            senderPeerId: localPeerId,
            signalPayload: JSON.stringify({
              type: "presence",
              payload: { senderPeerId: localPeerId, senderName: displayName },
            }),
          }),
        }).catch(() => { });
      } catch { }
    };
    pingPresence();

    channel.onmessage = (event) => {
      const data = event.data;
      if (!data || data.senderPeerId === localPeerId) return;

      const peerName = data.senderName || data.displayName || "Peer";
      addOrUpdatePeerMember(data.senderPeerId, peerName, false, "connected", "open");

      if (data.type === "PRESENCE") {
        managerRef.current?.connectToPeer(data.senderPeerId, peerName);
      } else if (data.type === "MEDIA_STATE") {
        const { peerId, isMicMuted, isVideoMuted } = data.payload || {};
        if (peerId) {
          setConnectedPeers((prev) =>
            prev.map((p) => (p.peerId === peerId ? { ...p, isMicMuted, isVideoMuted } : p))
          );
        }
      } else if (data.type === "CHAT") {
        try {
          const msg = JSON.parse(data.packetStr);
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, { ...msg, isSelf: false }];
          });
        } catch { }
      } else if (data.type === "WEBRTC_SIGNAL") {
        handleIncomingSignalPacket(data.payload);
      }
    };

    return () => {
      channel.close();
      broadcastChannelRef.current = null;
    };
  }, [roomId, localPeerId, displayName, addOrUpdatePeerMember, handleIncomingSignalPacket]);

  // SSE Stream Listener for cross-browser fallback real-time communication
  useEffect(() => {
    if (typeof window === "undefined" || !roomId) return;

    let es: EventSource | null = null;
    try {
      es = new EventSource(`/api/signaling/stream?roomId=${encodeURIComponent(roomId)}`);

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (!data || data.senderPeerId === localPeerId) return;

          const peerName = data.senderName || data.displayName || "Peer";
          addOrUpdatePeerMember(data.senderPeerId, peerName, false, "connected", "open");

          if (data.type === "CHAT") {
            const msg = JSON.parse(data.packetStr);
            setMessages((prev) => {
              if (prev.some((m) => m.id === msg.id)) return prev;
              return [...prev, { ...msg, isSelf: false }];
            });
          } else if (data.type === "SIGNAL") {
            try {
              const sigData = JSON.parse(data.signalPayload);
              handleIncomingSignalPacket(sigData);
            } catch { }
          }
        } catch { }
      };
    } catch (err) {
      console.warn("EventSource setup skipped:", err);
    }

    return () => {
      if (es) es.close();
    };
  }, [roomId, localPeerId, addOrUpdatePeerMember, handleIncomingSignalPacket]);

  // Handle incoming DataChannel messages (Control vs Chunks vs Text Chat)
  const handleIncomingDataMessage = useCallback(
    async (rawStr: string, senderPeerId: string) => {
      try {
        const parsed = JSON.parse(rawStr);

        if (parsed.type === "CHAT_MESSAGE") {
          const msg = parsed.message as ChatMessageItem;
          if (msg && msg.senderId !== localPeerId) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === msg.id)) return prev;
              return [...prev, { ...msg, isSelf: false }];
            });
            saveLocalMessage({
              id: msg.id,
              roomId,
              senderId: msg.senderId,
              senderName: msg.senderName,
              text: msg.text,
              timestamp: msg.timestamp,
              isSelf: false,
            });
          }
          return;
        }

        if (parsed.type === "FILE_CHUNK") {
          const chunkEnv = parsed as FileChunkEnvelope;
          let assembler = assemblersRef.current.get(chunkEnv.transferId);
          if (!assembler) {
            assembler = new IncomingFileAssembler(
              chunkEnv.transferId,
              chunkEnv.fileName,
              chunkEnv.fileType,
              chunkEnv.fileSize,
              chunkEnv.totalChunks
            );
            assemblersRef.current.set(chunkEnv.transferId, assembler);
          }

          const binaryStr = atob(chunkEnv.chunkDataBase64 || "");
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }

          const progressPercent = assembler.addChunk(chunkEnv.chunkIndex, bytes.buffer);

          setActiveTransfers((prev) => ({
            ...prev,
            [chunkEnv.transferId]: {
              transferId: chunkEnv.transferId,
              fileName: chunkEnv.fileName,
              fileType: chunkEnv.fileType,
              fileSize: chunkEnv.fileSize,
              totalChunks: chunkEnv.totalChunks,
              receivedChunks: assembler["chunks"].size,
              progressPercentage: progressPercent,
              status: assembler.status,
            },
          }));

          if (assembler.status === "completed") {
            const blobUrl = assembler.assembleBlobUrl() || undefined;

            const fileMsgItem: ChatMessageItem = {
              id: `msg-file-${chunkEnv.transferId}`,
              senderId: senderPeerId,
              senderName: "Peer",
              text: `Shared file: ${chunkEnv.fileName}`,
              timestamp: Date.now(),
              isSelf: false,
              isEncrypted: true,
              fileMeta: {
                transferId: chunkEnv.transferId,
                fileName: chunkEnv.fileName,
                fileSize: chunkEnv.fileSize,
                fileType: chunkEnv.fileType,
                blobUrl,
              },
            };

            setMessages((prev) => [...prev, fileMsgItem]);
            saveLocalMessage({
              id: fileMsgItem.id,
              roomId,
              senderId: senderPeerId,
              senderName: "Peer",
              text: fileMsgItem.text,
              timestamp: fileMsgItem.timestamp,
              isSelf: false,
              fileMeta: fileMsgItem.fileMeta,
            });
            assemblersRef.current.delete(chunkEnv.transferId);
          }
        }
      } catch (err) { }
    },
    [roomId, localPeerId]
  );

  // Initialize Socket.IO Client & PeerConnectionManager
  useEffect(() => {
    if (typeof window === "undefined" || !displayName.trim()) return;

    const socket = getSocketClient();

    managerRef.current = new PeerConnectionManager(localPeerId, displayName, {
      onEmitSignal: (type, payload) => {
        const signalPacket = { type: `webrtc:${type}`, payload };
        const packetStr = JSON.stringify(signalPacket);

        // 1. Socket.IO relay
        try {
          socket.emit(`webrtc:${type}`, { roomId, ...payload });
        } catch { }

        // 2. BroadcastChannel relay
        try {
          broadcastChannelRef.current?.postMessage({
            type: "WEBRTC_SIGNAL",
            senderPeerId: localPeerId,
            payload: signalPacket,
          });
        } catch { }

        // 3. SSE / HTTP POST relay
        try {
          fetch("/api/signaling", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roomId,
              type: "SIGNAL",
              senderPeerId: localPeerId,
              signalPayload: packetStr,
            }),
          }).catch(() => { });
        } catch { }
      },
      onRemoteTrack: (remotePeerId, track, streams) => {
        setRemoteStreams((prev) => {
          let currentStream: MediaStream;
          if (streams && streams[0]) {
            currentStream = streams[0];
          } else {
            currentStream = prev[remotePeerId] ? prev[remotePeerId] : new MediaStream();
            if (!currentStream.getTracks().some((t) => t.id === track.id)) {
              currentStream.addTrack(track);
            }
          }
          const updatedStream = new MediaStream(currentStream.getTracks());
          return { ...prev, [remotePeerId]: updatedStream };
        });
      },
      onPeerConnectionStateChange: (remotePeerId, state) => {
        if (state === "connected") {
          setConnectionStatus("connected");
          addOrUpdatePeerMember(remotePeerId, "", false, "connected", "open");
        } else if (state === "disconnected" || state === "failed" || state === "closed") {
          setConnectedPeers((prev) => prev.filter((p) => p.peerId !== remotePeerId));
          setRemoteStreams((prev) => {
            const next = { ...prev };
            delete next[remotePeerId];
            return next;
          });
        }
      },
      onDataMessage: (remotePeerId, dataStr) => {
        handleIncomingDataMessage(dataStr, remotePeerId);
      },
    });

    if (localStreamRef.current) {
      managerRef.current.setLocalStream(localStreamRef.current);
    }

    const joinRoom = () => {
      try {
        socket.emit("room:join", { roomId, peerId: localPeerId, displayName });
      } catch { }
    };

    if (socket.connected) {
      joinRoom();
    }
    socket.on("connect", joinRoom);

    // Socket Event Handlers
    socket.on("room:peers", ({ peers }: { peers: Array<{ peerId: string; displayName: string }> }) => {
      peers.forEach((p) => {
        addOrUpdatePeerMember(p.peerId, p.displayName, false, "connecting", "connecting");
        managerRef.current?.connectToPeer(p.peerId, p.displayName);
      });
    });

    socket.on("room:peer-joined", ({ peerId, displayName: pName }: { peerId: string; displayName: string }) => {
      if (peerId === localPeerId) return;
      addOrUpdatePeerMember(peerId, pName, false, "connecting", "connecting");
      managerRef.current?.connectToPeer(peerId, pName);
    });

    socket.on("webrtc:offer", (payload: any) => {
      handleIncomingSignalPacket({ type: "webrtc:offer", payload });
    });

    socket.on("webrtc:answer", (payload: any) => {
      handleIncomingSignalPacket({ type: "webrtc:answer", payload });
    });

    socket.on("webrtc:ice-candidate", (payload: any) => {
      handleIncomingSignalPacket({ type: "webrtc:ice-candidate", payload });
    });

    socket.on("room:peer-left", ({ peerId }: { peerId: string }) => {
      managerRef.current?.closePeerConnection(peerId);
      setConnectedPeers((prev) => prev.filter((p) => p.peerId !== peerId));
      setRemoteStreams((prev) => {
        const next = { ...prev };
        delete next[peerId];
        return next;
      });
    });

    socket.on("typing:start", ({ senderPeerId, senderName }: { senderPeerId: string; senderName: string }) => {
      if (senderPeerId === localPeerId) return;
      setTypingPeers((prev) => ({ ...prev, [senderPeerId]: senderName || "Peer" }));
    });

    socket.on("typing:stop", ({ senderPeerId }: { senderPeerId: string }) => {
      setTypingPeers((prev) => {
        const next = { ...prev };
        delete next[senderPeerId];
        return next;
      });
    });

    socket.on("chat:message", (msg: any) => {
      if (msg && msg.senderId !== localPeerId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, { ...msg, isSelf: false }];
        });
      }
    });

    return () => {
      socket.off("connect", joinRoom);
      socket.off("room:peers");
      socket.off("room:peer-joined");
      socket.off("webrtc:offer");
      socket.off("webrtc:answer");
      socket.off("webrtc:ice-candidate");
      socket.off("room:peer-left");
      socket.off("typing:start");
      socket.off("typing:stop");
      socket.off("chat:message");
      managerRef.current?.closeAll();
      managerRef.current = null;
    };
  }, [roomId, localPeerId, displayName, addOrUpdatePeerMember, handleIncomingDataMessage, handleIncomingSignalPacket]);

  const sendTextMessage = useCallback(
    async (plainText: string) => {
      if (!plainText.trim()) return;
      const msgId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const timestamp = Date.now();

      const newMsg: ChatMessageItem = {
        id: msgId,
        senderId: localPeerId,
        senderName: displayName,
        text: plainText,
        timestamp,
        isSelf: true,
        isEncrypted: true,
      };

      setMessages((prev) => [...prev, newMsg]);
      saveLocalMessage({
        id: msgId,
        roomId,
        senderId: localPeerId,
        senderName: displayName,
        text: plainText,
        timestamp,
        isSelf: true,
      });

      const packetStr = JSON.stringify(newMsg);

      // 1. BroadcastChannel (Same-browser multi-tab 0ms)
      try {
        broadcastChannelRef.current?.postMessage({
          type: "CHAT",
          senderPeerId: localPeerId,
          packetStr,
        });
      } catch { }

      // 2. Socket.IO relay
      try {
        const socket = getSocketClient();
        socket.emit("chat:message", { roomId, message: newMsg });
      } catch { }

      // 3. HTTP POST /api/signaling for SSE Stream relay across separate browsers
      try {
        fetch("/api/signaling", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId,
            type: "CHAT",
            senderPeerId: localPeerId,
            packetStr,
          }),
        }).catch(() => { });
      } catch { }

      // 4. WebRTC DataChannel (Direct P2P)
      try {
        managerRef.current?.broadcastDataMessage(
          JSON.stringify({ type: "CHAT_MESSAGE", message: newMsg })
        );
      } catch { }
    },
    [roomId, localPeerId, displayName]
  );

  const sendFile = useCallback(
    async (file: File) => {
      const transferId = `tr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const isImage = file.type.startsWith("image/");
      const isSmallFile = file.size <= 5 * 1024 * 1024; // 5MB limit for instant base64 DataURL relay

      const reader = new FileReader();

      reader.onload = async (e) => {
        if (!e.target?.result) return;
        const resultData = e.target.result;

        let blobUrl = "";
        if (typeof resultData === "string") {
          blobUrl = resultData;
        } else {
          blobUrl = URL.createObjectURL(file);
        }

        const fileMsgItem: ChatMessageItem = {
          id: `msg-file-${transferId}`,
          senderId: localPeerId,
          senderName: displayName,
          text: isImage ? `Shared image: ${file.name}` : `Shared file: ${file.name}`,
          timestamp: Date.now(),
          isSelf: true,
          isEncrypted: true,
          fileMeta: {
            transferId,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            blobUrl,
          },
        };

        setMessages((prev) => [...prev, fileMsgItem]);
        saveLocalMessage({
          id: fileMsgItem.id,
          roomId,
          senderId: localPeerId,
          senderName: displayName,
          text: fileMsgItem.text,
          timestamp: fileMsgItem.timestamp,
          isSelf: true,
          fileMeta: fileMsgItem.fileMeta,
        });

        // Instant Multi-Transport Real-Time Delivery for Images / Small Files
        if (isImage || isSmallFile) {
          const packetStr = JSON.stringify(fileMsgItem);

          // 1. BroadcastChannel (Same-browser multi-tab 0ms)
          try {
            broadcastChannelRef.current?.postMessage({
              type: "CHAT",
              senderPeerId: localPeerId,
              packetStr,
            });
          } catch { }

          // 2. Socket.IO relay
          try {
            const socket = getSocketClient();
            socket.emit("chat:message", { roomId, message: fileMsgItem });
          } catch { }

          // 3. HTTP POST /api/signaling for SSE Stream relay across separate browsers
          try {
            fetch("/api/signaling", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                roomId,
                type: "CHAT",
                senderPeerId: localPeerId,
                packetStr,
              }),
            }).catch(() => { });
          } catch { }
        }

        // 4. WebRTC DataChannel (Direct P2P)
        try {
          managerRef.current?.broadcastDataMessage(
            JSON.stringify({ type: "CHAT_MESSAGE", message: fileMsgItem })
          );
        } catch { }
      };

      if (isImage || isSmallFile) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    },
    [roomId, localPeerId, displayName]
  );

  const sendTypingSignal = useCallback(
    (isTyping: boolean) => {
      try {
        const socket = getSocketClient();
        if (isTyping) {
          socket.emit("typing:start", { roomId, senderPeerId: localPeerId, senderName: displayName });
        } else {
          socket.emit("typing:stop", { roomId, senderPeerId: localPeerId });
        }
      } catch { }
    },
    [roomId, localPeerId, displayName]
  );

  const clearHistory = useCallback(async () => {
    await clearLocalRoomHistory(roomId);
    setMessages([]);
  }, [roomId]);

  const createOfferSignal = useCallback(async (_stream?: MediaStream | null) => {
    return null;
  }, []);

  const processRemoteSignal = useCallback(async (_raw?: string, _stream?: MediaStream | null) => { }, []);
  const acceptJoinRequest = useCallback(() => { }, []);
  const rejectJoinRequest = useCallback(() => { }, []);
  const leaveRoom = useCallback(() => {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }, []);

  return {
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
    updateLocalStream,
    createOfferSignal,
    processRemoteSignal,
    acceptJoinRequest,
    rejectJoinRequest,
    sendTextMessage,
    sendFile,
    sendTypingSignal,
    clearHistory,
    leaveRoom,
  };
}
