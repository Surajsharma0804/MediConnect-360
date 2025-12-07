import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import {
  Prescription,
  PrescriptionStatus,
} from '../../entities/prescription.entity';

@Injectable()
export class PrescriptionService {
  private readonly logger = new Logger(PrescriptionService.name);

  constructor(
    @InjectRepository(Prescription)
    private readonly prescriptionRepository: Repository<Prescription>,
  ) {}

  async create(
    userId: string,
    data: Partial<Prescription>,
  ): Promise<Prescription> {
    try {
      const prescription = this.prescriptionRepository.create({
        ...data,
        user: { id: userId },
      });

      const saved = await this.prescriptionRepository.save(prescription);
      this.logger.log(`Created prescription ${saved.id} for user ${userId}`);
      return saved;
    } catch (error) {
      this.logger.error(`Error creating prescription: ${error.message}`);
      throw new Error('Failed to create prescription');
    }
  }

  async findAll(userId: string, activeOnly = false): Promise<Prescription[]> {
    try {
      const query: any = { user: { id: userId } };
      if (activeOnly) {
        query.status = PrescriptionStatus.ACTIVE;
      }

      return await this.prescriptionRepository.find({
        where: query,
        order: { startDate: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Error fetching prescriptions: ${error.message}`);
      throw new Error('Failed to fetch prescriptions');
    }
  }

  async findOne(id: string, userId: string): Promise<Prescription> {
    try {
      const prescription = await this.prescriptionRepository.findOne({
        where: { id, user: { id: userId } },
      });

      if (!prescription) {
        throw new NotFoundException('Prescription not found');
      }

      return prescription;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching prescription: ${error.message}`);
      throw new Error('Failed to fetch prescription');
    }
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Prescription>,
  ): Promise<Prescription> {
    try {
      const prescription = await this.findOne(id, userId);
      Object.assign(prescription, data);
      const updated = await this.prescriptionRepository.save(prescription);
      this.logger.log(`Updated prescription ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Error updating prescription: ${error.message}`);
      throw new Error('Failed to update prescription');
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    try {
      const prescription = await this.findOne(id, userId);
      await this.prescriptionRepository.softRemove(prescription);
      this.logger.log(`Deleted prescription ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting prescription: ${error.message}`);
      throw new Error('Failed to delete prescription');
    }
  }

  async requestRefill(id: string, userId: string): Promise<Prescription> {
    try {
      const prescription = await this.findOne(id, userId);

      if (prescription.refillsRemaining <= 0) {
        throw new Error('No refills remaining. Please contact your provider.');
      }

      prescription.refillsRemaining -= 1;
      prescription.lastRefillDate = new Date();

      const updated = await this.prescriptionRepository.save(prescription);
      this.logger.log(`Refill requested for prescription ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Error requesting refill: ${error.message}`);
      throw error;
    }
  }

  async getDueForRefill(userId: string): Promise<Prescription[]> {
    try {
      const today = new Date();
      return await this.prescriptionRepository.find({
        where: {
          user: { id: userId },
          status: PrescriptionStatus.ACTIVE,
          nextRefillDate: LessThanOrEqual(today),
        },
        order: { nextRefillDate: 'ASC' },
      });
    } catch (error) {
      this.logger.error(`Error fetching refills due: ${error.message}`);
      throw new Error('Failed to fetch refills due');
    }
  }

  async getAdherenceRate(
    userId: string,
    prescriptionId?: string,
  ): Promise<number> {
    try {
      // Simplified adherence calculation
      // In production, this would track actual medication logs
      return 85; // Placeholder
    } catch (error) {
      this.logger.error(`Error calculating adherence: ${error.message}`);
      throw new Error('Failed to calculate adherence rate');
    }
  }
}
