import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from '../entities/answer.entity';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
  ) {}

  async getHistory(userId: number) {
    return this.answerRepository.find({
      where: { user: { id: userId } },
      relations: ['question'],
      order: { timestamp: 'DESC' },
    });
  }
}