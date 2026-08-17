"use client";

import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

/**
 * Singleton Socket.IO Client Helper for real-time WebRTC signaling and lightweight room events.
 */
export function getSocketClient(): Socket {
  if (!socketInstance && typeof window !== "undefined") {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;

    socketInstance = io(socketUrl, {
      autoConnect: true,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
    });
  }

  return socketInstance!;
}
