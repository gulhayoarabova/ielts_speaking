// src/chat/chat.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { SendToAiService } from '../question/send-to-ai.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:8080', 'https://ielts-speaking-practice.vercel.app'],
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly aiService: SendToAiService) {}

  @SubscribeMessage('sendAudio')
  async handleAudio(
    @MessageBody() data: { question: string; audioPath: string },
  ) {
    try {
      const response = await this.aiService.sendAudioToAI(
        data.audioPath,
        data.question,
      );

      // Send AI evaluation back to client
      this.server.emit('aiResponse', response);
    } catch (err: any) {
      this.server.emit('aiResponse', { error: err.message });
    }
  }
}
