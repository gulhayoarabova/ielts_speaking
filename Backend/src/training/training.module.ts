import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingService } from './training.service';
import { TrainingController } from './training.controller';
import { Question } from '../entities/question.entity';
import { Answer } from '../entities/answer.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Question, Answer]), UserModule],
  providers: [TrainingService],
  controllers: [TrainingController],
})
export class TrainingModule {}