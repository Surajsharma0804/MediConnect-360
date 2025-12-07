import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { VitalSigns } from '../../entities/vital-signs.entity';

@Injectable()
export class VitalSignsService {
  private readonly logger = new Logger(VitalSignsService.name);

  constructor(
    @InjectRepository(VitalSigns)
    private readonly vitalSignsRepository: Repository<VitalSigns>,
  ) {}

  async create(userId: string, data: Partial<VitalSigns>): Promise<VitalSigns> {
    try {
      const vitalSigns = this.vitalSignsRepository.create({
        ...data,
        user: { id: userId },
      });
      
      const saved = await this.vitalSignsRepository.save(vitalSigns);
      this.logger.log(`Created vital signs ${saved.id} for user ${userId}`);
      return saved;
    } catch (error) {
      this.logger.error(`Error creating vital signs: ${error.message}`);
      throw new Error('Failed to create vital signs');
    }
  }

  async findAll(userId: string, limit = 50): Promise<VitalSigns[]> {
    try {
      return await this.vitalSignsRepository.find({
        where: { user: { id: userId } },
        order: { recordedAt: 'DESC' },
        take: limit,
      });
    } catch (error) {
      this.logger.error(`Error fetching vital signs: ${error.message}`);
      throw new Error('Failed to fetch vital signs');
    }
  }

  async findOne(id: string, userId: string): Promise<VitalSigns> {
    try {
      const vitalSigns = await this.vitalSignsRepository.findOne({
        where: { id, user: { id: userId } },
      });

      if (!vitalSigns) {
        throw new NotFoundException('Vital signs record not found');
      }

      return vitalSigns;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching vital signs: ${error.message}`);
      throw new Error('Failed to fetch vital signs');
    }
  }

  async update(id: string, userId: string, data: Partial<VitalSigns>): Promise<VitalSigns> {
    try {
      const vitalSigns = await this.findOne(id, userId);
      Object.assign(vitalSigns, data);
      const updated = await this.vitalSignsRepository.save(vitalSigns);
      this.logger.log(`Updated vital signs ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Error updating vital signs: ${error.message}`);
      throw new Error('Failed to update vital signs');
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    try {
      const vitalSigns = await this.findOne(id, userId);
      await this.vitalSignsRepository.softRemove(vitalSigns);
      this.logger.log(`Deleted vital signs ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting vital signs: ${error.message}`);
      throw new Error('Failed to delete vital signs');
    }
  }

  async getTrends(userId: string, startDate: Date, endDate: Date): Promise<VitalSigns[]> {
    try {
      return await this.vitalSignsRepository.find({
        where: {
          user: { id: userId },
          recordedAt: Between(startDate, endDate),
        },
        order: { recordedAt: 'ASC' },
      });
    } catch (error) {
      this.logger.error(`Error fetching vital trends: ${error.message}`);
      throw new Error('Failed to fetch vital trends');
    }
  }

  async getLatest(userId: string): Promise<VitalSigns | null> {
    try {
      return await this.vitalSignsRepository.findOne({
        where: { user: { id: userId } },
        order: { recordedAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Error fetching latest vitals: ${error.message}`);
      throw new Error('Failed to fetch latest vitals');
    }
  }

  async bulkImport(userId: string, vitals: Partial<VitalSigns>[]): Promise<VitalSigns[]> {
    try {
      const records = vitals.map(data => 
        this.vitalSignsRepository.create({
          ...data,
          user: { id: userId },
        })
      );
      
      const saved = await this.vitalSignsRepository.save(records);
      this.logger.log(`Bulk imported ${saved.length} vital signs for user ${userId}`);
      return saved;
    } catch (error) {
      this.logger.error(`Error bulk importing vitals: ${error.message}`);
      throw new Error('Failed to bulk import vital signs');
    }
  }
}
