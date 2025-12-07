import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  InsuranceClaim,
  ClaimStatus,
} from '../../entities/insurance-claim.entity';
import { InsuranceCard } from '../../entities/insurance-card.entity';
import { NotificationService } from '../../services/notification.service';
import { StorageService } from '../../services/storage.service';

@Injectable()
export class InsuranceClaimService {
  private readonly logger = new Logger(InsuranceClaimService.name);

  constructor(
    @InjectRepository(InsuranceClaim)
    private claimRepository: Repository<InsuranceClaim>,
    @InjectRepository(InsuranceCard)
    private insuranceCardRepository: Repository<InsuranceCard>,
    private notificationService: NotificationService,
    private storageService: StorageService,
  ) {}

  async create(
    userId: string,
    claimData: Partial<InsuranceClaim>,
  ): Promise<InsuranceClaim> {
    try {
      const claimNumber = this.generateClaimNumber();
      const claim = this.claimRepository.create({
        ...claimData,
        userId,
        claimNumber,
      });

      return await this.claimRepository.save(claim);
    } catch (error) {
      this.logger.error(`Error creating claim: ${error.message}`);
      throw error;
    }
  }

  async findByUser(userId: string): Promise<InsuranceClaim[]> {
    try {
      return await this.claimRepository
        .createQueryBuilder('claim')
        .leftJoinAndSelect('claim.insuranceCard', 'insuranceCard')
        .where('claim.userId = :userId', { userId })
        .andWhere('claim.deletedAt IS NULL')
        .orderBy('claim.createdAt', 'DESC')
        .getMany();
    } catch (error) {
      this.logger.error(`Error finding user claims: ${error.message}`);
      throw error;
    }
  }

  async findById(id: string, userId: string): Promise<InsuranceClaim> {
    try {
      const claim = await this.claimRepository
        .createQueryBuilder('claim')
        .leftJoinAndSelect('claim.insuranceCard', 'insuranceCard')
        .where('claim.id = :id', { id })
        .andWhere('claim.userId = :userId', { userId })
        .andWhere('claim.deletedAt IS NULL')
        .getOne();

      if (!claim) {
        throw new NotFoundException('Claim not found');
      }

      return claim;
    } catch (error) {
      this.logger.error(`Error finding claim: ${error.message}`);
      throw error;
    }
  }

  async submit(id: string, userId: string): Promise<InsuranceClaim> {
    try {
      const claim = await this.findById(id, userId);
      claim.status = ClaimStatus.SUBMITTED;
      claim.submittedAt = new Date();

      const updated = await this.claimRepository.save(claim);

      await this.notificationService.sendPushNotification(userId, {
        title: 'Claim Submitted',
        body: `Your claim #${claim.claimNumber} has been submitted`,
        icon: '/icons/claim.png',
        data: { type: 'claim_submitted', claimId: id },
      });

      return updated;
    } catch (error) {
      this.logger.error(`Error submitting claim: ${error.message}`);
      throw error;
    }
  }

  async updateStatus(
    id: string,
    status: ClaimStatus,
    notes?: string,
  ): Promise<InsuranceClaim> {
    try {
      const claim = await this.claimRepository.findOne({ where: { id } });
      if (!claim) throw new NotFoundException('Claim not found');

      claim.status = status;
      if (
        status === ClaimStatus.APPROVED ||
        status === ClaimStatus.PARTIALLY_APPROVED
      ) {
        claim.processedAt = new Date();
      }
      if (status === ClaimStatus.PAID) {
        claim.paidAt = new Date();
      }
      if (notes) {
        claim.notes = notes;
      }

      const updated = await this.claimRepository.save(claim);

      await this.notificationService.sendPushNotification(claim.userId, {
        title: 'Claim Status Update',
        body: `Your claim #${claim.claimNumber} is now ${status}`,
        icon: '/icons/claim.png',
        data: { type: 'claim_status_update', claimId: id, status },
      });

      return updated;
    } catch (error) {
      this.logger.error(`Error updating claim status: ${error.message}`);
      throw error;
    }
  }

  async uploadDocument(
    id: string,
    userId: string,
    file: Buffer,
    filename: string,
  ): Promise<InsuranceClaim> {
    try {
      const claim = await this.findById(id, userId);
      const url = await this.storageService.uploadFile(
        file,
        `claims/${userId}/${id}/${filename}`,
        'application/pdf',
      );

      claim.documents = [...(claim.documents || []), url];
      return await this.claimRepository.save(claim);
    } catch (error) {
      this.logger.error(`Error uploading claim document: ${error.message}`);
      throw error;
    }
  }

  async getClaimsSummary(userId: string): Promise<{
    total: number;
    pending: number;
    approved: number;
    denied: number;
    totalBilled: number;
    totalPaid: number;
    totalPatientResponsibility: number;
  }> {
    try {
      const claims = await this.findByUser(userId);

      return {
        total: claims.length,
        pending: claims.filter(
          (c) =>
            c.status === ClaimStatus.SUBMITTED ||
            c.status === ClaimStatus.IN_REVIEW,
        ).length,
        approved: claims.filter(
          (c) =>
            c.status === ClaimStatus.APPROVED || c.status === ClaimStatus.PAID,
        ).length,
        denied: claims.filter((c) => c.status === ClaimStatus.DENIED).length,
        totalBilled: claims.reduce((sum, c) => sum + Number(c.billedAmount), 0),
        totalPaid: claims.reduce(
          (sum, c) => sum + Number(c.insurancePaid || 0),
          0,
        ),
        totalPatientResponsibility: claims.reduce(
          (sum, c) => sum + Number(c.patientResponsibility || 0),
          0,
        ),
      };
    } catch (error) {
      this.logger.error(`Error getting claims summary: ${error.message}`);
      throw error;
    }
  }

  private generateClaimNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `CLM-${timestamp}-${random}`;
  }
}
