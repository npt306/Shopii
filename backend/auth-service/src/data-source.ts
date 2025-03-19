// data-source.ts
import { DataSource } from 'typeorm';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config(); // load .env variables

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [join(process.cwd(), 'dist/**/*.entity{.ts,.js}')],
  migrations: [join(process.cwd(), 'src/migrations/*{.ts,.js}')],
  synchronize: false, // Always false for production and migration-based workflows
});
