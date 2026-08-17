import { NextRequest, NextResponse } from "next/server";
import { broadcastToRoom } from "./stream/route";

// Global in-memory store for room signaling & realtime chat messages
interface RoomStore {
  signals: Array<{ senderPeerId: string; signalPayload: string; timestamp: number }>;
  messages: Array<{ senderPeerId: string; packetStr: string; timestamp: number }>;
}

const roomStores = new Map<string, RoomStore>();

function getOrCreateRoomStore(roomId: string): RoomStore {
  let store = roomStores.get(roomId);
  if (!store) {
    store = { signals: [], messages: [] };
    roomStores.set(roomId, store);
  }
  return store;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");
  const since = parseInt(searchParams.get("since") || "0", 10);

  if (!roomId) {
    return NextResponse.json({ error: "Missing roomId" }, { status: 400 });
  }

  const store = getOrCreateRoomStore(roomId);

  const newSignals = store.signals.filter((s) => s.timestamp > since);
  const newMessages = store.messages.filter((m) => m.timestamp > since);

  return NextResponse.json({
    signals: newSignals,
    messages: newMessages,
    timestamp: Date.now(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId, type, senderPeerId, signalPayload, packetStr } = body;

    if (!roomId || !senderPeerId || !type) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const store = getOrCreateRoomStore(roomId);
    const now = Date.now();

    if (type === "SIGNAL") {
      const entry = { senderPeerId, signalPayload, timestamp: now };
      store.signals.push(entry);
      if (store.signals.length > 50) store.signals.shift();
      // Broadcast real-time SSE event to all connected room peers
      broadcastToRoom(roomId, { type: "SIGNAL", ...entry });
    } else if (type === "CHAT") {
      const entry = { senderPeerId, packetStr, timestamp: now };
      store.messages.push(entry);
      if (store.messages.length > 200) store.messages.shift();
      // Broadcast real-time SSE event to all connected room peers
      broadcastToRoom(roomId, { type: "CHAT", ...entry });
    }

    return NextResponse.json({ success: true, timestamp: now });
  } catch (err) {
    return NextResponse.json({ error: "Failed to process post" }, { status: 500 });
  }
}
