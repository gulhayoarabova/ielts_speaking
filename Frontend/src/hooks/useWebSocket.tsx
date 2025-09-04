import { useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";

export const useWebSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io("https://ielts-speaking-1.onrender.com");

    socketRef.current.on("connect", () => {
      console.log("✅ Connected to Nest.js WebSocket");
    });

    socketRef.current.on("ai_feedback", (data: any) => {
      console.log("🎤 AI Feedback:", data);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const sendChunk = (question: string, chunk: ArrayBuffer) => {
    if (!socketRef.current) return;

    // Convert ArrayBuffer → Base64
    const base64 = btoa(
      new Uint8Array(chunk).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    socketRef.current.emit("send_audio_chunk", { question, chunk: base64 });
  };

  return { sendChunk };
};
