// chat.gateway.ts — yangilangan handleAudioChunk (faqat tegishli qism)
import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SendToAiService } from '../question/send-to-ai.service';

@WebSocketGateway({
  cors: { origin: [/* ... */], credentials: true },
  namespace: '/voice-chat',
})
export class VoiceChatGateway {
  @WebSocketServer()
  server: Server;

  private clientLastSent: Map<string, boolean> = new Map(); // track last flag per client

  constructor(private readonly sendToAiService: SendToAiService) {}

  @SubscribeMessage('audio_chunk')
  async handleAudioChunk(
    @MessageBody() data: { chunk: string; isLast: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const clientId = client.id;
    console.log(`📦 Audio chunk received from ${clientId}, last=${data.isLast}`);

    try {
      // Prevent processing duplicate "last" signals
      if (data.isLast) {
        if (this.clientLastSent.get(clientId)) {
          console.log(`⚠️ Duplicate last detected for ${clientId}, ignoring.`);
          return;
        }
        this.clientLastSent.set(clientId, true);
      }

      // If blank chunk and not last -> ignore
      if (!data.chunk && !data.isLast) {
        return;
      }

      // Call AI service
      const response = await this.sendToAiService.sendChunkToAI('current_question', data.chunk);

      console.log('Normalized AI response:', JSON.stringify(response));

      // live transcription (prefer normalized.transcript or original.transcript)
      const transcript = response.transcript ?? response.original?.transcript ?? '';

      await client.emit('live_transcription', { text: transcript, timestamp: new Date().toISOString() });

      // evaluation / feedback
      const evalObj = response.evaluation ?? {};
      // ensure score is numeric if possible
      const score = evalObj.score ?? evalObj.overall_band ?? evalObj.score_float ?? null;

      await client.emit('feedback', {
        feedback: evalObj.feedback ?? '',
        score: typeof score === 'string' ? parseFloat(score) || null : score,
        strengths: evalObj.strengths ?? [],
        suggestions: evalObj.suggestions ?? [],
      });

      // examiner textual response (if any)
      if (response.ai_response) {
        await client.emit('ai_message', {
          content: response.ai_response,
          timestamp: new Date().toISOString(),
        });
      }

      // TTS audio if available
      if (response.ai_audio_base64) {
        await client.emit('ai_audio', {
          audio_data: response.ai_audio_base64,
          timestamp: new Date().toISOString(),
        });
      }

    } catch (err: any) {
      console.error('❌ Error while sending chunk to AI:', err?.message ?? err);
      client.emit('error', { message: 'Failed to process audio chunk' });
    }
  }

  handleConnection(client: Socket) {
    console.log(`🔌 Client connected: ${client.id}`);
    this.clientLastSent.set(client.id, false);
    // send greeting...
  }

  handleDisconnect(client: Socket) {
    this.clientLastSent.delete(client.id);
    console.log(`❌ Client disconnected: ${client.id}`);
  }
}
