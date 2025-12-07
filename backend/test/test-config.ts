import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const testDatabaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.TEST_DB_HOST || 'localhost',
  port: parseInt(process.env.TEST_DB_PORT) || 5432,
  username: process.env.TEST_DB_USER || 'postgres',
  password: process.env.TEST_DB_PASSWORD || 'password',
  database: process.env.TEST_DB_NAME || 'mediconnect_test',
  entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
  synchronize: true, // Auto-create tables for tests
  dropSchema: true, // Drop schema before each test run
  logging: false,
};
