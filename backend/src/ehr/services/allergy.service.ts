import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Allergy, AllergySeverity } from '../../entities/allergy.entity';

@Injectable()
export class AllergyService {
  private readonly logger = new Logger(AllergyService.name);

  constructor(
    @InjectRepository(Allergy)
    private readonly allergyRepository: Repository<Allergy>,
  ) {}

  async create(userId: string, data: Partial<Allergy>): Promise<Allergy> {
    try {
      const allergy = this.allergyRepository.create({
        ...data,
        user: { id: userId },
      });
      
      const saved = await this.allergyRepository.save(allergy);
      this.logger.log(`Created allergy ${saved.id} for user ${userId}`);
      return saved;
    } catch (error) {
      this.logger.error(`Error creating allergy: ${error.message}`);
      throw new Error('Failed to create allergy');
    }
  }

  async findAll(userId: string): Promise<Allergy[]> {
    try {
      return await this.allergyRepository.find({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Error fetching allergies: ${error.message}`);
      throw new Error('Failed to fetch allergies');
    }
  }

  async findOne(id: string, userId: string): Promise<Allergy> {
    try {
      const allergy = await this.allergyRepository.findOne({
        where: { id, user: { id: userId } },
      });

      if (!allergy) {
        throw new NotFoundException('Allergy not found');
      }

      return allergy;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching allergy: ${error.message}`);
      throw new Error('Failed to fetch allergy');
    }
  }

  async update(id: string, userId: string, data: Partial<Allergy>): Promise<Allergy> {
    try {
      const allergy = await this.findOne(id, userId);
      Object.assign(allergy, data);
      const updated = await this.allergyRepository.save(allergy);
      this.logger.log(`Updated allergy ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Error updating allergy: ${error.message}`);
      throw new Error('Failed to update allergy');
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    try {
      const allergy = await this.findOne(id, userId);
      await this.allergyRepository.softRemove(allergy);
      this.logger.log(`Deleted allergy ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting allergy: ${error.message}`);
      throw new Error('Failed to delete allergy');
    }
  }

  async checkMedicationConflicts(userId: string, medicationName: string): Promise<Allergy[]> {
    try {
      const allergies = await this.findAll(userId);
      // Simplified conflict check - in production, use drug database
      return allergies.filter(allergy => 
        allergy.allergen.toLowerCase().includes(medicationName.toLowerCase()) ||
        medicationName.toLowerCase().includes(allergy.allergen.toLowerCase())
      );
    } catch (error) {
      this.logger.error(`Error checking medication conflicts: ${error.message}`);
      throw new Error('Failed to check medication conflicts');
    }
  }

  async getSevereAllergies(userId: string): Promise<Allergy[]> {
    try {
      return await this.allergyRepository.find({
        where: { 
          user: { id: userId },
          severity: AllergySeverity.SEVERE,
        },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Error fetching severe allergies: ${error.message}`);
      throw new Error('Failed to fetch severe allergies');
    }
  }
}
