/**
 * Web Crypto API End-to-End Encryption Primitives (AES-GCM-256)
 * Real application-level encryption for text messages and file transfers.
 */

export interface EncryptedPayload {
  ciphertext: string; // Base64 encoded ciphertext
  iv: string; // Base64 encoded 12-byte IV
}

/**
 * Generates a fresh 256-bit AES-GCM CryptoKey
 */
export async function generateSessionKey(): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
}

/**
 * Exports CryptoKey to Base64 string for peer sharing
 */
export async function exportKeyToBase64(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey("raw", key);
  const bytes = new Uint8Array(exported);
  let bin = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin);
}

/**
 * Imports CryptoKey from Base64 string
 */
export async function importKeyFromBase64(base64Key: string): Promise<CryptoKey> {
  const bin = atob(base64Key);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return window.crypto.subtle.importKey(
    "raw",
    bytes.buffer,
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"]
  );
}

/**
 * Derives a deterministic 256-bit AES-GCM CryptoKey from room secret ID using PBKDF2
 */
export async function deriveKeyFromRoomId(roomId: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(roomId),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  // Constant salt derived for room
  const salt = enc.encode(`pure-p2p-salt-${roomId}`);

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts plaintext string using AES-GCM-256
 */
export async function encryptText(
  plaintext: string,
  key: CryptoKey
): Promise<EncryptedPayload> {
  const enc = new TextEncoder();
  const encodedText = enc.encode(plaintext);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encodedText
  );

  const bytes = new Uint8Array(encryptedBuffer);
  let bin = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    bin += String.fromCharCode(bytes[i]);
  }

  let ivBin = "";
  for (let i = 0; i < iv.byteLength; i++) {
    ivBin += String.fromCharCode(iv[i]);
  }

  return {
    ciphertext: btoa(bin),
    iv: btoa(ivBin),
  };
}

/**
 * Decrypts AES-GCM-256 ciphertext payload back to string
 */
export async function decryptText(
  payload: EncryptedPayload,
  key: CryptoKey
): Promise<string> {
  const cipherBin = atob(payload.ciphertext);
  const cipherBytes = new Uint8Array(cipherBin.length);
  for (let i = 0; i < cipherBin.length; i++) {
    cipherBytes[i] = cipherBin.charCodeAt(i);
  }

  const ivBin = atob(payload.iv);
  const ivBytes = new Uint8Array(ivBin.length);
  for (let i = 0; i < ivBin.length; i++) {
    ivBytes[i] = ivBin.charCodeAt(i);
  }

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivBytes,
    },
    key,
    cipherBytes.buffer
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedBuffer);
}

/**
 * Encrypts raw ArrayBuffer (file data)
 */
export async function encryptBuffer(
  buffer: ArrayBuffer,
  key: CryptoKey
): Promise<{ ciphertextBase64: string; ivBase64: string }> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    buffer
  );

  const bytes = new Uint8Array(encryptedBuffer);
  let bin = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    bin += String.fromCharCode(bytes[i]);
  }

  let ivBin = "";
  for (let i = 0; i < iv.byteLength; i++) {
    ivBin += String.fromCharCode(iv[i]);
  }

  return {
    ciphertextBase64: btoa(bin),
    ivBase64: btoa(ivBin),
  };
}

/**
 * Decrypts ArrayBuffer
 */
export async function decryptBuffer(
  ciphertextBase64: string,
  ivBase64: string,
  key: CryptoKey
): Promise<ArrayBuffer> {
  const cipherBin = atob(ciphertextBase64);
  const cipherBytes = new Uint8Array(cipherBin.length);
  for (let i = 0; i < cipherBin.length; i++) {
    cipherBytes[i] = cipherBin.charCodeAt(i);
  }

  const ivBin = atob(ivBase64);
  const ivBytes = new Uint8Array(ivBin.length);
  for (let i = 0; i < ivBin.length; i++) {
    ivBytes[i] = ivBin.charCodeAt(i);
  }

  return window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivBytes,
    },
    key,
    cipherBytes.buffer
  );
}
