import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabResult, LabResultStatus } from '../../entities/lab-result.entity';

@Injectable()
export class LabResultService {
  private readonly logger = new Logger(LabResultService.name);

  constructor(
    @InjectRepository(LabResult)
    private readonly labResultRepository: Repository<LabResult>,
  ) {}

  async create(userId: string, data: Partial<LabResult>): Promise<LabResult> {
    try {
      const labResult = this.labResultRepository.create({
        ...data,
        user: { id: userId },
      });

      const saved = await this.labResultRepository.save(labResult);
      this.logger.log(`Created lab result ${saved.id} for user ${userId}`);

      // Check if any results are abnormal
      const hasAbnormal = saved.results?.some((r) => r.isAbnormal);
      if (hasAbnormal) {
        this.logger.warn(`Abnormal lab result detected for user ${userId}`);
        // TODO: Trigger notification
      }

      return saved;
    } catch (error) {
      this.logger.error(`Error creating lab result: ${error.message}`);
      throw new Error('Failed to create lab result');
    }
  }

  async findAll(userId: string): Promise<LabResult[]> {
    try {
      return await this.labResultRepository.find({
        where: { user: { id: userId } },
        order: { testDate: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Error fetching lab results: ${error.message}`);
      throw new Error('Failed to fetch lab results');
    }
  }

  async findOne(id: string, userId: string): Promise<LabResult> {
    try {
      const result = await this.labResultRepository.findOne({
        where: { id, user: { id: userId } },
      });

      if (!result) {
        throw new NotFoundException('Lab result not found');
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching lab result: ${error.message}`);
      throw new Error('Failed to fetch lab result');
    }
  }

  async update(
    id: string,
    userId: string,
    data: Partial<LabResult>,
  ): Promise<LabResult> {
    try {
      const result = await this.findOne(id, userId);
      Object.assign(result, data);
      const updated = await this.labResultRepository.save(result);
      this.logger.log(`Updated lab result ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Error updating lab result: ${error.message}`);
      throw new Error('Failed to update lab result');
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    try {
      const result = await this.findOne(id, userId);
      await this.labResultRepository.softRemove(result);
      this.logger.log(`Deleted lab result ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting lab result: ${error.message}`);
      throw new Error('Failed to delete lab result');
    }
  }

  async getTrends(userId: string, testName: string): Promise<LabResult[]> {
    try {
      return await this.labResultRepository.find({
        where: {
          user: { id: userId },
          testName,
        },
        order: { testDate: 'ASC' },
        take: 20,
      });
    } catch (error) {
      this.logger.error(`Error fetching lab trends: ${error.message}`);
      throw new Error('Failed to fetch lab trends');
    }
  }

  async getAbnormalResults(userId: string): Promise<LabResult[]> {
    try {
      return await this.labResultRepository.find({
        where: [
          { user: { id: userId }, status: LabResultStatus.ABNORMAL },
          { user: { id: userId }, status: LabResultStatus.CRITICAL },
        ],
        order: { testDate: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Error fetching abnormal results: ${error.message}`);
      throw new Error('Failed to fetch abnormal results');
    }
  }
}
