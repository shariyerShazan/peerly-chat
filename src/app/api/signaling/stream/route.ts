import { NextRequest } from "next/server";

// Store active EventSource clients per roomId
type Listener = (data: string) => void;
const roomListeners = new Map<string, Set<Listener>>();

export function addRoomListener(roomId: string, listener: Listener) {
  let listeners = roomListeners.get(roomId);
  if (!listeners) {
    listeners = new Set();
    roomListeners.set(roomId, listeners);
  }
  listeners.add(listener);
}

export function removeRoomListener(roomId: string, listener: Listener) {
  const listeners = roomListeners.get(roomId);
  if (listeners) {
    listeners.delete(listener);
    if (listeners.size === 0) {
      roomListeners.delete(roomId);
    }
  }
}

export function broadcastToRoom(roomId: string, payload: any) {
  const listeners = roomListeners.get(roomId);
  if (!listeners) return;
  const dataString = `data: ${JSON.stringify(payload)}\n\n`;
  listeners.forEach((listener) => {
    try {
      listener(dataString);
    } catch (e) {}
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");

  if (!roomId) {
    return new Response("Missing roomId", { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const listener = (data: string) => {
        controller.enqueue(new TextEncoder().encode(data));
      };

      addRoomListener(roomId, listener);

      // Send initial heartbeat
      controller.enqueue(new TextEncoder().encode(`: heartbeat\n\n`));

      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(`: heartbeat\n\n`));
        } catch (e) {
          clearInterval(heartbeatInterval);
        }
      }, 15000);

      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeatInterval);
        removeRoomListener(roomId, listener);
        try {
          controller.close();
        } catch (e) {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
