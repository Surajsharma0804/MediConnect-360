import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmergencyContact } from '../../entities/emergency-contact.entity';

@Injectable()
export class EmergencyContactService {
  private readonly logger = new Logger(EmergencyContactService.name);

  constructor(
    @InjectRepository(EmergencyContact)
    private readonly emergencyContactRepository: Repository<EmergencyContact>,
  ) {}

  async create(userId: string, data: any): Promise<EmergencyContact> {
    try {
      // Auto-assign priority if not provided
      if (!data.priority) {
        const count = await this.emergencyContactRepository.count({
          where: { userId },
        });
        data.priority = count + 1;
      }

      const contact = this.emergencyContactRepository.create({
        userId,
        firstName: data.firstName,
        lastName: data.lastName,
        relationship: data.relationship,
        primaryPhone: data.primaryPhone,
        secondaryPhone: data.secondaryPhone,
        email: data.email,
        address: data.address,
        priority: data.priority,
        canMakeMedicalDecisions: data.canMakeMedicalDecisions ?? true,
        notifyOnEmergency: data.notifyOnEmergency ?? true,
        hasHealthcarePowerOfAttorney:
          data.hasHealthcarePowerOfAttorney ?? false,
        notes: data.notes,
        metadata: data.metadata,
      });

      const saved = await this.emergencyContactRepository.save(contact);
      this.logger.log(
        `Created emergency contact ${saved.id} for user ${userId}`,
      );
      return saved;
    } catch (error) {
      this.logger.error(`Error creating emergency contact: ${error.message}`);
      throw new Error('Failed to create emergency contact');
    }
  }

  async findAll(userId: string): Promise<EmergencyContact[]> {
    try {
      return await this.emergencyContactRepository.find({
        where: { userId },
        order: { priority: 'ASC' },
      });
    } catch (error) {
      this.logger.error(`Error fetching emergency contacts: ${error.message}`);
      throw new Error('Failed to fetch emergency contacts');
    }
  }

  async findOne(id: string, userId: string): Promise<EmergencyContact> {
    try {
      const contact = await this.emergencyContactRepository.findOne({
        where: { id, userId },
      });

      if (!contact) {
        throw new NotFoundException('Emergency contact not found');
      }

      return contact;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching emergency contact: ${error.message}`);
      throw new Error('Failed to fetch emergency contact');
    }
  }

  async update(
    id: string,
    userId: string,
    data: any,
  ): Promise<EmergencyContact> {
    try {
      const contact = await this.findOne(id, userId);
      Object.assign(contact, data);
      const updated = await this.emergencyContactRepository.save(contact);
      this.logger.log(`Updated emergency contact ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Error updating emergency contact: ${error.message}`);
      throw error;
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      const contact = await this.findOne(id, userId);
      await this.emergencyContactRepository.remove(contact);
      this.logger.log(`Deleted emergency contact ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting emergency contact: ${error.message}`);
      throw error;
    }
  }

  async reorder(
    userId: string,
    orderedIds: string[],
  ): Promise<EmergencyContact[]> {
    try {
      const contacts = await this.findAll(userId);

      for (let i = 0; i < orderedIds.length; i++) {
        const contact = contacts.find((c) => c.id === orderedIds[i]);
        if (contact) {
          contact.priority = i + 1;
          await this.emergencyContactRepository.save(contact);
        }
      }

      this.logger.log(`Reordered emergency contacts for user ${userId}`);
      return await this.findAll(userId);
    } catch (error) {
      this.logger.error(`Error reordering contacts: ${error.message}`);
      throw new Error('Failed to reorder contacts');
    }
  }

  async getPrimary(userId: string): Promise<EmergencyContact | null> {
    try {
      return await this.emergencyContactRepository.findOne({
        where: { userId, priority: 1 },
      });
    } catch (error) {
      this.logger.error(`Error fetching primary contact: ${error.message}`);
      return null;
    }
  }
}
