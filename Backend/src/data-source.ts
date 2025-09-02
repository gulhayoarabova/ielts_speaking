import { DataSource } from 'typeorm';
import { User } from './user/user.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '5432',
  database: 'ielts_backend',
  entities: [User],
  migrations: ['src/migrations/*.ts'],
});
