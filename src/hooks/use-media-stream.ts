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
  // Default audio and video to OFF (muted) until explicitly turned on by user
  const [isMicMuted, setIsMicMuted] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
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
   * Initializes local user camera & microphone stream with default OFF tracks
   */
  const startLocalStream = useCallback(
    async (options?: {
      audioId?: string;
      videoId?: string;
      startAudioOn?: boolean;
      startVideoOn?: boolean;
    }) => {
      try {
        const stream = await captureUserMedia({
          audio: options?.audioId ? { deviceId: { exact: options.audioId } } : true,
          video: options?.videoId ? { deviceId: { exact: options.videoId } } : true,
        });

        cameraStreamRef.current = stream;

        const audioOn = options?.startAudioOn ?? false;
        const videoOn = options?.startVideoOn ?? false;

        setTrackEnabled(stream, "audio", audioOn);
        setTrackEnabled(stream, "video", videoOn);

        setLocalStream(stream);
        setIsMicMuted(!audioOn);
        setIsVideoMuted(!videoOn);
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
    setIsMicMuted(true);
    setIsVideoMuted(true);
  }, [localStream]);

  /**
   * Toggle Audio Mute / Unmute (Turns audio ON if off)
   */
  const toggleMic = useCallback(async () => {
    let stream = localStream;
    if (!stream) {
      stream = await startLocalStream({ startAudioOn: true, startVideoOn: !isVideoMuted });
      return;
    }
    const nextMuteState = !isMicMuted;
    setTrackEnabled(stream, "audio", !nextMuteState);
    setIsMicMuted(nextMuteState);
    const updatedStream = new MediaStream(stream.getTracks());
    cameraStreamRef.current = updatedStream;
    setLocalStream(updatedStream);
  }, [localStream, isMicMuted, isVideoMuted, startLocalStream]);

  /**
   * Toggle Video On / Off (Turns camera ON if off)
   */
  const toggleCamera = useCallback(async () => {
    let stream = localStream;
    if (!stream) {
      stream = await startLocalStream({ startAudioOn: !isMicMuted, startVideoOn: true });
      return;
    }
    const nextMuteState = !isVideoMuted;
    setTrackEnabled(stream, "video", !nextMuteState);
    setIsVideoMuted(nextMuteState);
    const updatedStream = new MediaStream(stream.getTracks());
    cameraStreamRef.current = updatedStream;
    setLocalStream(updatedStream);
  }, [localStream, isVideoMuted, isMicMuted, startLocalStream]);

  /**
   * Toggle Screen Share
   */
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Revert to camera stream
      if (cameraStreamRef.current) {
        setLocalStream(cameraStreamRef.current);
      } else {
        await startLocalStream({ startAudioOn: !isMicMuted, startVideoOn: !isVideoMuted });
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
  }, [isScreenSharing, localStream, isMicMuted, isVideoMuted, startLocalStream]);

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
