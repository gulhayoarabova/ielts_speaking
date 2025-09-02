import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SendToAiService } from './send-to-ai.service';

@ApiTags('AI Evaluation')
@Controller('send-audio')
export class SendToAiController {
  constructor(private readonly sendToAiService: SendToAiService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const filePath = file.path;
    const result = await this.sendToAiService.sendAudioToAI(filePath);
    return { success: true, result };
  }
}
