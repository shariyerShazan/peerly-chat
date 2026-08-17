/**
 * Media Stream & Device Management Module
 * Handles getUserMedia, getDisplayMedia (screen share), device enumeration, permission error parsing, and track toggles.
 */

export interface MediaDeviceItem {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

export function getFriendlyMediaErrorMessage(err: any): string {
  if (!err) return "An unknown media error occurred";
  const name = err.name || "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "Camera or microphone permission was denied. Please allow device access in your browser settings.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "No camera or microphone hardware was found on your device.";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "Camera or microphone is already in use by another application.";
  }
  if (name === "OverconstrainedError") {
    return "Requested camera video resolution is not supported by your device.";
  }
  if (name === "SecurityError") {
    return "Media device access is blocked. Please ensure you are using HTTPS or localhost.";
  }
  return err.message || "Unable to access media devices";
}

export async function enumerateMediaDevices(): Promise<{
  audioInputs: MediaDeviceItem[];
  videoInputs: MediaDeviceItem[];
  audioOutputs: MediaDeviceItem[];
}> {
  if (
    typeof window === "undefined" ||
    !navigator.mediaDevices ||
    !navigator.mediaDevices.enumerateDevices
  ) {
    return { audioInputs: [], videoInputs: [], audioOutputs: [] };
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputs: MediaDeviceItem[] = [];
    const videoInputs: MediaDeviceItem[] = [];
    const audioOutputs: MediaDeviceItem[] = [];

    devices.forEach((d, idx) => {
      const item: MediaDeviceItem = {
        deviceId: d.deviceId,
        label: d.label || `${d.kind} ${idx + 1}`,
        kind: d.kind,
      };

      if (d.kind === "audioinput") audioInputs.push(item);
      else if (d.kind === "videoinput") videoInputs.push(item);
      else if (d.kind === "audiooutput") audioOutputs.push(item);
    });

    return { audioInputs, videoInputs, audioOutputs };
  } catch (err) {
    console.warn("Failed to enumerate media devices:", err);
    return { audioInputs: [], videoInputs: [], audioOutputs: [] };
  }
}

export async function captureUserMedia(options: {
  audio?: boolean | MediaTrackConstraints;
  video?: boolean | MediaTrackConstraints;
}): Promise<MediaStream> {
  if (
    typeof window === "undefined" ||
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {
    throw new Error("getUserMedia is not supported in this browser");
  }

  return navigator.mediaDevices.getUserMedia({
    audio: options.audio ?? true,
    video: options.video ?? {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: "user",
    },
  });
}

export async function captureScreenShare(): Promise<MediaStream> {
  if (
    typeof window === "undefined" ||
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getDisplayMedia
  ) {
    throw new Error("getDisplayMedia is not supported in this browser");
  }

  try {
    return await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });
  } catch {
    return await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
    });
  }
}

export function stopMediaStream(stream: MediaStream | null): void {
  if (!stream) return;
  stream.getTracks().forEach((track) => {
    try {
      track.stop();
    } catch {}
  });
}

export function setTrackEnabled(
  stream: MediaStream | null,
  kind: "audio" | "video",
  enabled: boolean
): void {
  if (!stream) return;
  const tracks =
    kind === "audio" ? stream.getAudioTracks() : stream.getVideoTracks();
  tracks.forEach((track) => {
    track.enabled = enabled;
  });
}
