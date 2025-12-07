import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reminder } from '../entities/reminder.entity';
import { User } from '../entities/user.entity';
import { ReminderService } from './services/reminder.service';
import { ReminderController } from './controllers/reminder.controller';
import { NotificationService } from '../services/notification.service';
import { EmailService } from '../services/email.service';
import { SMSService } from '../services/sms.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reminder, User])],
  controllers: [ReminderController],
  providers: [
    ReminderService,
    NotificationService,
    EmailService,
    SMSService,
  ],
  exports: [ReminderService],
})
export class RemindersModule {}
