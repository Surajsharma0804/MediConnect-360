import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum WearableType {
  APPLE_WATCH = 'APPLE_WATCH',
  FITBIT = 'FITBIT',
  GARMIN = 'GARMIN',
  SAMSUNG_GALAXY_WATCH = 'SAMSUNG_GALAXY_WATCH',
  WITHINGS = 'WITHINGS',
  OURA_RING = 'OURA_RING',
  WHOOP = 'WHOOP',
  GOOGLE_FIT = 'GOOGLE_FIT',
  APPLE_HEALTH = 'APPLE_HEALTH',
  CGM = 'CGM', // Continuous Glucose Monitor
  SMART_SCALE = 'SMART_SCALE',
  BLOOD_PRESSURE_MONITOR = 'BLOOD_PRESSURE_MONITOR',
}

export enum ConnectionStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  SYNCING = 'SYNCING',
  ERROR = 'ERROR',
}

@Entity('wearable_devices')
export class WearableDevice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    type: 'enum',
    enum: WearableType,
  })
  deviceType: WearableType;

  @Column({ type: 'varchar', length: 255 })
  deviceName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  deviceModel: string;

  @Column({
    type: 'enum',
    enum: ConnectionStatus,
    default: ConnectionStatus.DISCONNECTED,
  })
  status: ConnectionStatus;

  @Column({ name: 'access_token', nullable: true })
  accessToken: string | null;

  @Column({ name: 'refresh_token', nullable: true })
  refreshToken: string | null;

  @Column({ name: 'token_expires_at', type: 'timestamp', nullable: true })
  tokenExpiresAt: Date;

  @Column({ name: 'last_sync_at', type: 'timestamp', nullable: true })
  lastSyncAt: Date;

  @Column({ name: 'sync_frequency_minutes', default: 60 })
  syncFrequencyMinutes: number;

  @Column({ name: 'auto_sync', default: true })
  autoSync: boolean;

  @Column({ type: 'jsonb', nullable: true })
  syncedDataTypes: string[]; // ['steps', 'heart_rate', 'sleep', 'calories', etc.]

  @Column({ type: 'jsonb', nullable: true })
  deviceInfo: {
    manufacturer?: string;
    model?: string;
    firmwareVersion?: string;
    batteryLevel?: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  syncStats: {
    totalSyncs?: number;
    lastSyncDuration?: number;
    dataPointsSynced?: number;
    errors?: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
