import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  // Enable synchronize to auto-create tables
  // Can be controlled via DB_SYNCHRONIZE env var (defaults to true for initial setup)
  synchronize: process.env.DB_SYNCHRONIZE !== 'false',
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
