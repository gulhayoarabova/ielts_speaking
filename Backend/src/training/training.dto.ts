import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitAnswerDto {
  @ApiProperty({ description: 'ID of the question being answered', example: 1 })
  @IsNumber()
  questionId: number;
}