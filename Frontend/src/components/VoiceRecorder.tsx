import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Mic, Square, Play, Pause, MicOff, AlertTriangle } from "lucide-react";

interface VoiceRecorderProps {
  question: string;
  onRecordingComplete: (data: {
    duration: string;
    audioBlob?: Blob;
    audioUrl?: string;
  }) => void;
}

export function VoiceRecorder({
  question,
  onRecordingComplete,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [hasRecording, setHasRecording] = useState(false);
  const [microphoneError, setMicrophoneError] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const currentDurationRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (streamRef.current)
        streamRef.current.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    setMicrophoneError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" });
        const url = URL.createObjectURL(blob);

        setAudioBlob(blob);
        setAudioUrl(url);
        setHasRecording(true);
        setIsSimulating(false);

        const finalDuration = currentDurationRef.current;
        onRecordingComplete({
          duration: formatTime(finalDuration),
          audioBlob: blob,
          audioUrl: url,
        });
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      startTimeRef.current = Date.now();
      currentDurationRef.current = 0;

      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor(
            (Date.now() - startTimeRef.current) / 1000
          );
          currentDurationRef.current = elapsed;
          setRecordingTime(elapsed);
        }
      }, 1000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Microphone error:", error);
      setMicrophoneError(
        "Unable to access microphone. Please allow permissions and try again."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (startTimeRef.current) {
        currentDurationRef.current = Math.floor(
          (Date.now() - startTimeRef.current) / 1000
        );
      }
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (streamRef.current)
        streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const togglePlayback = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleAudioEnded = () => setIsPlaying(false);

  const resetRecording = () => {
    setHasRecording(false);
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingTime(0);
    setIsSimulating(false);
    startTimeRef.current = null;
    currentDurationRef.current = 0;
  };

  return (
    <div className="space-y-6">
      {microphoneError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{microphoneError}</AlertDescription>
        </Alert>
      )}

      <div className="text-center space-y-4">
        {!isRecording && !hasRecording && (
          <Button onClick={startRecording} size="lg" className="w-32">
            <Mic className="w-4 h-4 mr-2" /> Record
          </Button>
        )}

        {isRecording && (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-lg font-mono">
                {formatTime(recordingTime)}
              </span>
            </div>
            <Button onClick={stopRecording} variant="destructive" size="lg">
              <Square className="w-4 h-4 mr-2" /> Stop
            </Button>
          </div>
        )}

        {hasRecording && !isRecording && (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              {audioUrl && (
                <Button onClick={togglePlayback} variant="outline">
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" /> Play
                    </>
                  )}
                </Button>
              )}
              <Button onClick={resetRecording} variant="outline">
                Record Again
              </Button>
            </div>
            {audioUrl && (
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={handleAudioEnded}
                className="hidden"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
