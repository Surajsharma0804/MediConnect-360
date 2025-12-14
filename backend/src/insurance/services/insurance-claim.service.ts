import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InsuranceClaim, ClaimStatus } from '../../entities/insurance-claim.entity';
import { CreateClaimDto } from '../dto/create-claim.dto';
import { UpdateClaimDto } from '../dto/update-claim.dto';
import { StorageService } from '../../services/storage.service';
import { NotificationService } from '../../services/notification.service';
import '../../types/multer';

@Injectable()
export class InsuranceClaimService {
  constructor(
    @InjectRepository(InsuranceClaim)
    private claimRepository: Repository<InsuranceClaim>,
    private storageService: StorageService,
    private notificationService: NotificationService,
  ) {}

  async findAll(userId: string): Promise<InsuranceClaim[]> {
    return this.claimRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<InsuranceClaim> {
    const claim = await this.claimRepository.findOne({
      where: { id, userId },
    });

    if (!claim) {
      throw new NotFoundException('Insurance claim not found');
    }

    return claim;
  }

  async create(userId: string, createDto: CreateClaimDto): Promise<InsuranceClaim> {
    const claim = this.claimRepository.create({
      ...createDto,
      userId,
      status: ClaimStatus.DRAFT,
      createdAt: new Date(),
    });

    return this.claimRepository.save(claim);
  }

  async update(
    id: string,
    userId: string,
    updateDto: UpdateClaimDto,
  ): Promise<InsuranceClaim> {
    const claim = await this.findOne(id, userId);

    Object.assign(claim, updateDto);
    claim.updatedAt = new Date();

    return this.claimRepository.save(claim);
  }

  async submit(id: string, userId: string): Promise<InsuranceClaim> {
    const claim = await this.findOne(id, userId);

    claim.status = ClaimStatus.SUBMITTED;
    claim.submittedAt = new Date();
    claim.updatedAt = new Date();

    const updatedClaim = await this.claimRepository.save(claim);

    // Send notification
    await this.notificationService.sendNotification(userId, {
      type: 'claim_submitted',
      title: 'Claim Submitted',
      message: `Your insurance claim has been submitted for review.`,
      data: { claimId: id },
    });

    return updatedClaim;
  }

  async getStatus(id: string, userId: string): Promise<any> {
    const claim = await this.findOne(id, userId);

    return {
      status: claim.status,
      submittedAt: claim.submittedAt,
      processedAt: claim.processedAt,
      approvedAmount: claim.approvedAmount,
      denialReason: claim.denialReason,
    };
  }

  async uploadDocument(
    id: string,
    userId: string,
    file: Express.Multer.File,
    documentType: string,
  ): Promise<any> {
    const claim = await this.findOne(id, userId);

    const documentUrl = await this.storageService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      `claims/${userId}/${id}`,
    );

    // Add document to claim
    const documents = claim.documents || [];
    documents.push({
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.originalname,
      url: documentUrl,
      type: documentType,
      uploadedAt: new Date().toISOString(),
    });

    claim.documents = documents;
    claim.updatedAt = new Date();

    await this.claimRepository.save(claim);

    return { documentUrl, documentType };
  }

  async getDocuments(id: string, userId: string): Promise<any[]> {
    const claim = await this.findOne(id, userId);
    return claim.documents || [];
  }

  async appeal(id: string, userId: string, reason: string): Promise<InsuranceClaim> {
    const claim = await this.findOne(id, userId);

    claim.status = ClaimStatus.APPEALED;
    claim.appealReason = reason;
    claim.appealedAt = new Date();
    claim.updatedAt = new Date();

    const updatedClaim = await this.claimRepository.save(claim);

    // Send notification
    await this.notificationService.sendNotification(userId, {
      type: 'claim_appealed',
      title: 'Claim Appeal Submitted',
      message: `Your claim appeal has been submitted for review.`,
      data: { claimId: id },
    });

    return updatedClaim;
  }

  async getHistory(id: string, userId: string): Promise<any[]> {
    const claim = await this.findOne(id, userId);

    // TODO: Implement claim history tracking
    return [
      {
        status: 'DRAFT',
        date: claim.createdAt,
        description: 'Claim created',
      },
      {
        status: 'SUBMITTED',
        date: claim.submittedAt,
        description: 'Claim submitted for processing',
      },
    ];
  }
}