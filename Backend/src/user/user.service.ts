import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOrCreate(data: { googleId: string; email: string; name: string }): Promise<User> {
    let user = await this.userRepository.findOne({ where: { googleId: data.googleId } });
    if (!user) {
      user = this.userRepository.create(data);
      await this.userRepository.save(user);
    }
    return user;
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async getOverallScore(userId: number): Promise<number> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['answers'],
    });
    if (!user || !user.answers.length) return 0;
    const avg = user.answers.reduce((sum, ans) => sum + ans.overall, 0) / user.answers.length;
    return Math.round(avg * 2) / 2; // Round to nearest 0.5
  }
}