import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Immunization } from '../../entities/immunization.entity';

@Injectable()
export class ImmunizationService {
  private readonly logger = new Logger(ImmunizationService.name);

  constructor(
    @InjectRepository(Immunization)
    private readonly immunizationRepository: Repository<Immunization>,
  ) {}

  async create(userId: string, data: Partial<Immunization>): Promise<Immunization> {
    try {
      const immunization = this.immunizationRepository.create({
        ...data,
        user: { id: userId },
      });
      
      const saved = await this.immunizationRepository.save(immunization);
      this.logger.log(`Created immunization ${saved.id} for user ${userId}`);
      return saved;
    } catch (error) {
      this.logger.error(`Error creating immunization: ${error.message}`);
      throw new Error('Failed to create immunization');
    }
  }

  async findAll(userId: string): Promise<Immunization[]> {
    try {
      return await this.immunizationRepository.find({
        where: { user: { id: userId } },
        order: { administeredDate: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Error fetching immunizations: ${error.message}`);
      throw new Error('Failed to fetch immunizations');
    }
  }

  async findOne(id: string, userId: string): Promise<Immunization> {
    try {
      const immunization = await this.immunizationRepository.findOne({
        where: { id, user: { id: userId } },
      });

      if (!immunization) {
        throw new NotFoundException('Immunization not found');
      }

      return immunization;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching immunization: ${error.message}`);
      throw new Error('Failed to fetch immunization');
    }
  }

  async update(id: string, userId: string, data: Partial<Immunization>): Promise<Immunization> {
    try {
      const immunization = await this.findOne(id, userId);
      Object.assign(immunization, data);
      const updated = await this.immunizationRepository.save(immunization);
      this.logger.log(`Updated immunization ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Error updating immunization: ${error.message}`);
      throw new Error('Failed to update immunization');
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    try {
      const immunization = await this.findOne(id, userId);
      await this.immunizationRepository.softRemove(immunization);
      this.logger.log(`Deleted immunization ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting immunization: ${error.message}`);
      throw new Error('Failed to delete immunization');
    }
  }

  async getDueVaccines(userId: string): Promise<Immunization[]> {
    try {
      const today = new Date();
      return await this.immunizationRepository.find({
        where: {
          user: { id: userId },
          nextDoseDate: LessThanOrEqual(today),
        },
        order: { nextDoseDate: 'ASC' },
      });
    } catch (error) {
      this.logger.error(`Error fetching due vaccines: ${error.message}`);
      throw new Error('Failed to fetch due vaccines');
    }
  }

  async getVaccineCard(userId: string): Promise<Immunization[]> {
    try {
      return await this.immunizationRepository.find({
        where: { user: { id: userId } },
        order: { administeredDate: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Error generating vaccine card: ${error.message}`);
      throw new Error('Failed to generate vaccine card');
    }
  }
}
