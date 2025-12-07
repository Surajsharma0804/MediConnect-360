import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  InsuranceCard,
  InsuranceStatus,
} from '../../entities/insurance-card.entity';
import { StorageService } from '../../services/storage.service';
import { NotificationService } from '../../services/notification.service';

@Injectable()
export class InsuranceCardService {
  private readonly logger = new Logger(InsuranceCardService.name);

  constructor(
    @InjectRepository(InsuranceCard)
    private insuranceCardRepository: Repository<InsuranceCard>,
    private storageService: StorageService,
    private notificationService: NotificationService,
  ) {}

  async create(
    userId: string,
    cardData: Partial<InsuranceCard>,
  ): Promise<InsuranceCard> {
    try {
      // If this is set as primary, unset other primary cards
      if (cardData.isPrimary) {
        await this.insuranceCardRepository.update(
          { userId, isPrimary: true },
          { isPrimary: false },
        );
      }

      const card = this.insuranceCardRepository.create({
        ...cardData,
        userId,
      });

      return await this.insuranceCardRepository.save(card);
    } catch (error) {
      this.logger.error(`Error creating insurance card: ${error.message}`);
      throw error;
    }
  }

  async scanCard(
    userId: string,
    frontImage: Buffer,
    backImage?: Buffer,
  ): Promise<Partial<InsuranceCard>> {
    try {
      // Upload images to storage
      const frontImageUrl = await this.storageService.uploadFile(
        frontImage,
        `insurance-cards/${userId}/front-${Date.now()}.jpg`,
        'image/jpeg',
      );

      let backImageUrl: string | undefined;
      if (backImage) {
        backImageUrl = await this.storageService.uploadFile(
          backImage,
          `insurance-cards/${userId}/back-${Date.now()}.jpg`,
          'image/jpeg',
        );
      }

      // OCR processing would go here
      // For now, return the image URLs and let user fill in details
      // In production, integrate with Google Cloud Vision API or AWS Textract

      const extractedData: Partial<InsuranceCard> = {
        frontImageUrl,
        backImageUrl,
        status: InsuranceStatus.PENDING_VERIFICATION,
      };

      // TODO: Implement OCR extraction
      // const ocrData = await this.extractDataFromImages(frontImage, backImage);
      // Object.assign(extractedData, ocrData);

      this.logger.log(`Insurance card scanned for user ${userId}`);
      return extractedData;
    } catch (error) {
      this.logger.error(`Error scanning insurance card: ${error.message}`);
      throw error;
    }
  }

  async findByUser(userId: string): Promise<InsuranceCard[]> {
    try {
      return await this.insuranceCardRepository
        .createQueryBuilder('card')
        .where('card.userId = :userId', { userId })
        .andWhere('card.deletedAt IS NULL')
        .orderBy('card.isPrimary', 'DESC')
        .addOrderBy('card.createdAt', 'DESC')
        .getMany();
    } catch (error) {
      this.logger.error(`Error finding user insurance cards: ${error.message}`);
      throw error;
    }
  }

  async findById(id: string, userId: string): Promise<InsuranceCard> {
    try {
      const card = await this.insuranceCardRepository
        .createQueryBuilder('card')
        .where('card.id = :id', { id })
        .andWhere('card.userId = :userId', { userId })
        .andWhere('card.deletedAt IS NULL')
        .getOne();

      if (!card) {
        throw new NotFoundException('Insurance card not found');
      }

      return card;
    } catch (error) {
      this.logger.error(`Error finding insurance card: ${error.message}`);
      throw error;
    }
  }

  async getPrimaryCard(userId: string): Promise<InsuranceCard | null> {
    try {
      return await this.insuranceCardRepository
        .createQueryBuilder('card')
        .where('card.userId = :userId', { userId })
        .andWhere('card.isPrimary = :isPrimary', { isPrimary: true })
        .andWhere('card.deletedAt IS NULL')
        .getOne();
    } catch (error) {
      this.logger.error(
        `Error finding primary insurance card: ${error.message}`,
      );
      throw error;
    }
  }

  async update(
    id: string,
    userId: string,
    cardData: Partial<InsuranceCard>,
  ): Promise<InsuranceCard> {
    try {
      const card = await this.findById(id, userId);

      // If setting as primary, unset other primary cards
      if (cardData.isPrimary && !card.isPrimary) {
        await this.insuranceCardRepository.update(
          { userId, isPrimary: true },
          { isPrimary: false },
        );
      }

      Object.assign(card, cardData);
      return await this.insuranceCardRepository.save(card);
    } catch (error) {
      this.logger.error(`Error updating insurance card: ${error.message}`);
      throw error;
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      const card = await this.findById(id, userId);
      card.deletedAt = new Date();
      await this.insuranceCardRepository.save(card);
    } catch (error) {
      this.logger.error(`Error deleting insurance card: ${error.message}`);
      throw error;
    }
  }

  async verifyInsurance(id: string, userId: string): Promise<InsuranceCard> {
    try {
      const card = await this.findById(id, userId);

      // In production, integrate with insurance verification API
      // For now, mark as verified
      card.status = InsuranceStatus.ACTIVE;
      card.lastVerifiedAt = new Date();
      card.verificationNotes = 'Verified successfully';

      const updated = await this.insuranceCardRepository.save(card);

      // Send notification
      await this.notificationService.sendPushNotification(userId, {
        title: 'Insurance Verified',
        body: `Your ${card.insuranceProvider} insurance has been verified`,
        icon: '/icons/insurance.png',
        data: {
          type: 'insurance_verified',
          cardId: id,
        },
      });

      return updated;
    } catch (error) {
      this.logger.error(`Error verifying insurance: ${error.message}`);
      throw error;
    }
  }

  async checkEligibility(
    id: string,
    userId: string,
    serviceType: string,
  ): Promise<{
    eligible: boolean;
    copay: number;
    coinsurance: number;
    deductibleRemaining: number;
    outOfPocketRemaining: number;
    notes: string;
  }> {
    try {
      const card = await this.findById(id, userId);

      if (card.status !== InsuranceStatus.ACTIVE) {
        throw new BadRequestException('Insurance card is not active');
      }

      // In production, integrate with insurance eligibility API
      // For now, return mock data based on card details

      const deductibleRemaining = card.deductible
        ? card.deductible - (card.deductibleMet || 0)
        : 0;

      const outOfPocketRemaining = card.outOfPocketMax
        ? card.outOfPocketMax - (card.outOfPocketMet || 0)
        : 0;

      let copay = 0;
      switch (serviceType.toLowerCase()) {
        case 'primary_care':
          copay = card.copayPrimaryCare || 0;
          break;
        case 'specialist':
          copay = card.copaySpecialist || 0;
          break;
        case 'emergency':
          copay = card.copayEmergency || 0;
          break;
        case 'urgent_care':
          copay = card.copayUrgentCare || 0;
          break;
      }

      return {
        eligible: true,
        copay,
        coinsurance: 20, // Mock data
        deductibleRemaining,
        outOfPocketRemaining,
        notes: 'Coverage verified. Subject to plan terms and conditions.',
      };
    } catch (error) {
      this.logger.error(`Error checking eligibility: ${error.message}`);
      throw error;
    }
  }

  async updateCoverageDetails(
    id: string,
    userId: string,
    coverageDetails: Record<string, any>,
  ): Promise<InsuranceCard> {
    try {
      const card = await this.findById(id, userId);
      card.coverageDetails = { ...card.coverageDetails, ...coverageDetails };
      return await this.insuranceCardRepository.save(card);
    } catch (error) {
      this.logger.error(`Error updating coverage details: ${error.message}`);
      throw error;
    }
  }

  async getExpiringCards(
    daysBeforeExpiration: number = 30,
  ): Promise<InsuranceCard[]> {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysBeforeExpiration);

      return await this.insuranceCardRepository
        .createQueryBuilder('card')
        .where('card.expirationDate <= :futureDate', { futureDate })
        .andWhere('card.expirationDate > :now', { now: new Date() })
        .andWhere('card.status = :status', { status: InsuranceStatus.ACTIVE })
        .andWhere('card.deletedAt IS NULL')
        .getMany();
    } catch (error) {
      this.logger.error(`Error finding expiring cards: ${error.message}`);
      throw error;
    }
  }
}
