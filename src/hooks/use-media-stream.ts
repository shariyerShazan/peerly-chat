"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  captureUserMedia,
  captureScreenShare,
  stopMediaStream,
  setTrackEnabled,
  enumerateMediaDevices,
  MediaDeviceItem,
} from "@/lib/webrtc/media-manager";

export function useMediaStream() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [devices, setDevices] = useState<{
    audioInputs: MediaDeviceItem[];
    videoInputs: MediaDeviceItem[];
    audioOutputs: MediaDeviceItem[];
  }>({ audioInputs: [], videoInputs: [], audioOutputs: [] });

  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Refresh available audio/video input devices
  const refreshDevices = useCallback(async () => {
    const list = await enumerateMediaDevices();
    setDevices(list);
  }, []);

  useEffect(() => {
    refreshDevices();
  }, [refreshDevices]);

  /**
   * Initializes local user camera & microphone stream
   */
  const startLocalStream = useCallback(
    async (options?: { audioId?: string; videoId?: string }) => {
      try {
        const stream = await captureUserMedia({
          audio: options?.audioId ? { deviceId: { exact: options.audioId } } : true,
          video: options?.videoId ? { deviceId: { exact: options.videoId } } : true,
        });

        cameraStreamRef.current = stream;
        setLocalStream(stream);
        setIsMicMuted(false);
        setIsVideoMuted(false);
        await refreshDevices();
        return stream;
      } catch (err) {
        console.error("Failed to start local user media:", err);
        return null;
      }
    },
    [refreshDevices]
  );

  /**
   * Stops all active media tracks
   */
  const stopLocalStream = useCallback(() => {
    if (localStream) stopMediaStream(localStream);
    if (cameraStreamRef.current) stopMediaStream(cameraStreamRef.current);
    setLocalStream(null);
    cameraStreamRef.current = null;
    setIsScreenSharing(false);
  }, [localStream]);

  /**
   * Toggle Audio Mute / Unmute
   */
  const toggleMic = useCallback(() => {
    if (!localStream) return;
    const nextState = !isMicMuted;
    setTrackEnabled(localStream, "audio", !nextState);
    setIsMicMuted(nextState);
  }, [localStream, isMicMuted]);

  /**
   * Toggle Video On / Off
   */
  const toggleCamera = useCallback(() => {
    if (!localStream) return;
    const nextState = !isVideoMuted;
    setTrackEnabled(localStream, "video", !nextState);
    setIsVideoMuted(nextState);
  }, [localStream, isVideoMuted]);

  /**
   * Toggle Screen Share
   */
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Revert to camera stream
      if (cameraStreamRef.current) {
        setLocalStream(cameraStreamRef.current);
      } else {
        await startLocalStream();
      }
      setIsScreenSharing(false);
      return;
    }

    try {
      const screenStream = await captureScreenShare();
      const screenTrack = screenStream.getVideoTracks()[0];

      if (screenTrack) {
        screenTrack.onended = () => {
          setIsScreenSharing(false);
          if (cameraStreamRef.current) setLocalStream(cameraStreamRef.current);
        };

        if (localStream) {
          const audioTrack = localStream.getAudioTracks()[0];
          const newStream = new MediaStream();
          if (audioTrack) newStream.addTrack(audioTrack);
          newStream.addTrack(screenTrack);
          setLocalStream(newStream);
        } else {
          setLocalStream(screenStream);
        }
        setIsScreenSharing(true);
      }
    } catch (err) {
      console.warn("Screen sharing cancelled or failed:", err);
    }
  }, [isScreenSharing, localStream, startLocalStream]);

  useEffect(() => {
    return () => {
      stopLocalStream();
    };
  }, []);

  return {
    localStream,
    isMicMuted,
    isVideoMuted,
    isScreenSharing,
    devices,
    startLocalStream,
    stopLocalStream,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    refreshDevices,
  };
}
