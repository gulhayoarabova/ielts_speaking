import { useWebSocket } from "@/hooks/useWebSocket";
import { RecordingData } from "@/types/recording";
import React, { useState } from "react";

interface VoiceRecorderProps {
  question: string;
  onRecordingComplete: (data: RecordingData) => void;
}

export default function VoiceRecorder({
  question,
  onRecordingComplete,
}: VoiceRecorderProps) {
  const { sendChunk } = useWebSocket();
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

    const startTime = Date.now();

    mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        const buffer = await event.data.arrayBuffer();
        sendChunk(question, buffer);

        // when stopping, return duration + blob url
        if (mediaRecorder.state === "inactive") {
          const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
          const audioUrl = URL.createObjectURL(event.data);

          onRecordingComplete({
            duration: `${durationSec}s`,
            audioUrl,
          });
        }
      }
    };

    mediaRecorder.start(2000);
    setRecorder(mediaRecorder);
  };

  const stopRecording = () => {
    recorder?.stop();
    setRecorder(null);
  };

  return (
    <div className="p-4">
      <button onClick={startRecording} disabled={!!recorder}>
        🎤 Start Recording
      </button>
      <button onClick={stopRecording} disabled={!recorder}>
        ⏹ Stop Recording
      </button>
    </div>
  );
}

