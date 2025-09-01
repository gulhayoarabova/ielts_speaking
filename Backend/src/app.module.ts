import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; // ✅ import ConfigModule
import { UserModule } from './user/user.module';
import { TrainingModule } from './training/training.module';
import { HistoryModule } from './history/history.module';
import { User } from './user/user.entity';
import { Question } from './entities/question.entity';
import { Answer } from './entities/answer.entity';
import { AuthModule } from './auth/auth.module';
import { QuestionTempController } from './entities/questions.temp';

@Module({
  // imports: [
  //   ConfigModule.forRoot({ isGlobal: true }), // ✅ loads .env everywhere
  //   TypeOrmModule.forRoot({
  //     type: 'postgres',
  //     host: process.env.DB_HOST || 'localhost',
  //     port: Number(process.env.DB_PORT ?? 5432),
  //     username: process.env.DB_USER || 'postgres',
  //     password: process.env.DB_PASS || '5432',
  //     database: process.env.DB_NAME || 'ielts_backend',
  //     entities: [User, Question, Answer],
  //     synchronize: true,
  //   }),
  //   AuthModule,
  //   UserModule,
  //   TrainingModule,
  //   HistoryModule,
  // ],
  controllers: [QuestionTempController],
})
export class AppModule {}
