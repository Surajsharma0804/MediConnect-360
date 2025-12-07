import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalID } from '../../entities/medical-id.entity';

@Injectable()
export class MedicalIDService {
  private readonly logger = new Logger(MedicalIDService.name);

  constructor(
    @InjectRepository(MedicalID)
    private readonly medicalIDRepository: Repository<MedicalID>,
  ) {}

  async create(userId: string, data: any): Promise<MedicalID> {
    try {
      // Check if user already has a medical ID
      const existing = await this.medicalIDRepository.findOne({
        where: { userId },
      });
      if (existing) {
        return this.update(userId, data);
      }

      const medicalID = this.medicalIDRepository.create({
        userId,
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth,
        bloodType: data.bloodType,
        height: data.height,
        heightUnit: data.heightUnit,
        weight: data.weight,
        weightUnit: data.weightUnit,
        medicalConditions: data.medicalConditions || [],
        allergies: data.allergies || [],
        currentMedications: data.currentMedications || [],
        emergencyContacts: data.emergencyContacts || [],
        primaryPhysician: data.primaryPhysician,
        physicianPhone: data.physicianPhone,
        preferredHospital: data.preferredHospital,
        insuranceProvider: data.insuranceProvider,
        insurancePolicyNumber: data.insurancePolicyNumber,
        insuranceGroupNumber: data.insuranceGroupNumber,
        isOrganDonor: data.isOrganDonor ?? false,
        specialInstructions: data.specialInstructions,
        advanceDirectives: data.advanceDirectives,
        hasPacemaker: data.hasPacemaker ?? false,
        hasImplants: data.hasImplants ?? false,
        implantDetails: data.implantDetails,
        isVisibleToEmergencyServices: data.isVisibleToEmergencyServices ?? true,
        requiresInterpreter: data.requiresInterpreter ?? false,
        preferredLanguage: data.preferredLanguage,
        metadata: data.metadata,
      });

      const saved = await this.medicalIDRepository.save(medicalID);
      this.logger.log(`Created medical ID for user ${userId}`);
      return saved;
    } catch (error) {
      this.logger.error(`Error creating medical ID: ${error.message}`);
      throw new Error('Failed to create medical ID');
    }
  }

  async findByUserId(userId: string): Promise<MedicalID> {
    try {
      const medicalID = await this.medicalIDRepository.findOne({
        where: { userId },
      });

      if (!medicalID) {
        throw new NotFoundException('Medical ID not found');
      }

      return medicalID;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching medical ID: ${error.message}`);
      throw new Error('Failed to fetch medical ID');
    }
  }

  async findPublicMedicalID(userId: string): Promise<MedicalID> {
    try {
      const medicalID = await this.medicalIDRepository.findOne({
        where: { userId, isVisibleToEmergencyServices: true },
      });

      if (!medicalID) {
        throw new NotFoundException('Medical ID not found or not visible');
      }

      return medicalID;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching public medical ID: ${error.message}`);
      throw new Error('Failed to fetch medical ID');
    }
  }

  async update(userId: string, data: any): Promise<MedicalID> {
    try {
      const medicalID = await this.findByUserId(userId);
      Object.assign(medicalID, data);
      const updated = await this.medicalIDRepository.save(medicalID);
      this.logger.log(`Updated medical ID for user ${userId}`);
      return updated;
    } catch (error) {
      this.logger.error(`Error updating medical ID: ${error.message}`);
      throw error;
    }
  }

  async toggleVisibility(userId: string): Promise<MedicalID> {
    try {
      const medicalID = await this.findByUserId(userId);
      medicalID.isVisibleToEmergencyServices =
        !medicalID.isVisibleToEmergencyServices;
      const updated = await this.medicalIDRepository.save(medicalID);
      this.logger.log(
        `Toggled visibility to ${medicalID.isVisibleToEmergencyServices} for user ${userId}`,
      );
      return updated;
    } catch (error) {
      this.logger.error(`Error toggling visibility: ${error.message}`);
      throw error;
    }
  }
}
