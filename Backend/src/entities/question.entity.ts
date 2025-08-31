import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Answer } from './answer.entity';

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  text: string;

  @Column({ type: 'text', nullable: true })
  imageUrl: string | null;

  @OneToMany(() => Answer, (answer) => answer.question)
  answers: Answer[];
}