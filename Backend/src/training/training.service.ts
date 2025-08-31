import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../entities/question.entity';
import { Answer } from '../entities/answer.entity';
import { generateQuestionWithDeepSeek, scoreWithDeepSeek } from '../utils/deepseek.util';
import { transcribeAudio } from '../utils/stt.util';
import { generateImage } from '../utils/image-gen.util';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
  ) {}

  async generateQuestion(): Promise<Question> {
    const { text, imagePrompt } = await generateQuestionWithDeepSeek();
    let imageUrl: string | null = null;
    if (imagePrompt) {
      const imageBuffer = await generateImage(imagePrompt);
      const imagePath = path.join(__dirname, '../../uploads/images', `${Date.now()}.png`);
      await fs.mkdir(path.dirname(imagePath), { recursive: true });
      await fs.writeFile(imagePath, imageBuffer);
      imageUrl = `/uploads/images/${path.basename(imagePath)}`; // Serve statically
    }
    const question = this.questionRepository.create({ text, imageUrl });
    return this.questionRepository.save(question);
  }

  async processAnswer(userId: number, questionId: number, audioBuffer: Buffer): Promise<Answer> {
    const transcript = await transcribeAudio(audioBuffer);
    const question = await this.questionRepository.findOne({ where: { id: questionId } });
    if (!question) {
      throw new Error('Question not found');
    }
    const previousAnswers = await this.answerRepository.find({
      where: { user: { id: userId }, question: { id: questionId } },
      order: { timestamp: 'DESC' },
    });
    const previous = previousAnswers[0];
    const { fluency, grammar, vocabulary, pronunciation, overall, improvement } = await scoreWithDeepSeek(
      transcript,
      question.text,
      previous ? previous.transcript : undefined,
    );

    const audioPath = path.join(__dirname, '../../uploads/audio', `${Date.now()}.mp3`);
    await fs.mkdir(path.dirname(audioPath), { recursive: true });
    await fs.writeFile(audioPath, audioBuffer);
    const audioUrl = `/uploads/audio/${path.basename(audioPath)}`;

    const answer = this.answerRepository.create({
      user: { id: userId },
      question: { id: questionId },
      audioUrl,
      transcript,
      fluency,
      grammar,
      vocabulary,
      pronunciation,
      overall,
      improvement: previous ? improvement : null,
      timestamp: new Date(),
    });
    return this.answerRepository.save(answer);
  }
}