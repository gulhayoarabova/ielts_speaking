import { 
  Controller, Post, UploadedFile, UseInterceptors, Body, Get 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody, ApiTags, ApiResponse } from '@nestjs/swagger';
import { SendToAiService } from './send-to-ai.service';
import { SendAudioDto } from './send-audio.dto';
import { GeneratedQuestionDto } from './generated-question.dto';

@ApiTags('ielts')
@Controller()
export class SendToAiController {
  constructor(private readonly sendToAiService: SendToAiService) {}

  @Post('send-audio')
  @UseInterceptors(FileInterceptor('audio', { dest: './uploads' }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: SendAudioDto })
  @ApiResponse({ status: 200, description: 'Evaluation result from AI service' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('question') question: string,
  ) {
    if (!file || !file.path) {
      throw new Error('File not uploaded correctly');
    }
    if (!question) {
      throw new Error('Question is required');
    }

    return this.sendToAiService.sendAudioToAI(file.path, question);
  }

  @Get('generate-question')
  @ApiResponse({ status: 200, description: 'Randomly generated IELTS question', type: GeneratedQuestionDto })
  async getQuestion() {
    return this.sendToAiService.generateQuestion();
  }
}
