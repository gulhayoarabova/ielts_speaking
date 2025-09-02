import { Controller, Post, Req, UseGuards, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { TrainingService } from './training.service';
import { SubmitAnswerDto } from './training.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('training')
@Controller('training')
export class TrainingController {
  constructor(private trainingService: TrainingService) {}

  @Post('start')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start a new training session by generating a question' })
  @ApiResponse({ status: 200, description: 'Returns a new IELTS question (text and optional image)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async start(@Req() req) {
    return this.trainingService.generateQuestion();
  }

  @Post('submit')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('audio'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Submit an audio answer for a question' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        questionId: { type: 'number', description: 'ID of the question', example: 1 },
        audio: { type: 'string', format: 'binary', description: 'Audio file (MP3)' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Returns the scored answer with IELTS criteria' })
  @ApiResponse({ status: 400, description: 'Invalid questionId or missing audio' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async submit(
    @Req() req,
    @UploadedFile() audio: Express.Multer.File,
    @Body() body: SubmitAnswerDto,
  ) {
    return this.trainingService.processAnswer(req.user.id, body.questionId, audio.buffer);
  }
}