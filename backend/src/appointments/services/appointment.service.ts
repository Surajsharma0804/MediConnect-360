import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  Appointment,
  AppointmentStatus,
} from '../../entities/appointment.entity';

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name);

  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async create(userId: string, data: any): Promise<Appointment> {
    try {
      // Check for conflicts
      const conflict = await this.checkConflict(
        data.doctorId,
        data.scheduledAt,
        data.durationMinutes || 30,
      );

      if (conflict) {
        throw new BadRequestException('Time slot is not available');
      }

      const appointment = this.appointmentRepository.create({
        patientId: userId,
        doctorId: data.doctorId,
        scheduledAt: data.scheduledAt,
        durationMinutes: data.durationMinutes || 30,
        type: data.type,
        reason: data.reason,
        notes: data.notes,
        status: AppointmentStatus.PENDING,
      });

      const saved = await this.appointmentRepository.save(appointment);
      this.logger.log(`Created appointment ${saved.id} for user ${userId}`);
      return saved;
    } catch (error) {
      this.logger.error(`Error creating appointment: ${error.message}`);
      throw error;
    }
  }

  async findAll(userId: string, upcoming = false): Promise<Appointment[]> {
    try {
      if (upcoming) {
        const now = new Date();
        return await this.appointmentRepository
          .createQueryBuilder('appointment')
          .where('appointment.patientId = :userId', { userId })
          .andWhere('appointment.scheduledAt > :now', { now })
          .orderBy('appointment.scheduledAt', 'ASC')
          .getMany();
      }

      return await this.appointmentRepository.find({
        where: { patientId: userId },
        order: { scheduledAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Error fetching appointments: ${error.message}`);
      throw new Error('Failed to fetch appointments');
    }
  }

  async findOne(id: string, userId: string): Promise<Appointment> {
    try {
      const appointment = await this.appointmentRepository.findOne({
        where: { id, patientId: userId },
      });

      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }

      return appointment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching appointment: ${error.message}`);
      throw new Error('Failed to fetch appointment');
    }
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Appointment>,
  ): Promise<Appointment> {
    try {
      const appointment = await this.findOne(id, userId);
      Object.assign(appointment, data);
      const updated = await this.appointmentRepository.save(appointment);
      this.logger.log(`Updated appointment ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Error updating appointment: ${error.message}`);
      throw error;
    }
  }

  async cancel(
    id: string,
    userId: string,
    reason?: string,
  ): Promise<Appointment> {
    try {
      const appointment = await this.findOne(id, userId);
      appointment.status = AppointmentStatus.CANCELLED;
      appointment.cancelledAt = new Date();
      appointment.cancellationReason = reason || 'Cancelled by patient';
      const updated = await this.appointmentRepository.save(appointment);
      this.logger.log(`Cancelled appointment ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Error cancelling appointment: ${error.message}`);
      throw error;
    }
  }

  async complete(
    id: string,
    doctorId: string,
    notes?: string,
  ): Promise<Appointment> {
    try {
      const appointment = await this.appointmentRepository.findOne({
        where: { id, doctorId },
      });

      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }

      appointment.status = AppointmentStatus.COMPLETED;
      if (notes) appointment.notes = notes;
      const updated = await this.appointmentRepository.save(appointment);
      this.logger.log(`Completed appointment ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Error completing appointment: ${error.message}`);
      throw error;
    }
  }

  async checkConflict(
    doctorId: string,
    scheduledAt: Date,
    duration: number,
  ): Promise<boolean> {
    try {
      const endTime = new Date(scheduledAt.getTime() + duration * 60000);

      const conflicts = await this.appointmentRepository
        .createQueryBuilder('appointment')
        .where('appointment.doctorId = :doctorId', { doctorId })
        .andWhere('appointment.status != :cancelled', {
          cancelled: AppointmentStatus.CANCELLED,
        })
        .andWhere(
          '(appointment.scheduledAt BETWEEN :start AND :end OR ' +
            "(appointment.scheduledAt + (appointment.durationMinutes * interval '1 minute')) BETWEEN :start AND :end)",
          { start: scheduledAt, end: endTime },
        )
        .getCount();

      return conflicts > 0;
    } catch (error) {
      this.logger.error(`Error checking conflict: ${error.message}`);
      return false;
    }
  }

  async getProviderSchedule(
    doctorId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Appointment[]> {
    try {
      return await this.appointmentRepository.find({
        where: {
          doctorId,
          scheduledAt: Between(startDate, endDate),
        },
        order: { scheduledAt: 'ASC' },
      });
    } catch (error) {
      this.logger.error(`Error fetching provider schedule: ${error.message}`);
      throw new Error('Failed to fetch provider schedule');
    }
  }
}
