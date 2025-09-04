import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as express from 'express';
import * as dotenv from 'dotenv';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TrainingModule } from './training/training.module';
import { HistoryModule } from './history/history.module';
import { SendToAiModule } from './question/send-to-ai.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config = new DocumentBuilder()
    .setTitle('IELTS Speaking AI App')
    .setDescription('Backend for IELTS speaking practice with AI scoring')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    include: [
      // Explicitly include all modules to ensure controllers are scanned
      AppModule,
      SendToAiModule,
      // AuthModule,
      // UserModule,
      // TrainingModule,
      // HistoryModule,
    ],
  });
  SwaggerModule.setup('api', app, document);

  app.useWebSocketAdapter(new IoAdapter(app));

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080', 'http://192.168.0.174:8080', 'https://ielts-speaking-practice.vercel.app'],
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();