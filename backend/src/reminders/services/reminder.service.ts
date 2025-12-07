import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import {
  Reminder,
  ReminderType,
  ReminderFrequency,
  ReminderStatus,
} from '../../entities/reminder.entity';
import { NotificationService } from '../../services/notification.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ReminderService {
  constructor(
    @InjectRepository(Reminder)
    private reminderRepository: Repository<Reminder>,
    private notificationService: NotificationService,
  ) {}

  async create(
    userId: string,
    data: {
      title: string;
      description?: string;
      reminderType: ReminderType;
      frequency: ReminderFrequency;
      reminderTime: Date;
      endDate?: Date;
      daysOfWeek?: string[];
      customSchedule?: any;
      notificationMethods: string[];
      advanceNoticeMinutes?: number;
      relatedData?: any;
      notes?: string;
    },
  ): Promise<Reminder> {
    const reminder = this.reminderRepository.create({
      userId,
      ...data,
      status: ReminderStatus.ACTIVE,
      isRecurring: data.frequency !== ReminderFrequency.ONCE,
      nextReminderTime: data.reminderTime,
    });

    const savedReminder = await this.reminderRepository.save(reminder);

    await this.notificationService.sendPushNotification(userId, {
      title: 'Reminder Created',
      body: `Reminder "${data.title}" has been set.`,
    });

    return savedReminder;
  }

  async findAll(userId: string): Promise<Reminder[]> {
    return this.reminderRepository.find({
      where: { userId },
      order: { nextReminderTime: 'ASC' },
    });
  }

  async findUpcoming(userId: string, hours: number = 24): Promise<Reminder[]> {
    const now = new Date();
    const future = new Date(now.getTime() + hours * 60 * 60 * 1000);

    return this.reminderRepository.find({
      where: {
        userId,
        status: ReminderStatus.ACTIVE,
        nextReminderTime: MoreThan(now) && LessThan(future),
      },
      order: { nextReminderTime: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Reminder> {
    const reminder = await this.reminderRepository.findOne({
      where: { id, userId },
    });

    if (!reminder) {
      throw new NotFoundException('Reminder not found');
    }

    return reminder;
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Reminder>,
  ): Promise<Reminder> {
    const reminder = await this.findOne(id, userId);

    Object.assign(reminder, data);

    return this.reminderRepository.save(reminder);
  }

  async delete(id: string, userId: string): Promise<void> {
    const reminder = await this.findOne(id, userId);

    reminder.status = ReminderStatus.CANCELLED;

    await this.reminderRepository.save(reminder);
  }

  async snooze(
    id: string,
    userId: string,
    minutes: number,
  ): Promise<Reminder> {
    const reminder = await this.findOne(id, userId);

    const snoozeUntil = new Date(Date.now() + minutes * 60 * 1000);
    reminder.snoozeUntil = snoozeUntil;
    reminder.status = ReminderStatus.SNOOZED;

    return this.reminderRepository.save(reminder);
  }

  async complete(id: string, userId: string): Promise<Reminder> {
    const reminder = await this.findOne(id, userId);

    reminder.completionCount += 1;
    reminder.lastCompletedAt = new Date();

    if (reminder.isRecurring) {
      // Calculate next reminder time
      reminder.nextReminderTime = this.calculateNextReminderTime(reminder);
      reminder.status = ReminderStatus.ACTIVE;
    } else {
      reminder.status = ReminderStatus.COMPLETED;
    }

    return this.reminderRepository.save(reminder);
  }

  private calculateNextReminderTime(reminder: Reminder): Date {
    const now = new Date();

    switch (reminder.frequency) {
      case ReminderFrequency.DAILY:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);

      case ReminderFrequency.WEEKLY:
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      case ReminderFrequency.MONTHLY:
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth;

      case ReminderFrequency.CUSTOM:
        if (reminder.customSchedule?.interval) {
          return new Date(
            now.getTime() + reminder.customSchedule.interval * 60 * 1000,
          );
        }
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);

      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async processReminders(): Promise<void> {
    const now = new Date();

    const dueReminders = await this.reminderRepository.find({
      where: {
        status: ReminderStatus.ACTIVE,
        nextReminderTime: LessThan(now),
      },
      relations: ['user'],
    });

    for (const reminder of dueReminders) {
      await this.sendReminderNotification(reminder);
    }
  }

  private async sendReminderNotification(reminder: Reminder): Promise<void> {
    const methods = reminder.notificationMethods || ['push'];

    if (methods.includes('push')) {
      await this.notificationService.sendPushNotification(reminder.userId, {
        title: reminder.title,
        body: reminder.description || 'You have a reminder',
      });
    }

    // Update reminder status
    if (reminder.isRecurring) {
      reminder.nextReminderTime = this.calculateNextReminderTime(reminder);
      await this.reminderRepository.save(reminder);
    } else {
      reminder.status = ReminderStatus.COMPLETED;
      await this.reminderRepository.save(reminder);
    }
  }

  async getStatistics(userId: string): Promise<any> {
    const reminders = await this.reminderRepository.find({
      where: { userId },
    });

    const stats = {
      total: reminders.length,
      active: reminders.filter((r) => r.status === ReminderStatus.ACTIVE)
        .length,
      completed: reminders.filter((r) => r.status === ReminderStatus.COMPLETED)
        .length,
      snoozed: reminders.filter((r) => r.status === ReminderStatus.SNOOZED)
        .length,
      byType: {} as Record<string, number>,
      totalCompletions: reminders.reduce(
        (sum, r) => sum + r.completionCount,
        0,
      ),
      upcomingToday: reminders.filter(
        (r) =>
          r.status === ReminderStatus.ACTIVE &&
          r.nextReminderTime &&
          r.nextReminderTime.toDateString() === new Date().toDateString(),
      ).length,
    };

    reminders.forEach((reminder) => {
      stats.byType[reminder.reminderType] =
        (stats.byType[reminder.reminderType] || 0) + 1;
    });

    return stats;
  }

  async createMedicationReminder(
    userId: string,
    data: {
      medicationName: string;
      dosage: string;
      times: string[];
      startDate: Date;
      endDate?: Date;
      medicationId?: string;
    },
  ): Promise<Reminder[]> {
    const reminders: Reminder[] = [];

    for (const time of data.times) {
      const [hours, minutes] = time.split(':').map(Number);
      const reminderTime = new Date(data.startDate);
      reminderTime.setHours(hours, minutes, 0, 0);

      const reminder = await this.create(userId, {
        title: `Take ${data.medicationName}`,
        description: `Dosage: ${data.dosage}`,
        reminderType: ReminderType.MEDICATION,
        frequency: ReminderFrequency.DAILY,
        reminderTime,
        endDate: data.endDate,
        notificationMethods: ['push', 'email'],
        advanceNoticeMinutes: 0,
        relatedData: {
          medicationId: data.medicationId,
          medicationName: data.medicationName,
          dosage: data.dosage,
        },
      });

      reminders.push(reminder);
    }

    return reminders;
  }
}
