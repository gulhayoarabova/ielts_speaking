import { Answer } from 'src/entities/answer.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  password: string; // hashed password

  @Column()
  name: string;

  @Column({ unique: true, nullable: true })
  googleId: string;

  @OneToMany(() => Answer, (answer) => answer.user, { cascade: true })
  answers: Answer[];
}
