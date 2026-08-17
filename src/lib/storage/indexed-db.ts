/**
 * Browser-Local Encrypted Chat Persistence via IndexedDB
 * Safely persists local chat messages and metadata strictly inside user browser storage.
 */

export interface StoredChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  text: string; // Encrypted or plain text
  iv?: string;
  timestamp: number;
  isSelf: boolean;
  fileMeta?: {
    fileName: string;
    fileSize: number;
    fileType: string;
    blobUrl?: string;
  };
}

const DB_NAME = "PureP2P_LocalStore";
const DB_VERSION = 1;
const STORE_MESSAGES = "chat_messages";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB is not supported"));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_MESSAGES)) {
        const store = db.createObjectStore(STORE_MESSAGES, { keyPath: "id" });
        store.createIndex("roomId", "roomId", { unique: false });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
    };
  });
}

export async function saveLocalMessage(msg: StoredChatMessage): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_MESSAGES, "readwrite");
    const store = tx.objectStore(STORE_MESSAGES);
    store.put(msg);
  } catch (err) {
    console.warn("Failed to save message to IndexedDB:", err);
  }
}

export async function getLocalRoomMessages(roomId: string): Promise<StoredChatMessage[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_MESSAGES, "readonly");
      const store = tx.objectStore(STORE_MESSAGES);
      const index = store.index("roomId");
      const request = index.getAll(roomId);

      request.onsuccess = () => {
        const results = request.result as StoredChatMessage[];
        results.sort((a, b) => a.timestamp - b.timestamp);
        resolve(results);
      };

      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function clearLocalRoomHistory(roomId: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_MESSAGES, "readwrite");
    const store = tx.objectStore(STORE_MESSAGES);
    const index = store.index("roomId");
    const request = index.openKeyCursor(IDBKeyRange.only(roomId));

    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        store.delete(cursor.primaryKey);
        cursor.continue();
      }
    };
  } catch (err) {
    console.warn("Failed to clear IndexedDB room history:", err);
  }
}
