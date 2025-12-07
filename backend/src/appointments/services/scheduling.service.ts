import { Injectable, Logger } from '@nestjs/common';
import { AppointmentService } from './appointment.service';

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

@Injectable()
export class SchedulingService {
  private readonly logger = new Logger(SchedulingService.name);

  constructor(private readonly appointmentService: AppointmentService) {}

  async getAvailableSlots(
    providerId: string,
    date: Date,
    duration: number = 30,
  ): Promise<TimeSlot[]> {
    try {
      // Get provider's schedule for the day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const appointments = await this.appointmentService.getProviderSchedule(
        providerId,
        startOfDay,
        endOfDay,
      );

      // Generate time slots (9 AM to 5 PM)
      const slots: TimeSlot[] = [];
      const workStart = new Date(date);
      workStart.setHours(9, 0, 0, 0);
      
      const workEnd = new Date(date);
      workEnd.setHours(17, 0, 0, 0);

      let currentTime = new Date(workStart);
      
      while (currentTime < workEnd) {
        const slotEnd = new Date(currentTime.getTime() + duration * 60000);
        
        // Check if slot conflicts with existing appointments
        const hasConflict = appointments.some((apt) => {
          const aptEnd = new Date(apt.scheduledAt.getTime() + apt.durationMinutes * 60000);
          return (
            (currentTime >= apt.scheduledAt && currentTime < aptEnd) ||
            (slotEnd > apt.scheduledAt && slotEnd <= aptEnd)
          );
        });

        slots.push({
          start: new Date(currentTime),
          end: new Date(slotEnd),
          available: !hasConflict,
        });

        currentTime = new Date(slotEnd);
      }

      return slots;
    } catch (error) {
      this.logger.error(`Error getting available slots: ${error.message}`);
      throw new Error('Failed to get available slots');
    }
  }

  async findNextAvailable(
    providerId: string,
    startDate: Date,
    duration: number = 30,
    daysToCheck: number = 14,
  ): Promise<TimeSlot | null> {
    try {
      for (let i = 0; i < daysToCheck; i++) {
        const checkDate = new Date(startDate);
        checkDate.setDate(checkDate.getDate() + i);
        
        // Skip weekends
        if (checkDate.getDay() === 0 || checkDate.getDay() === 6) {
          continue;
        }

        const slots = await this.getAvailableSlots(providerId, checkDate, duration);
        const available = slots.find((slot) => slot.available);
        
        if (available) {
          return available;
        }
      }

      return null;
    } catch (error) {
      this.logger.error(`Error finding next available: ${error.message}`);
      throw new Error('Failed to find next available slot');
    }
  }
}
