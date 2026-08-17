/**
 * Media Stream & Device Management Module
 * Handles getUserMedia, getDisplayMedia (screen share), device enumeration, and track toggles.
 */

export interface MediaDeviceItem {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

export async function enumerateMediaDevices(): Promise<{
  audioInputs: MediaDeviceItem[];
  videoInputs: MediaDeviceItem[];
  audioOutputs: MediaDeviceItem[];
}> {
  if (typeof window === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
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
  if (typeof window === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
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
  if (typeof window === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
    throw new Error("getDisplayMedia is not supported in this browser");
  }

  return navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: false,
  });
}

export function stopMediaStream(stream: MediaStream | null): void {
  if (!stream) return;
  stream.getTracks().forEach((track) => {
    try {
      track.stop();
    } catch {}
  });
}

export function setTrackEnabled(stream: MediaStream | null, kind: "audio" | "video", enabled: boolean): void {
  if (!stream) return;
  const tracks = kind === "audio" ? stream.getAudioTracks() : stream.getVideoTracks();
  tracks.forEach((track) => {
    track.enabled = enabled;
  });
}
