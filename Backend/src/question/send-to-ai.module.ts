import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { SendToAiController } from './send-to-ai.controller';
import { SendToAiService } from './send-to-ai.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [SendToAiController],
  providers: [SendToAiService],
  exports: [SendToAiService], // <-- export so AppModule can use it
})
export class SendToAiModule {}
