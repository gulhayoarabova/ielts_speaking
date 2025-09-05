// src/components/VoiceChatComponent.tsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useVoiceChat } from "@/hooks/useVoiceChat";

type Message = {
    type: "candidate" | "examiner" | "system";
    content: string;
    timestamp: string;
    part?: number;
};

type Feedback = {
    feedback: string;
    score: number;
    strengths?: string[];
    suggestions?: string[];
    fluency?: number;
    vocabulary?: number;
    grammar?: number;
    pronunciation?: number;
};

const CHUNK_INTERVAL = Number(import.meta.env.REACT_APP_CHUNK_INTERVAL_MS || 2000);

const VoiceChatComponent: React.FC = () => {
    const { connected, sendChunk, startRecordingSignal, stopRecordingSignal, onEvent } = useVoiceChat();
    const [isRecording, setIsRecording] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [liveTranscription, setLiveTranscription] = useState("");
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [audioPermission, setAudioPermission] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const chunkTimerRef = useRef<number | null>(null);

    const sentLastRef = useRef(false);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // Register socket events
        const unsubscribers: (() => void)[] = [];

        unsubscribers.push(
            onEvent("ai_message", (data: any) => {
                setMessages((prev) => [...prev, { type: "examiner", content: data.content, timestamp: data.timestamp, part: data.part }]);
            }) || (() => { })
        );

        unsubscribers.push(
            onEvent("ai_audio", (data: any) => {
                if (data.audio_data || data.audioData) {
                    const b = data.audio_data ?? data.audioData;
                    playAudioData(b);
                }
            }) || (() => { })
        );

        unsubscribers.push(
            onEvent("live_transcription", (data: any) => {
                setLiveTranscription(data.content ?? data.text ?? "");
            }) || (() => { })
        );

        unsubscribers.push(
            onEvent("feedback", (d: any) => setFeedback(d)) || (() => { })
        );

        unsubscribers.push(
            onEvent("part_transition", (d: any) => {
                setMessages((prev) => [...prev, { type: "system", content: `Moving to Part ${d.part}: ${d.instruction}`, timestamp: d.timestamp }]);
            }) || (() => { })
        );

        unsubscribers.push(
            onEvent("test_complete", (d: any) => {
                setMessages((prev) => [...prev, { type: "system", content: "Test completed! Here are your results.", timestamp: d.timestamp }]);
                setFeedback(d.evaluation ?? null);
            }) || (() => { })
        );

        return () => unsubscribers.forEach((u) => u());
    }, [onEvent]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, liveTranscription]);

    const requestMicrophone = async () => {
        try {
            const s = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = s;
            setAudioPermission(true);
            return true;
        } catch (err) {
            setAudioPermission(false);
            return false;
        }
    };

    const encodeArrayBufferToBase64 = (buffer: ArrayBuffer) => {
        let binary = "";
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    };

    const startRecording = useCallback(async () => {
        if (!connected) return;
        if (!streamRef.current) {
            const ok = await requestMicrophone();
            if (!ok) return;
        }
        const stream = streamRef.current!;
        const options = { mimeType: "audio/webm;codecs=opus" } as MediaRecorderOptions;
        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        // collect data chunks
        mediaRecorder.ondataavailable = (ev) => {
            if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
        };

        // Periodically send the collected chunks as base64
        const sendCollected = async () => {
            if (chunksRef.current.length === 0) return;
            const blob = new Blob(chunksRef.current, { type: "audio/webm" });
            const arrayBuffer = await blob.arrayBuffer();
            const base64 = encodeArrayBufferToBase64(arrayBuffer);
            sendChunk(base64, false);
            chunksRef.current = [];
        };

        // Start periodic send
        chunkTimerRef.current = window.setInterval(sendCollected, CHUNK_INTERVAL);

        mediaRecorder.onstop = async () => {
            // send remaining and mark last
            if (chunkTimerRef.current) {
                clearInterval(chunkTimerRef.current);
                chunkTimerRef.current = null;
            }
            if (!sentLastRef.current) {
                if (chunksRef.current.length > 0) {
                    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                    const arrayBuffer = await blob.arrayBuffer();
                    const base64 = encodeArrayBufferToBase64(arrayBuffer);
                    sendChunk(base64, true);
                } else {
                    sendChunk("", true);
                }
                sentLastRef.current = true; // ensure only once
            } else {
                console.log("Duplicate last prevented on client");
            }

            // add the last live transcription to conversation messages if present
            if (liveTranscription.trim()) {
                setMessages((prev) => [...prev, { type: "candidate", content: liveTranscription.trim(), timestamp: new Date().toISOString() }]);
                setLiveTranscription("");
            }
            setIsRecording(false);
        };

        mediaRecorder.start(1000); // timeslice minimal; actual sending done by interval
        setIsRecording(true);
        startRecordingSignal();
    }, [connected, sendChunk, startRecordingSignal, liveTranscription]);

    // stopRecording function should not send last again; only stops recorder
    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            stopRecordingSignal();
        }
    }, [isRecording, stopRecordingSignal]);

    const playAudioData = (base64Audio: string) => {
        try {
            // base64 -> arraybuffer
            const binary_string = atob(base64Audio);
            const len = binary_string.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) bytes[i] = binary_string.charCodeAt(i);
            const blob = new Blob([bytes.buffer], { type: "audio/mpeg" });
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audio.play();
            audio.onended = () => URL.revokeObjectURL(url);
        } catch (e) {
            console.error("playAudioData error", e);
        }
    };

    if (!audioPermission) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h3 className="text-lg mb-2">🎤 Microphone Access Required</h3>
                <button onClick={requestMicrophone} className="px-4 py-2 bg-blue-500 text-white rounded">
                    Enable Microphone
                </button>
            </div>
        );
    }

    return (
        <div className="flex h-[90%]">
            <div className="flex-1 flex flex-col">
                <div className="px-6 py-4 border-b bg-white flex justify-between">
                    <h1 className="text-xl font-semibold">IELTS Speaking</h1>
                    <span>{connected ? "🟢 Connected" : "🔴 Disconnected"}</span>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.type === "candidate" ? "justify-end" : "justify-start"}`}>
                            <div className={`px-4 py-2 rounded-lg ${msg.type === "candidate" ? "bg-blue-500 text-white" : msg.type === "examiner" ? "bg-gray-200" : "bg-yellow-100"}`}>
                                <div className="text-sm">{msg.content}</div>
                                <div className="text-xs opacity-75">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {liveTranscription && <div className="bg-blue-50 px-6 py-3 text-sm">You're saying: {liveTranscription}</div>}

                <div className="px-6 py-4 border-t bg-white flex justify-center">
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={!connected}
                        className={`w-16 h-16 rounded-full ${isRecording ? "bg-red-500 animate-pulse" : "bg-blue-500"} text-white`}
                    >
                        {isRecording ? "🛑" : "🎤"}
                    </button>
                </div>
            </div>

            <div className="w-80 border-l bg-white p-4 overflow-y-auto">
                <h2 className="font-semibold mb-2">Live Feedback</h2>
                {feedback ? (
                    <div>
                        <div className="text-xl font-bold">{feedback ? (feedback.score ?? '—') + '/9' : '—/9'}</div>
                        <p>{feedback?.feedback ?? 'No detailed feedback yet'}</p>
                    </div>
                ) : (
                    <p>No feedback yet</p>
                )}
            </div>
        </div>
    );
};

export default VoiceChatComponent;
