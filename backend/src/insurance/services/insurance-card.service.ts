import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InsuranceCard } from '../../entities/insurance-card.entity';
import { CreateInsuranceCardDto } from '../dto/create-insurance-card.dto';
import { UpdateInsuranceCardDto } from '../dto/update-insurance-card.dto';
import { StorageService } from '../../services/storage.service';

@Injectable()
export class InsuranceCardService {
  constructor(
    @InjectRepository(InsuranceCard)
    private insuranceCardRepository: Repository<InsuranceCard>,
    private storageService: StorageService,
  ) {}

  async findAll(userId: string): Promise<InsuranceCard[]> {
    return this.insuranceCardRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<InsuranceCard> {
    const card = await this.insuranceCardRepository.findOne({
      where: { id, userId },
    });

    if (!card) {
      throw new NotFoundException('Insurance card not found');
    }

    return card;
  }

  async create(
    userId: string,
    createDto: CreateInsuranceCardDto,
  ): Promise<InsuranceCard> {
    const card = this.insuranceCardRepository.create({
      ...createDto,
      userId,
      createdAt: new Date(),
    });

    return this.insuranceCardRepository.save(card);
  }

  async update(
    id: string,
    userId: string,
    updateDto: UpdateInsuranceCardDto,
  ): Promise<InsuranceCard> {
    const card = await this.findOne(id, userId);

    Object.assign(card, updateDto);
    card.updatedAt = new Date();

    return this.insuranceCardRepository.save(card);
  }

  async remove(id: string, userId: string): Promise<void> {
    const card = await this.findOne(id, userId);
    await this.insuranceCardRepository.remove(card);
  }

  async uploadImages(
    id: string,
    userId: string,
    frontImage?: Buffer,
    backImage?: Buffer,
  ): Promise<InsuranceCard> {
    const card = await this.findOne(id, userId);

    if (frontImage) {
      const frontUrl = await this.storageService.uploadFile(
        frontImage,
        `insurance-card-front-${id}.jpg`,
        'image/jpeg',
        `insurance/${userId}`,
      );
      card.frontImageUrl = frontUrl;
    }

    if (backImage) {
      const backUrl = await this.storageService.uploadFile(
        backImage,
        `insurance-card-back-${id}.jpg`,
        'image/jpeg',
        `insurance/${userId}`,
      );
      card.backImageUrl = backUrl;
    }

    card.updatedAt = new Date();
    return this.insuranceCardRepository.save(card);
  }

  async verifyInsurance(id: string, userId: string): Promise<any> {
    const card = await this.findOne(id, userId);

    // TODO: Implement insurance verification API integration
    return {
      verified: true,
      status: 'active',
      benefits: {
        copay: card.copayAmount,
        deductible: card.deductibleAmount,
      },
    };
  }

  async getBenefits(id: string, userId: string): Promise<any> {
    const card = await this.findOne(id, userId);

    // TODO: Implement benefits lookup
    return {
      copay: card.copayAmount,
      deductible: card.deductibleAmount,
      outOfPocketMax: '$5,000',
      coverageLevel: '80%',
    };
  }

  async checkEligibility(id: string, userId: string): Promise<any> {
    const card = await this.findOne(id, userId);

    // TODO: Implement eligibility check API
    return {
      eligible: true,
      effectiveDate: card.effectiveDate,
      expirationDate: card.expirationDate,
      status: 'active',
    };
  }
}