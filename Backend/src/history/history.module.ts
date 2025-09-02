import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { Answer } from '../entities/answer.entity';
import { Question } from '../entities/question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Answer, Question])],
  providers: [HistoryService],
  controllers: [HistoryController],
})
export class HistoryModule {}