// src/hooks/useVoiceChat.ts
import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

type AIMessage = {
  content: string;
  timestamp: string;
  part?: number;
};

export const useVoiceChat = () => {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  const BACKEND = "https://ielts-speaking-1.onrender.com";
  const NAMESPACE = import.meta.env.REACT_APP_WS_NAMESPACE || "/voice-chat";

  useEffect(() => {
    const url = `${BACKEND}${NAMESPACE}`;
    const socket = io(url, {
      transports: ["websocket"],
      upgrade: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      console.log("✅ Connected to NestJS WebSocket", socket.id);
    });
    socket.on("disconnect", () => {
      setConnected(false);
      console.log("🔌 Disconnected");
    });

    // Forward other events to app — app will register handlers via onEvent
    socket.on("connect_error", (err) => console.error("WS connect_error:", err));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // only once

  const emit = useCallback((event: string, payload: any) => {
    if (!socketRef.current) return;
    socketRef.current.emit(event, payload);
  }, []);

  // send base64 chunk (frontend will pass base64)
  const sendChunk = useCallback((chunkBase64: string, isLast = false) => {
    emit("audio_chunk", { chunk: chunkBase64, isLast });
  }, [emit]);

  const startRecordingSignal = useCallback(() => emit("start_recording", {}), [emit]);
  const stopRecordingSignal = useCallback(() => emit("stop_recording", {}), [emit]);
  const nextPart = useCallback(() => emit("next_part", {}), [emit]);

  // Register event handlers from component using this helper
  const onEvent = useCallback((event: string, handler: (payload: any) => void) => {
    if (!socketRef.current) return;
    socketRef.current.on(event, handler);
    return () => {
      socketRef.current?.off(event, handler);
    };
  }, []);

  return {
    connected,
    sendChunk,
    startRecordingSignal,
    stopRecordingSignal,
    nextPart,
    onEvent,
    rawSocket: socketRef.current,
  };
};
