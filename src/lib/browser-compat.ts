export interface BrowserCapabilities {
  webrtc: boolean;
  webCrypto: boolean;
  mediaDevices: boolean;
  indexedDB: boolean;
  dataChannel: boolean;
  isFullySupported: boolean;
  warnings: string[];
}

export function detectBrowserCapabilities(): BrowserCapabilities {
  if (typeof window === "undefined") {
    return {
      webrtc: false,
      webCrypto: false,
      mediaDevices: false,
      indexedDB: false,
      dataChannel: false,
      isFullySupported: false,
      warnings: ["Server-side rendering context"],
    };
  }

  const warnings: string[] = [];

  const webrtc = typeof window.RTCPeerConnection !== "undefined";
  if (!webrtc) warnings.push("RTCPeerConnection is not supported by your browser.");

  const dataChannel =
    webrtc &&
    typeof window.RTCDataChannel !== "undefined" &&
    "createDataChannel" in window.RTCPeerConnection.prototype;
  if (!dataChannel) warnings.push("RTCDataChannel capability missing.");

  const webCrypto =
    typeof window.crypto !== "undefined" && typeof window.crypto.subtle !== "undefined";
  if (!webCrypto)
    warnings.push("Web Crypto API (crypto.subtle) is unavailable (requires HTTPS or localhost).");

  const mediaDevices =
    typeof navigator !== "undefined" &&
    typeof navigator.mediaDevices !== "undefined" &&
    typeof navigator.mediaDevices.getUserMedia === "function";
  if (!mediaDevices) warnings.push("Audio/Video access (navigator.mediaDevices) is not available.");

  const indexedDB = typeof window.indexedDB !== "undefined";
  if (!indexedDB) warnings.push("IndexedDB storage is not supported.");

  const isFullySupported = webrtc && dataChannel && webCrypto && mediaDevices && indexedDB;

  return {
    webrtc,
    webCrypto,
    mediaDevices,
    indexedDB,
    dataChannel,
    isFullySupported,
    warnings,
  };
}
