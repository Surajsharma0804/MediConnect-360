import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ConversationType {
  DIRECT = 'direct',
  GROUP = 'group',
  PROVIDER_PATIENT = 'provider_patient',
  CARE_TEAM = 'care_team',
}

@Entity('conversations')
@Index(['type'])
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ConversationType,
    default: ConversationType.DIRECT,
  })
  type: ConversationType;

  @Column({ length: 255, nullable: true })
  name: string;

  @Column({ type: 'jsonb' })
  participants: string[]; // Array of user IDs

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  lastMessageId: string;

  @Column({ type: 'text', nullable: true })
  lastMessageContent: string;

  @Column({ type: 'timestamp', nullable: true })
  lastMessageAt: Date;

  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  @Column({ type: 'boolean', default: false })
  isMuted: boolean;

  @Column({ type: 'jsonb', nullable: true })
  mutedBy: string[]; // Array of user IDs who muted this conversation

  @Column({ type: 'jsonb', nullable: true })
  unreadCount: Record<string, number>; // { userId: count }

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
