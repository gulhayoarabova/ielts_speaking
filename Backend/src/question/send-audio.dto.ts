// src/question/send-audio.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class SendAudioDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'Audio file (wav or mp3)' })
  audio: any;

  @ApiProperty({ type: 'string', description: 'IELTS question text' })
  question: string;
}
