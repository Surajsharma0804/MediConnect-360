import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { User } from '../entities/user.entity';
import { AuditLog } from '../common/entities/audit-log.entity';

export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, AuditLog], // Only load specific entities for now
  synchronize: process.env.NODE_ENV !== 'production', // Only for development
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  autoLoadEntities: true,
});