import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalHistory } from '../../entities/medical-history.entity';

@Injectable()
export class MedicalHistoryService {
  private readonly logger = new Logger(MedicalHistoryService.name);

  constructor(
    @InjectRepository(MedicalHistory)
    private readonly medicalHistoryRepository: Repository<MedicalHistory>,
  ) {}

  async create(
    userId: string,
    data: Partial<MedicalHistory>,
  ): Promise<MedicalHistory> {
    try {
      const medicalHistory = this.medicalHistoryRepository.create({
        ...data,
        user: { id: userId },
      });

      const saved = await this.medicalHistoryRepository.save(medicalHistory);
      this.logger.log(
        `Created medical history record ${saved.id} for user ${userId}`,
      );
      return saved;
    } catch (error) {
      this.logger.error(`Error creating medical history: ${error.message}`);
      throw new Error('Failed to create medical history record');
    }
  }

  async findAll(userId: string): Promise<MedicalHistory[]> {
    try {
      return await this.medicalHistoryRepository.find({
        where: { user: { id: userId } },
        order: { diagnosisDate: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Error fetching medical history: ${error.message}`);
      throw new Error('Failed to fetch medical history');
    }
  }

  async findOne(id: string, userId: string): Promise<MedicalHistory> {
    try {
      const record = await this.medicalHistoryRepository.findOne({
        where: { id, user: { id: userId } },
      });

      if (!record) {
        throw new NotFoundException('Medical history record not found');
      }

      return record;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error fetching medical history record: ${error.message}`,
      );
      throw new Error('Failed to fetch medical history record');
    }
  }

  async update(
    id: string,
    userId: string,
    data: Partial<MedicalHistory>,
  ): Promise<MedicalHistory> {
    try {
      const record = await this.findOne(id, userId);

      Object.assign(record, data);
      const updated = await this.medicalHistoryRepository.save(record);

      this.logger.log(`Updated medical history record ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Error updating medical history: ${error.message}`);
      throw new Error('Failed to update medical history record');
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    try {
      const record = await this.findOne(id, userId);
      await this.medicalHistoryRepository.softRemove(record);
      this.logger.log(`Deleted medical history record ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting medical history: ${error.message}`);
      throw new Error('Failed to delete medical history record');
    }
  }

  async findByCondition(
    userId: string,
    conditionName: string,
  ): Promise<MedicalHistory[]> {
    try {
      return await this.medicalHistoryRepository
        .createQueryBuilder('history')
        .where('history.userId = :userId', { userId })
        .andWhere('LOWER(history.conditionName) LIKE LOWER(:conditionName)', {
          conditionName: `%${conditionName}%`,
        })
        .orderBy('history.diagnosisDate', 'DESC')
        .getMany();
    } catch (error) {
      this.logger.error(`Error searching medical history: ${error.message}`);
      throw new Error('Failed to search medical history');
    }
  }

  async findFamilyHistory(userId: string): Promise<MedicalHistory[]> {
    try {
      return await this.medicalHistoryRepository.find({
        where: {
          user: { id: userId },
          isFamilyHistory: true,
        },
        order: { diagnosisDate: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Error fetching family history: ${error.message}`);
      throw new Error('Failed to fetch family history');
    }
  }
}
