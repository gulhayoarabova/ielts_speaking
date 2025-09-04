import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { SendToAiService } from '../question/send-to-ai.service';
import { VoiceChatService } from './voice-chat.service';

interface UserSession {
  socketId: string;
  userId?: string;
  sessionId: string;
  currentPart: number;
  questionCount: number;
  conversationHistory: Array<{
    type: 'candidate' | 'examiner';
    content: string;
    timestamp: Date;
    audioData?: string;
  }>;
  connectedAt: Date;
  isRecording: boolean;
  currentQuestion?: string;
}

@WebSocketGateway({
  cors: {
    origin: [
      'https://ielts-speaking-practice.vercel.app',
      'http://localhost:5173',
      'http://localhost:8080',
      'https://ielts-speaking-1.onrender.com',
      'https://ielts-speaking-9aqo.onrender.com'
    ],
  },
  namespace: '/voice-chat'
})
@Injectable()
export class VoiceChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(VoiceChatGateway.name);
  private activeSessions: Map<string, UserSession> = new Map();

  constructor(
    private readonly aiService: SendToAiService,
    private readonly voiceChatService: VoiceChatService,
  ) {}

  async handleConnection(client: Socket) {
    const sessionId = this.generateSessionId();
    
    const session: UserSession = {
      socketId: client.id,
      sessionId,
      currentPart: 1,
      questionCount: 0,
      conversationHistory: [],
      connectedAt: new Date(),
      isRecording: false,
    };

    this.activeSessions.set(client.id, session);
    this.logger.log(`Client connected: ${client.id}, Session: ${sessionId}`);

    // Send initial greeting
    const initialGreeting = await this.voiceChatService.getInitialGreeting();
    
    client.emit('session_started', {
      sessionId,
      message: 'Connected to IELTS Voice Chat',
      currentPart: 1,
    });

    client.emit('ai_message', {
      type: 'examiner',
      content: initialGreeting,
      timestamp: new Date().toISOString(),
      audioAvailable: true,
    });

    // Generate TTS for initial greeting
    try {
      const audioData = await this.voiceChatService.generateSpeech(initialGreeting);
      if (audioData) {
        client.emit('ai_audio', {
          audioData,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      this.logger.error('TTS generation failed:', error);
    }
  }

  async handleDisconnect(client: Socket) {
    const session = this.activeSessions.get(client.id);
    if (session) {
      this.logger.log(`Client disconnected: ${client.id}, Session: ${session.sessionId}`);
      
      // Save session data before cleanup
      await this.voiceChatService.saveSession(session);
      this.activeSessions.delete(client.id);
    }
  }

  @SubscribeMessage('start_recording')
  async handleStartRecording(@ConnectedSocket() client: Socket) {
    const session = this.activeSessions.get(client.id);
    if (session) {
      session.isRecording = true;
      client.emit('recording_started', {
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('stop_recording')
  async handleStopRecording(@ConnectedSocket() client: Socket) {
    const session = this.activeSessions.get(client.id);
    if (session) {
      session.isRecording = false;
      client.emit('recording_stopped', {
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('audio_chunk')
  async handleAudioChunk(
    @MessageBody() data: { chunk: string; isLast: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const session = this.activeSessions.get(client.id);
    if (!session) {
      client.emit('error', { message: 'Session not found' });
      return;
    }

    try {
      // Send chunk to AI service for transcription
      const transcription = await this.voiceChatService.transcribeAudioChunk(data.chunk);
      
      if (transcription) {
        // Send real-time transcription to client
        client.emit('live_transcription', {
          text: transcription,
          timestamp: new Date().toISOString(),
        });

        // If this is the last chunk, process the complete response
        if (data.isLast) {
          await this.processCompleteResponse(client, session, transcription);
        }
      }
    } catch (error) {
      this.logger.error('Audio chunk processing error:', error);
      client.emit('error', { message: 'Failed to process audio' });
    }
  }

  @SubscribeMessage('text_message')
  async handleTextMessage(
    @MessageBody() data: { message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const session = this.activeSessions.get(client.id);
    if (!session) {
      client.emit('error', { message: 'Session not found' });
      return;
    }

    await this.processCompleteResponse(client, session, data.message);
  }

  @SubscribeMessage('next_part')
  async handleNextPart(@ConnectedSocket() client: Socket) {
    const session = this.activeSessions.get(client.id);
    if (!session) {
      client.emit('error', { message: 'Session not found' });
      return;
    }

    session.currentPart += 1;
    session.questionCount = 0;

    if (session.currentPart > 3) {
      // Test completed
      const finalEvaluation = await this.voiceChatService.generateFinalEvaluation(
        session.conversationHistory
      );

      client.emit('test_complete', {
        evaluation: finalEvaluation,
        sessionSummary: {
          totalDuration: Date.now() - session.connectedAt.getTime(),
          totalExchanges: session.conversationHistory.length,
          partsCompleted: 3,
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const partInstruction = this.voiceChatService.getPartInstruction(session.currentPart);
    
    client.emit('part_transition', {
      currentPart: session.currentPart,
      instruction: partInstruction,
      timestamp: new Date().toISOString(),
    });

    // Generate first question for the new part
    const firstQuestion = await this.voiceChatService.generateQuestion(
      session.currentPart,
      session.conversationHistory
    );

    session.conversationHistory.push({
      type: 'examiner',
      content: firstQuestion,
      timestamp: new Date(),
    });

    client.emit('ai_message', {
      type: 'examiner',
      content: firstQuestion,
      timestamp: new Date().toISOString(),
      part: session.currentPart,
    });

    // Generate TTS for the question
    try {
      const audioData = await this.voiceChatService.generateSpeech(firstQuestion);
      if (audioData) {
        client.emit('ai_audio', {
          audioData,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      this.logger.error('TTS generation failed:', error);
    }
  }

  @SubscribeMessage('get_feedback')
  async handleGetFeedback(@ConnectedSocket() client: Socket) {
    const session = this.activeSessions.get(client.id);
    if (!session || session.conversationHistory.length < 2) {
      client.emit('feedback', {
        message: 'Not enough conversation data for feedback',
      });
      return;
    }

    const feedback = await this.voiceChatService.generateRealtimeFeedback(
      session.conversationHistory.slice(-4) // Last 2 exchanges
    );

    client.emit('feedback', {
      ...feedback,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('pause_session')
  async handlePauseSession(@ConnectedSocket() client: Socket) {
    const session = this.activeSessions.get(client.id);
    if (session) {
      client.emit('session_paused', {
        message: 'Session paused. Say "continue" to resume.',
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('resume_session')
  async handleResumeSession(@ConnectedSocket() client: Socket) {
    const session = this.activeSessions.get(client.id);
    if (session) {
      client.emit('session_resumed', {
        message: 'Session resumed. Please continue speaking.',
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', {
      timestamp: new Date().toISOString(),
    });
  }

  private async processCompleteResponse(
    client: Socket,
    session: UserSession,
    candidateResponse: string
  ) {
    // Add candidate response to conversation history
    session.conversationHistory.push({
      type: 'candidate',
      content: candidateResponse,
      timestamp: new Date(),
    });

    // Generate AI examiner response
    const aiResponse = await this.voiceChatService.generateExaminerResponse(
      session.conversationHistory,
      session.currentPart,
      session.questionCount
    );

    session.conversationHistory.push({
      type: 'examiner',
      content: aiResponse,
      timestamp: new Date(),
    });

    session.questionCount += 1;

    // Send AI response to client
    client.emit('ai_message', {
      type: 'examiner',
      content: aiResponse,
      timestamp: new Date().toISOString(),
      part: session.currentPart,
    });

    // Generate real-time evaluation
    const quickFeedback = await this.voiceChatService.generateQuickEvaluation(
      candidateResponse,
      session.currentQuestion || 'General speaking'
    );

    client.emit('quick_feedback', {
      ...quickFeedback,
      timestamp: new Date().toISOString(),
    });

    // Generate TTS for AI response
    try {
      const audioData = await this.voiceChatService.generateSpeech(aiResponse);
      if (audioData) {
        client.emit('ai_audio', {
          audioData,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      this.logger.error('TTS generation failed:', error);
    }

    // Update current question
    session.currentQuestion = aiResponse;

    // Check if should move to next part automatically
    if (this.shouldTransitionToNextPart(session)) {
      setTimeout(() => {
        this.handleNextPart(client);
      }, 2000); // 2 second delay before transition
    }
  }

  private shouldTransitionToNextPart(session: UserSession): boolean {
    const partLimits = { 1: 4, 2: 1, 3: 4 }; // Max questions per part
    return session.questionCount >= partLimits[session.currentPart as keyof typeof partLimits];
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Admin methods for monitoring
  @SubscribeMessage('get_session_stats')
  handleGetStats(@ConnectedSocket() client: Socket) {
    const session = this.activeSessions.get(client.id);
    if (session) {
      client.emit('session_stats', {
        sessionId: session.sessionId,
        currentPart: session.currentPart,
        questionCount: session.questionCount,
        conversationLength: session.conversationHistory.length,
        duration: Date.now() - session.connectedAt.getTime(),
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get all active sessions (for admin dashboard)
  getActiveSessions() {
    return Array.from(this.activeSessions.values()).map(session => ({
      sessionId: session.sessionId,
      currentPart: session.currentPart,
      questionCount: session.questionCount,
      duration: Date.now() - session.connectedAt.getTime(),
      conversationLength: session.conversationHistory.length,
    }));
  }
}