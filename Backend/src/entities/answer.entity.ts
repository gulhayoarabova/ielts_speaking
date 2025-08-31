import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { Question } from './question.entity';

@Entity()
export class Answer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.answers)
  user: User;

  @ManyToOne(() => Question, (question) => question.answers)
  question: Question;

  @Column()
  audioUrl: string;

  @Column('text')
  transcript: string;

  @Column()
  fluency: number;

  @Column()
  grammar: number;

  @Column()
  vocabulary: number;

  @Column()
  pronunciation: number;

  @Column()
  overall: number;

  @Column('text', { nullable: true })
  improvement: string | null;

  @Column()
  timestamp: Date;
}