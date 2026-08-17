/**
 * Pure P2P Zero-Backend Signaling Payload Manager
 * Handles compression, stringification, parsing, and validation of WebRTC SDP and ICE payloads.
 */

export interface SignalPayload {
  v: "1";
  t: "offer" | "answer";
  r: string; // roomId
  p: string; // peerId
  n: string; // displayName
  s: string; // sdp string
  c?: RTCIceCandidateInit[]; // buffered ice candidates
  ts: number;
}

/**
 * Encodes a signal payload into a compressed Base64 string safe for copying or URL fragments
 */
export function encodeSignalPayload(payload: {
  type: "offer" | "answer";
  roomId: string;
  peerId: string;
  displayName: string;
  sdp: string;
  candidates?: RTCIceCandidateInit[];
}): string {
  const compactObj: SignalPayload = {
    v: "1",
    t: payload.type,
    r: payload.roomId,
    p: payload.peerId,
    n: payload.displayName,
    s: payload.sdp,
    c: payload.candidates || [],
    ts: Date.now(),
  };

  const jsonStr = JSON.stringify(compactObj);
  if (typeof window !== "undefined" && typeof btoa === "function") {
    try {
      // UTF-8 to Base64
      const bytes = new TextEncoder().encode(jsonStr);
      const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
      return btoa(binString);
    } catch {
      return jsonStr;
    }
  }
  return jsonStr;
}

/**
 * Decodes and validates a Base64 or JSON signal payload string
 */
export function decodeSignalPayload(rawString: string): SignalPayload | null {
  if (!rawString || typeof rawString !== "string") return null;

  const trimmed = rawString.trim();
  let jsonStr = trimmed;

  // Try decoding Base64
  if (!trimmed.startsWith("{")) {
    try {
      const binString = atob(trimmed);
      const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
      jsonStr = new TextDecoder().decode(bytes);
    } catch {
      // Fallback to raw string if it's already JSON
      jsonStr = trimmed;
    }
  }

  try {
    const parsed = JSON.parse(jsonStr) as SignalPayload;
    if (!parsed || parsed.v !== "1") return null;
    if (parsed.t !== "offer" && parsed.t !== "answer") return null;
    if (!parsed.p || !parsed.s || !parsed.r) return null;

    return parsed;
  } catch (err) {
    console.error("Failed to parse signaling payload:", err);
    return null;
  }
}
