"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ManagedPeerConnection } from "@/lib/webrtc/peer-connection";
import {
  encodeSignalPayload,
  decodeSignalPayload,
  SignalPayload,
} from "@/lib/signaling/payload";
import {
  PeerMember,
  createControlEnvelope,
  parseControlEnvelope,
} from "@/lib/webrtc/room-state";
import {
  deriveKeyFromRoomId,
  encryptText,
  decryptText,
  encryptBuffer,
  decryptBuffer,
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
  payload: SignalPayload;
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
    transferId: string;
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
  const [pendingRequests, setPendingRequests] = useState<PendingJoinRequest[]>([]);
  const [activeSignal, setActiveSignal] = useState<string | null>(null);
  const [signalType, setSignalType] = useState<"offer" | "answer" | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "generating" | "signaling" | "connected" | "error"
  >("idle");

  // Crypto & Chat & Media States
  const sessionKeyRef = useRef<CryptoKey | null>(null);
  const [isKeyReady, setIsKeyReady] = useState(false);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [typingPeers, setTypingPeers] = useState<{ [peerId: string]: string }>({});
  const [activeTransfers, setActiveTransfers] = useState<{ [transferId: string]: FileTransferProgress }>({});
  const [remoteStreams, setRemoteStreams] = useState<{ [peerId: string]: MediaStream }>({});

  const connectionsRef = useRef<Map<string, ManagedPeerConnection>>(new Map());
  const assemblersRef = useRef<Map<string, IncomingFileAssembler>>(new Map());
  const typingTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Initialize WebCrypto session key from roomId
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
            fileMeta: m.fileMeta
              ? {
                  transferId: m.id,
                  fileName: m.fileMeta.fileName,
                  fileSize: m.fileMeta.fileSize,
                  fileType: m.fileMeta.fileType,
                  blobUrl: m.fileMeta.blobUrl,
                }
              : undefined,
          }))
        );
      }
    });

    return () => {
      isMounted = false;
    };
  }, [roomId]);

  const setDisplayName = useCallback((name: string) => {
    setDisplayNameState(name);
  }, []);

  const leaveRoom = useCallback(() => {
    connectionsRef.current.forEach((conn) => {
      try {
        conn.send(
          createControlEnvelope("PEER_LEAVE", localPeerId, displayName, roomId)
        );
      } catch {}
      conn.close();
    });
    connectionsRef.current.clear();
    setConnectedPeers([]);
    setPendingRequests([]);
    setActiveSignal(null);
    setRemoteStreams({});
    setConnectionStatus("idle");
  }, [localPeerId, displayName, roomId]);

  useEffect(() => {
    return () => {
      leaveRoom();
    };
  }, [leaveRoom]);

  const sendTextMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !sessionKeyRef.current) return;

      const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const timestamp = Date.now();

      const encrypted = await encryptText(text.trim(), sessionKeyRef.current);

      const packet = {
        type: "CHAT_MESSAGE",
        id: messageId,
        senderId: localPeerId,
        senderName: displayName,
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        timestamp,
      };

      const packetStr = JSON.stringify(packet);

      connectionsRef.current.forEach((conn) => {
        conn.send(packetStr);
      });

      const localMsg: ChatMessageItem = {
        id: messageId,
        senderId: localPeerId,
        senderName: displayName,
        text: text.trim(),
        timestamp,
        isSelf: true,
        isEncrypted: true,
      };

      setMessages((prev) => [...prev, localMsg]);

      saveLocalMessage({
        id: messageId,
        roomId,
        senderId: localPeerId,
        senderName: displayName,
        text: text.trim(),
        timestamp,
        isSelf: true,
      });
    },
    [localPeerId, displayName, roomId]
  );

  const sendFile = useCallback(
    async (file: File) => {
      if (!file || !sessionKeyRef.current) return;

      const transferId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

      const fileMsg: ChatMessageItem = {
        id: transferId,
        senderId: localPeerId,
        senderName: displayName,
        text: `Sent file: ${file.name}`,
        timestamp: Date.now(),
        isSelf: true,
        isEncrypted: true,
        fileMeta: {
          transferId,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          blobUrl: URL.createObjectURL(file),
        },
      };

      setMessages((prev) => [...prev, fileMsg]);

      setActiveTransfers((prev) => ({
        ...prev,
        [transferId]: {
          transferId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          totalChunks,
          receivedChunks: totalChunks,
          progressPercentage: 100,
          status: "completed",
        },
      }));

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const slice = file.slice(start, end);
        const arrayBuffer = await slice.arrayBuffer();

        const { ciphertextBase64, ivBase64 } = await encryptBuffer(
          arrayBuffer,
          sessionKeyRef.current
        );

        const chunkEnvelope: FileChunkEnvelope = {
          type: "FILE_CHUNK",
          transferId,
          senderId: localPeerId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          totalChunks,
          chunkIndex: i,
          chunkDataBase64: ciphertextBase64,
          ivBase64,
        };

        const jsonStr = JSON.stringify(chunkEnvelope);
        connectionsRef.current.forEach((conn) => {
          conn.send(jsonStr);
        });

        if (i % 10 === 0) {
          await new Promise((res) => setTimeout(res, 5));
        }
      }
    },
    [localPeerId, displayName]
  );

  const sendTypingSignal = useCallback(() => {
    const packet = JSON.stringify({
      type: "TYPING",
      senderId: localPeerId,
      senderName: displayName,
    });
    connectionsRef.current.forEach((conn) => {
      conn.send(packet);
    });
  }, [localPeerId, displayName]);

  const handleIncomingMessage = useCallback(
    async (rawMsg: string) => {
      try {
        const parsed = JSON.parse(rawMsg);
        if (!parsed || !parsed.type) return;

        if (parsed.type === "CHAT_MESSAGE" && sessionKeyRef.current) {
          const decryptedText = await decryptText(
            { ciphertext: parsed.ciphertext, iv: parsed.iv },
            sessionKeyRef.current
          );

          const incomingMsg: ChatMessageItem = {
            id: parsed.id,
            senderId: parsed.senderId,
            senderName: parsed.senderName,
            text: decryptedText,
            timestamp: parsed.timestamp,
            isSelf: false,
            isEncrypted: true,
          };

          setMessages((prev) => {
            if (prev.some((m) => m.id === parsed.id)) return prev;
            return [...prev, incomingMsg];
          });

          saveLocalMessage({
            id: parsed.id,
            roomId,
            senderId: parsed.senderId,
            senderName: parsed.senderName,
            text: decryptedText,
            timestamp: parsed.timestamp,
            isSelf: false,
          });
          return;
        }

        if (parsed.type === "FILE_CHUNK" && sessionKeyRef.current) {
          const chunk: FileChunkEnvelope = parsed;

          let assembler = assemblersRef.current.get(chunk.transferId);
          if (!assembler) {
            assembler = new IncomingFileAssembler(
              chunk.transferId,
              chunk.fileName,
              chunk.fileType,
              chunk.fileSize,
              chunk.totalChunks
            );
            assemblersRef.current.set(chunk.transferId, assembler);
          }

          const decryptedChunkBuffer = await decryptBuffer(
            chunk.chunkDataBase64,
            chunk.ivBase64,
            sessionKeyRef.current
          );

          const progress = assembler.addChunk(chunk.chunkIndex, decryptedChunkBuffer);

          setActiveTransfers((prev) => ({
            ...prev,
            [chunk.transferId]: {
              transferId: chunk.transferId,
              fileName: chunk.fileName,
              fileType: chunk.fileType,
              fileSize: chunk.fileSize,
              totalChunks: chunk.totalChunks,
              receivedChunks: chunk.chunkIndex + 1,
              progressPercentage: progress,
              status: assembler.status,
            },
          }));

          if (assembler.status === "completed") {
            const blobUrl = assembler.assembleBlobUrl();
            if (blobUrl) {
              const fileMsg: ChatMessageItem = {
                id: chunk.transferId,
                senderId: chunk.senderId,
                senderName: chunk.fileName,
                text: `Received file: ${chunk.fileName}`,
                timestamp: Date.now(),
                isSelf: false,
                isEncrypted: true,
                fileMeta: {
                  transferId: chunk.transferId,
                  fileName: chunk.fileName,
                  fileSize: chunk.fileSize,
                  fileType: chunk.fileType,
                  blobUrl,
                },
              };

              setMessages((prev) => [...prev, fileMsg]);
            }
          }
          return;
        }

        if (parsed.type === "TYPING") {
          const peerId = parsed.senderId;
          const peerName = parsed.senderName;

          setTypingPeers((prev) => ({ ...prev, [peerId]: peerName }));

          if (typingTimersRef.current.has(peerId)) {
            clearTimeout(typingTimersRef.current.get(peerId)!);
          }

          const timer = setTimeout(() => {
            setTypingPeers((prev) => {
              const next = { ...prev };
              delete next[peerId];
              return next;
            });
          }, 3000);

          typingTimersRef.current.set(peerId, timer);
          return;
        }

        if (parsed.type === "PEER_LEAVE") {
          setConnectedPeers((prev) => prev.filter((p) => p.peerId !== parsed.senderId));
          setRemoteStreams((prev) => {
            const next = { ...prev };
            delete next[parsed.senderId];
            return next;
          });
        }
      } catch (err) {
        console.warn("Failed to parse incoming DataChannel message:", err);
      }
    },
    [roomId]
  );

  const createOfferSignal = useCallback(
    async (localStream?: MediaStream | null) => {
      setConnectionStatus("generating");
      try {
        const peerConn = new ManagedPeerConnection(
          localPeerId,
          displayName,
          {
            onConnectionStateChange: (state) => {
              updatePeerState(localPeerId, state);
            },
            onDataChannelStateChange: (state) => {
              if (state === "open") setConnectionStatus("connected");
            },
            onMessage: (msg) => {
              handleIncomingMessage(msg);
            },
            onTrack: (track, streams) => {
              if (streams && streams[0]) {
                setRemoteStreams((prev) => ({ ...prev, [localPeerId]: streams[0] }));
              }
            },
          }
        );

        if (localStream) peerConn.addLocalStream(localStream);
        peerConn.createDataChannel("pure-p2p-control");
        const offer = await peerConn.createOffer();
        await new Promise((res) => setTimeout(res, 300));

        const encoded = encodeSignalPayload({
          type: "offer",
          roomId,
          peerId: localPeerId,
          displayName,
          sdp: offer.sdp || "",
          candidates: peerConn.bufferedCandidates,
        });

        connectionsRef.current.set(localPeerId, peerConn);
        setActiveSignal(encoded);
        setSignalType("offer");
        setConnectionStatus("signaling");
        return encoded;
      } catch (err) {
        console.error("Error creating offer signal:", err);
        setConnectionStatus("error");
        return null;
      }
    },
    [localPeerId, displayName, roomId, handleIncomingMessage]
  );

  const processRemoteSignal = useCallback(
    async (rawString: string, localStream?: MediaStream | null) => {
      const decoded = decodeSignalPayload(rawString);
      if (!decoded) throw new Error("Invalid signaling payload format");
      if (decoded.r !== roomId) throw new Error("Signal payload belongs to a different room ID");
      if (decoded.p === localPeerId) throw new Error("Cannot connect to self");

      if (decoded.t === "offer") {
        setConnectionStatus("generating");
        const peerConn = new ManagedPeerConnection(
          decoded.p,
          decoded.n,
          {
            onConnectionStateChange: (state) => {
              updatePeerState(decoded.p, state);
            },
            onDataChannelStateChange: (state) => {
              if (state === "open") {
                setConnectionStatus("connected");
                addOrUpdatePeerMember(decoded.p, decoded.n, false, "connected", "open");
              }
            },
            onMessage: (msg) => {
              handleIncomingMessage(msg);
            },
            onTrack: (track, streams) => {
              if (streams && streams[0]) {
                setRemoteStreams((prev) => ({ ...prev, [decoded.p]: streams[0] }));
              }
            },
          }
        );

        if (localStream) peerConn.addLocalStream(localStream);

        const answer = await peerConn.createAnswer(decoded.s);
        if (decoded.c && decoded.c.length > 0) {
          await peerConn.addIceCandidates(decoded.c);
        }
        await new Promise((res) => setTimeout(res, 300));

        const encodedAnswer = encodeSignalPayload({
          type: "answer",
          roomId,
          peerId: localPeerId,
          displayName,
          sdp: answer.sdp || "",
          candidates: peerConn.bufferedCandidates,
        });

        connectionsRef.current.set(decoded.p, peerConn);

        if (isHost) {
          setPendingRequests((prev) => [
            ...prev.filter((r) => r.peerId !== decoded.p),
            {
              peerId: decoded.p,
              displayName: decoded.n,
              rawSignal: rawString,
              payload: decoded,
              timestamp: Date.now(),
            },
          ]);
        }

        setActiveSignal(encodedAnswer);
        setSignalType("answer");
        setConnectionStatus("signaling");
        return encodedAnswer;
      }

      if (decoded.t === "answer") {
        const peerConn = connectionsRef.current.get(localPeerId) || connectionsRef.current.get(decoded.p);
        if (!peerConn) throw new Error("No pending offer connection found for this answer signal");

        await peerConn.setAnswer(decoded.s);
        if (decoded.c && decoded.c.length > 0) {
          await peerConn.addIceCandidates(decoded.c);
        }

        addOrUpdatePeerMember(decoded.p, decoded.n, false, "connected", "open");
        setConnectionStatus("connected");
        return null;
      }

      return null;
    },
    [localPeerId, displayName, roomId, isHost, handleIncomingMessage]
  );

  const acceptJoinRequest = useCallback(
    async (request: PendingJoinRequest, answerSignalOverride?: string, localStream?: MediaStream | null) => {
      try {
        if (answerSignalOverride) {
          await processRemoteSignal(answerSignalOverride, localStream);
        }
        setPendingRequests((prev) => prev.filter((r) => r.peerId !== request.peerId));
      } catch (err) {
        console.error("Failed to accept join request:", err);
      }
    },
    [processRemoteSignal]
  );

  const rejectJoinRequest = useCallback((peerId: string) => {
    setPendingRequests((prev) => prev.filter((r) => r.peerId !== peerId));
  }, []);

  const broadcastControlMessage = useCallback(
    (text: string) => {
      sendTextMessage(text);
      return true;
    },
    [sendTextMessage]
  );

  const clearHistory = useCallback(() => {
    setMessages([]);
    clearLocalRoomHistory(roomId);
  }, [roomId]);

  const updatePeerState = (peerId: string, connState: RTCPeerConnectionState) => {
    setConnectedPeers((prev) =>
      prev.map((p) => (p.peerId === peerId ? { ...p, connectionState: connState } : p))
    );
  };

  const addOrUpdatePeerMember = (
    peerId: string,
    peerName: string,
    hostFlag: boolean,
    connState: RTCPeerConnectionState,
    dcState: RTCDataChannelState
  ) => {
    setConnectedPeers((prev) => {
      const exists = prev.find((p) => p.peerId === peerId);
      if (exists) {
        return prev.map((p) =>
          p.peerId === peerId
            ? { ...p, connectionState: connState, dataChannelState: dcState }
            : p
        );
      }
      return [
        ...prev,
        {
          peerId,
          displayName: peerName,
          isHost: hostFlag,
          connectionState: connState,
          dataChannelState: dcState,
          joinedAt: Date.now(),
        },
      ];
    });
  };

  return {
    localPeerId,
    displayName,
    setDisplayName,
    connectedPeers,
    pendingRequests,
    activeSignal,
    signalType,
    connectionStatus,
    isKeyReady,
    messages,
    typingPeers,
    activeTransfers,
    remoteStreams,
    createOfferSignal,
    processRemoteSignal,
    acceptJoinRequest,
    rejectJoinRequest,
    sendTextMessage,
    sendFile,
    sendTypingSignal,
    broadcastControlMessage,
    clearHistory,
    leaveRoom,
  };
}
