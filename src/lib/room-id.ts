/**
 * Generates a readable, secure temporary room ID (e.g., "room-9f2k-8a4b")
 */
export function generateRoomId(): string {
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    const arr = new Uint8Array(6);
    window.crypto.getRandomValues(arr);
    const hex = Array.from(arr, (b) => b.toString(36).padStart(2, "0")).join("");
    return `room-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
  }
  const rand = Math.random().toString(36).substring(2, 10);
  return `room-${rand.slice(0, 4)}-${rand.slice(4, 8)}`;
}

/**
 * Validates a room ID format
 */
export function isValidRoomId(roomId: string): boolean {
  if (!roomId || typeof roomId !== "string") return false;
  const trimmed = roomId.trim();
  return trimmed.length >= 4 && trimmed.length <= 64 && /^[a-zA-Z0-9_-]+$/.test(trimmed);
}

/**
 * Generates absolute room join link
 */
export function getRoomJoinUrl(roomId: string): string {
  if (typeof window === "undefined") return `/room/${roomId}`;
  return `${window.location.origin}/room/${roomId}`;
}
