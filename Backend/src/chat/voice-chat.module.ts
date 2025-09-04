import { Module } from '@nestjs/common';
import { VoiceChatService } from './voice-chat.service';
import { SendToAiModule } from '../question/send-to-ai.module';
import { VoiceChatGateway } from './chat.gateway';

@Module({
  imports: [SendToAiModule],
  providers: [VoiceChatGateway, VoiceChatService],
  exports: [VoiceChatService],
})
export class VoiceChatModule {}