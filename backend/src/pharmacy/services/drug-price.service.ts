import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DrugPrice } from '../../entities/drug-price.entity';
import { Pharmacy } from '../../entities/pharmacy.entity';

export interface PriceComparison {
  drugName: string;
  dosage: string;
  quantity: number;
  prices: Array<{
    pharmacy: Pharmacy | null;
    price: number;
    cashPrice: number;
    insurancePrice: number;
    couponPrice: number;
    couponCode: string;
    couponProvider: string;
    inStock: boolean;
  }>;
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
  savings: number;
}

@Injectable()
export class DrugPriceService {
  private readonly logger = new Logger(DrugPriceService.name);

  constructor(
    @InjectRepository(DrugPrice)
    private drugPriceRepository: Repository<DrugPrice>,
    @InjectRepository(Pharmacy)
    private pharmacyRepository: Repository<Pharmacy>,
  ) {}

  async comparePrices(
    drugName: string,
    dosage: string,
    quantity: number,
    zipCode?: string,
  ): Promise<PriceComparison> {
    try {
      const query = this.drugPriceRepository
        .createQueryBuilder('price')
        .leftJoinAndSelect('price.pharmacyId', 'pharmacy')
        .where('LOWER(price.drugName) = LOWER(:drugName)', { drugName })
        .andWhere('price.dosage = :dosage', { dosage })
        .andWhere('price.quantity = :quantity', { quantity })
        .andWhere('pharmacy.isActive = :isActive', { isActive: true });

      if (zipCode) {
        query.andWhere('pharmacy.zipCode = :zipCode', { zipCode });
      }

      const prices = await query.getMany();

      if (prices.length === 0) {
        throw new NotFoundException('No prices found for this medication');
      }

      // Get pharmacy details
      const pharmacyIds = prices.map((p) => p.pharmacyId);
      const pharmacies = await this.pharmacyRepository.findByIds(pharmacyIds);
      const pharmacyMap = new Map(pharmacies.map((p) => [p.id, p]));

      const priceData = prices.map((p) => ({
        pharmacy: pharmacyMap.get(p.pharmacyId) || null,
        price: p.price,
        cashPrice: p.cashPrice,
        insurancePrice: p.insurancePrice,
        couponPrice: p.couponPrice,
        couponCode: p.couponCode,
        couponProvider: p.couponProvider,
        inStock: p.inStock,
      }));

      const priceValues = priceData.map((p) => p.price);
      const lowestPrice = Math.min(...priceValues);
      const highestPrice = Math.max(...priceValues);
      const averagePrice =
        priceValues.reduce((a, b) => a + b, 0) / priceValues.length;
      const savings = highestPrice - lowestPrice;

      return {
        drugName,
        dosage,
        quantity,
        prices: priceData.sort((a, b) => a.price - b.price),
        lowestPrice,
        highestPrice,
        averagePrice: Math.round(averagePrice * 100) / 100,
        savings: Math.round(savings * 100) / 100,
      };
    } catch (error) {
      this.logger.error(`Error comparing drug prices: ${error.message}`);
      throw error;
    }
  }

  async findGenericAlternatives(
    brandName: string,
    dosage: string,
  ): Promise<DrugPrice[]> {
    try {
      return await this.drugPriceRepository
        .createQueryBuilder('price')
        .where('LOWER(price.drugName) = LOWER(:brandName)', { brandName })
        .andWhere('price.dosage = :dosage', { dosage })
        .andWhere('price.isGeneric = :isGeneric', { isGeneric: true })
        .orderBy('price.price', 'ASC')
        .getMany();
    } catch (error) {
      this.logger.error(`Error finding generic alternatives: ${error.message}`);
      throw error;
    }
  }

  async getCoupons(
    drugName: string,
    dosage: string,
    quantity: number,
  ): Promise<DrugPrice[]> {
    try {
      return await this.drugPriceRepository
        .createQueryBuilder('price')
        .where('LOWER(price.drugName) = LOWER(:drugName)', { drugName })
        .andWhere('price.dosage = :dosage', { dosage })
        .andWhere('price.quantity = :quantity', { quantity })
        .andWhere('price.couponCode IS NOT NULL')
        .orderBy('price.couponPrice', 'ASC')
        .getMany();
    } catch (error) {
      this.logger.error(`Error finding drug coupons: ${error.message}`);
      throw error;
    }
  }

  async getPricesByPharmacy(pharmacyId: string): Promise<DrugPrice[]> {
    try {
      return await this.drugPriceRepository.find({
        where: { pharmacyId },
        order: { drugName: 'ASC' },
      });
    } catch (error) {
      this.logger.error(`Error finding pharmacy prices: ${error.message}`);
      throw error;
    }
  }

  async create(priceData: Partial<DrugPrice>): Promise<DrugPrice> {
    try {
      const price = this.drugPriceRepository.create(priceData);
      return await this.drugPriceRepository.save(price);
    } catch (error) {
      this.logger.error(`Error creating drug price: ${error.message}`);
      throw error;
    }
  }

  async update(id: string, priceData: Partial<DrugPrice>): Promise<DrugPrice> {
    try {
      const price = await this.drugPriceRepository.findOne({ where: { id } });
      if (!price) {
        throw new NotFoundException('Drug price not found');
      }

      Object.assign(price, priceData);
      price.lastUpdated = new Date();
      return await this.drugPriceRepository.save(price);
    } catch (error) {
      this.logger.error(`Error updating drug price: ${error.message}`);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.drugPriceRepository.delete(id);
    } catch (error) {
      this.logger.error(`Error deleting drug price: ${error.message}`);
      throw error;
    }
  }

  async calculateSavings(
    drugName: string,
    dosage: string,
    quantity: number,
  ): Promise<{
    brandPrice: number;
    genericPrice: number;
    savings: number;
    savingsPercent: number;
  }> {
    try {
      const brandPrices = await this.drugPriceRepository.find({
        where: { drugName, dosage, quantity, isGeneric: false },
        order: { price: 'ASC' },
        take: 1,
      });

      const genericPrices = await this.drugPriceRepository.find({
        where: { drugName, dosage, quantity, isGeneric: true },
        order: { price: 'ASC' },
        take: 1,
      });

      if (brandPrices.length === 0 || genericPrices.length === 0) {
        throw new NotFoundException('Price comparison not available');
      }

      const brandPrice = brandPrices[0].price;
      const genericPrice = genericPrices[0].price;
      const savings = brandPrice - genericPrice;
      const savingsPercent = (savings / brandPrice) * 100;

      return {
        brandPrice,
        genericPrice,
        savings: Math.round(savings * 100) / 100,
        savingsPercent: Math.round(savingsPercent * 100) / 100,
      };
    } catch (error) {
      this.logger.error(`Error calculating savings: ${error.message}`);
      throw error;
    }
  }
}
