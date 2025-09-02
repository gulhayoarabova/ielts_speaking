// src/question/generated-question.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class GeneratedQuestionDto {
  @ApiProperty({ example: 'Describe a place you visited that you really liked.' })
  question: string;
}
