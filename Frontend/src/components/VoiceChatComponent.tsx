import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  type: 'candidate' | 'examiner' | 'system';
  content: string;
  timestamp: string;
  audioData?: string;
  part?: number;
}

interface Feedback {
  feedback: string;
  score: number;
  strengths?: string[];
  suggestions?: string[];
  fluency?: number;
  vocabulary?: number;
  grammar?: number;
  pronunciation?: number;
}

interface SessionStats {
  sessionId: string;
  currentPart: number;
  questionCount: number;
  conversationLength: number;
  duration: number;
}

const VoiceChatComponent: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentPart, setCurrentPart] = useState(1);
  const [messages, setMessages] = useState<Message[]>([]);
  const [liveTranscription, setLiveTranscription] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [audioPermission, setAudioPermission] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const BACKEND_URL = 'https://ielts-speaking-1.onrender.com'; // Your NestJS backend
  const CHUNK_INTERVAL = 2000; // Send audio chunks every 2 seconds

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(`${BACKEND_URL}/voice-chat`, {
      transports: ['websocket'],
      upgrade: true,
    });

    newSocket.on('connect', () => {
      console.log('Connected to voice chat server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from voice chat server');
      setIsConnected(false);
    });

    // Session events
    newSocket.on('session_started', (data) => {
      console.log('Session started:', data.sessionId);
    });

    // Message events
    newSocket.on('ai_message', (data) => {
      const newMessage: Message = {
        type: 'examiner',
        content: data.content,
        timestamp: data.timestamp,
        part: data.part,
      };
      setMessages(prev => [...prev, newMessage]);
    });

    newSocket.on('ai_audio', (data) => {
      if (data.audioData) {
        playAudioData(data.audioData);
      }
    });

    newSocket.on('live_transcription', (data) => {
      setLiveTranscription(data.text);
    });

    newSocket.on('quick_feedback', (data) => {
      setFeedback(data);
    });

    newSocket.on('feedback', (data) => {
      setFeedback(data);
    });

    newSocket.on('part_transition', (data) => {
      setCurrentPart(data.currentPart);
      const systemMessage: Message = {
        type: 'system',
        content: `Moving to Part ${data.currentPart}: ${data.instruction}`,
        timestamp: data.timestamp,
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    newSocket.on('test_complete', (data) => {
      setIsTestComplete(true);
      const systemMessage: Message = {
        type: 'system',
        content: 'Test completed! Here are your results.',
        timestamp: data.timestamp,
      };
      setMessages(prev => [...prev, systemMessage]);
      setFeedback(data.evaluation);
    });

    newSocket.on('session_stats', (data) => {
      setSessionStats(data);
    });

    newSocket.on('error', (data) => {
      console.error('Socket error:', data.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        } 
      });
      streamRef.current = stream;
      setAudioPermission(true);
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setAudioPermission(false);
      return false;
    }
  };

  // Start recording
  const startRecording = useCallback(async () => {
    if (!socket || !streamRef.current) {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) return;
    }

    if (!streamRef.current) return;

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Send chunks periodically
      const sendChunk = () => {
        if (chunksRef.current.length > 0) {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          
          reader.onload = () => {
            const base64Data = (reader.result as string).split(',')[1];
            socket?.emit('audio_chunk', {
              chunk: base64Data,
              isLast: false,
            });
          };
          
          reader.readAsDataURL(audioBlob);
          chunksRef.current = [];
        }
      };

      const chunkInterval = setInterval(sendChunk, CHUNK_INTERVAL);

      mediaRecorder.onstop = () => {
        clearInterval(chunkInterval);
        // Send final chunk
        if (chunksRef.current.length > 0) {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          
          reader.onload = () => {
            const base64Data = (reader.result as string).split(',')[1];
            socket?.emit('audio_chunk', {
              chunk: base64Data,
              isLast: true,
            });
          };
          
          reader.readAsDataURL(audioBlob);
        }
        
        // Add candidate message to chat
        if (liveTranscription.trim()) {
          const candidateMessage: Message = {
            type: 'candidate',
            content: liveTranscription,
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => [...prev, candidateMessage]);
          setLiveTranscription('');
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      socket?.emit('start_recording');
      
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, [socket, liveTranscription]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      socket?.emit('stop_recording');
    }
  }, [socket, isRecording]);

  // Play audio data from AI
  const playAudioData = (base64Audio: string) => {
    try {
      const audioData = atob(base64Audio);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(arrayBuffer);
      
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i);
      }

      const audioBlob = new Blob([arrayBuffer], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.play().catch(error => {
        console.error('Failed to play audio:', error);
      });
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
    } catch (error) {
      console.error('Failed to play audio data:', error);
    }
  };

  // Move to next part
  const moveToNextPart = () => {
    socket?.emit('next_part');
  };

  // Get current feedback
  const getFeedback = () => {
    socket?.emit('get_feedback');
  };

  // Get session stats
  const getStats = () => {
    socket?.emit('get_session_stats');
  };

  // Pause/Resume session
  const pauseSession = () => {
    socket?.emit('pause_session');
  };

  const resumeSession = () => {
    socket?.emit('resume_session');
  };

  // Send text message (alternative to voice)
  const sendTextMessage = (message: string) => {
    if (message.trim()) {
      socket?.emit('text_message', { message });
      
      const candidateMessage: Message = {
        type: 'candidate',
        content: message,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, candidateMessage]);
    }
  };

  if (!audioPermission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              🎤
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Microphone Access Required
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              To practice IELTS speaking, we need access to your microphone to record and evaluate your responses.
            </p>
            <button
              onClick={requestMicrophonePermission}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Enable Microphone
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                IELTS Speaking Practice - Part {currentPart}
              </h1>
              <div className="flex items-center space-x-4 mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                </span>
                {sessionStats && (
                  <span className="text-sm text-gray-500">
                    {Math.floor(sessionStats.duration / 60000)}:{String(Math.floor((sessionStats.duration % 60000) / 1000)).padStart(2, '0')}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={getStats}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Stats
              </button>
              <button
                onClick={getFeedback}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              >
                Feedback
              </button>
              {!isTestComplete && (
                <button
                  onClick={moveToNextPart}
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                >
                  Next Part
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'candidate' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'candidate'
                    ? 'bg-blue-500 text-white'
                    : message.type === 'examiner'
                    ? 'bg-gray-200 text-gray-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                <div className="text-sm">{message.content}</div>
                {message.part && (
                  <div className="text-xs mt-1 opacity-75">Part {message.part}</div>
                )}
                <div className="text-xs mt-1 opacity-75">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Live Transcription */}
        {liveTranscription && (
          <div className="bg-blue-50 border-t px-6 py-3">
            <div className="text-sm text-blue-600">
              <span className="font-medium">You're saying: </span>
              {liveTranscription}
            </div>
          </div>
        )}

        {/* Recording Controls */}
        <div className="bg-white border-t px-6 py-4">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!isConnected}
              className={`flex items-center justify-center w-16 h-16 rounded-full text-white font-medium transition-all ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-blue-500 hover:bg-blue-600'
              } disabled:bg-gray-400 disabled:cursor-not-allowed`}
            >
              {isRecording ? '🛑' : '🎤'}
            </button>
            
            <div className="text-center">
              <div className="text-sm font-medium text-gray-700">
                {isRecording ? 'Recording...' : 'Click to start speaking'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Hold down to record your response
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Feedback */}
      <div className="w-80 bg-white border-l flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Live Feedback</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {feedback ? (
            <div className="space-y-4">
              {feedback.score && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-blue-900">Overall Score</div>
                  <div className="text-2xl font-bold text-blue-600">{feedback.score}/9</div>
                </div>
              )}
              
              {(feedback.fluency || feedback.vocabulary || feedback.grammar || feedback.pronunciation) && (
                <div className="grid grid-cols-2 gap-2">
                  {feedback.fluency && (
                    <div className="bg-green-50 rounded p-2 text-center">
                      <div className="text-xs text-green-600">Fluency</div>
                      <div className="font-semibold text-green-800">{feedback.fluency}</div>
                    </div>
                  )}
                  {feedback.vocabulary && (
                    <div className="bg-purple-50 rounded p-2 text-center">
                      <div className="text-xs text-purple-600">Vocabulary</div>
                      <div className="font-semibold text-purple-800">{feedback.vocabulary}</div>
                    </div>
                  )}
                  {feedback.grammar && (
                    <div className="bg-orange-50 rounded p-2 text-center">
                      <div className="text-xs text-orange-600">Grammar</div>
                      <div className="font-semibold text-orange-800">{feedback.grammar}</div>
                    </div>
                  )}
                  {feedback.pronunciation && (
                    <div className="bg-pink-50 rounded p-2 text-center">
                      <div className="text-xs text-pink-600">Pronunciation</div>
                      <div className="font-semibold text-pink-800">{feedback.pronunciation}</div>
                    </div>
                  )}
                </div>
              )}

              {feedback.feedback && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-900 mb-2">Feedback</div>
                  <div className="text-sm text-gray-700">{feedback.feedback}</div>
                </div>
              )}

              {feedback.strengths && feedback.strengths.length > 0 && (
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-green-900 mb-2">Strengths</div>
                  <ul className="text-sm text-green-700 space-y-1">
                    {feedback.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {feedback.suggestions && feedback.suggestions.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-yellow-900 mb-2">Suggestions</div>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {feedback.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-yellow-500 mr-2">💡</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-8">
              <div className="text-4xl mb-4">🎯</div>
              <div className="text-sm">Start speaking to receive feedback</div>
            </div>
          )}

          {sessionStats && (
            <div className="mt-6 bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-900 mb-2">Session Stats</div>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Questions:</span>
                  <span>{sessionStats.questionCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Exchanges:</span>
                  <span>{sessionStats.conversationLength}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{Math.floor(sessionStats.duration / 60000)}m {Math.floor((sessionStats.duration % 60000) / 1000)}s</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Test Completion */}
        {isTestComplete && (
          <div className="p-4 border-t bg-green-50">
            <div className="text-center">
              <div className="text-2xl mb-2">🎉</div>
              <div className="text-sm font-medium text-green-900">Test Completed!</div>
              <div className="text-xs text-green-700 mt-1">
                Check your final results above
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceChatComponent;