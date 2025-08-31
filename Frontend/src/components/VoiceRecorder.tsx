import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Mic, Square, Play, Pause, MicOff, AlertTriangle } from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (data: { duration: string; audioUrl?: string }) => void;
}

export function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [hasRecording, setHasRecording] = useState(false);
  const [microphoneError, setMicrophoneError] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [permissionState, setPermissionState] = useState<'unknown' | 'granted' | 'denied'>('unknown');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check microphone permission on mount
    checkMicrophonePermission();
    
    return () => {
      // Cleanup on unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setPermissionState(permission.state as 'granted' | 'denied');
        
        // Listen for permission changes
        permission.onchange = () => {
          setPermissionState(permission.state as 'granted' | 'denied');
          if (permission.state === 'granted') {
            setMicrophoneError(null);
          }
        };
      }
    } catch (error) {
      // Permissions API not supported, we'll handle this during recording attempt
      console.log('Permissions API not supported');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setHasRecording(true);
        setIsSimulating(false);
        
        // Notify parent component with recording data
        onRecordingComplete({
          duration: formatTime(recordingTime),
          audioUrl: url
        });
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setPermissionState('granted');
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error: any) {
      console.error('Error accessing microphone:', error);
      
      let errorMessage = 'Unable to access microphone. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please enable microphone permissions in your browser settings and refresh the page.';
        setPermissionState('denied');
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No microphone found. Please connect a microphone and try again.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage += 'Your browser does not support audio recording.';
      } else {
        errorMessage += 'Please check your browser settings and try again.';
      }
      
      setMicrophoneError(errorMessage);
    }
  };

  const startSimulation = () => {
    setIsSimulating(true);
    setIsRecording(true);
    setRecordingTime(0);
    setMicrophoneError(null);
    
    // Start timer for simulation
    intervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopSimulation = () => {
    setIsRecording(false);
    setIsSimulating(false);
    setHasRecording(true);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Notify parent component with simulated recording data
    onRecordingComplete({
      duration: formatTime(recordingTime)
    });
  };

  const stopRecording = () => {
    if (isSimulating) {
      stopSimulation();
      return;
    }
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
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

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const resetRecording = () => {
    setHasRecording(false);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsSimulating(false);
    setMicrophoneError(null);
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {microphoneError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {microphoneError}
          </AlertDescription>
        </Alert>
      )}

      {/* Permission Instructions */}
      {permissionState === 'denied' && (
        <Alert>
          <MicOff className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <div className="space-y-2">
              <p>Microphone access is blocked. To enable:</p>
              <ul className="list-disc list-inside text-xs space-y-1 ml-4">
                <li>Click the microphone icon in your browser's address bar</li>
                <li>Select "Allow" and refresh the page</li>
                <li>Or use the simulation mode below</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Recording Controls */}
      <div className="text-center space-y-4">
        {!isRecording && !hasRecording && (
          <div className="space-y-3">
            <Button onClick={startRecording} size="lg" className="w-32">
              <Mic className="w-4 h-4 mr-2" />
              Record
            </Button>
            
            {(microphoneError || permissionState === 'denied') && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Or practice without recording:</p>
                <Button onClick={startSimulation} variant="outline" size="lg">
                  <MicOff className="w-4 h-4 mr-2" />
                  Simulate Recording
                </Button>
              </div>
            )}
          </div>
        )}
        
        {isRecording && (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-lg font-mono">{formatTime(recordingTime)}</span>
              {isSimulating && (
                <span className="text-sm text-muted-foreground">(Simulated)</span>
              )}
            </div>
            <Button onClick={stopRecording} variant="destructive" size="lg">
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          </div>
        )}
        
        {hasRecording && !isRecording && (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              {audioUrl ? (
                <Button onClick={togglePlayback} variant="outline">
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Play
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <MicOff className="w-4 h-4" />
                  <span className="text-sm">Simulated recording</span>
                </div>
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

      {/* Recording Instructions */}
      {!microphoneError && permissionState !== 'denied' && (
        <div className="text-sm text-muted-foreground text-center space-y-2">
          <p>🎤 Make sure your microphone is enabled</p>
          <p>Speak clearly and at a comfortable volume</p>
        </div>
      )}
      
      {isSimulating && (
        <div className="text-sm text-muted-foreground text-center space-y-2">
          <p>📝 Simulation mode: Practice speaking your response aloud</p>
          <p>The timer will track your speaking duration</p>
        </div>
      )}
    </div>
  );
}