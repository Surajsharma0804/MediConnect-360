import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pharmacy } from '../../entities/pharmacy.entity';

@Injectable()
export class PharmacyService {
  private readonly logger = new Logger(PharmacyService.name);

  constructor(
    @InjectRepository(Pharmacy)
    private pharmacyRepository: Repository<Pharmacy>,
  ) {}

  async findAll(filters?: {
    city?: string;
    state?: string;
    zipCode?: string;
    chain?: string;
    isOpen24Hours?: boolean;
    offersDelivery?: boolean;
    acceptsEPrescriptions?: boolean;
  }): Promise<Pharmacy[]> {
    try {
      const query = this.pharmacyRepository.createQueryBuilder('pharmacy');

      query.where('pharmacy.isActive = :isActive', { isActive: true });

      if (filters?.city) {
        query.andWhere('LOWER(pharmacy.city) = LOWER(:city)', {
          city: filters.city,
        });
      }

      if (filters?.state) {
        query.andWhere('LOWER(pharmacy.state) = LOWER(:state)', {
          state: filters.state,
        });
      }

      if (filters?.zipCode) {
        query.andWhere('pharmacy.zipCode = :zipCode', {
          zipCode: filters.zipCode,
        });
      }

      if (filters?.chain) {
        query.andWhere('LOWER(pharmacy.chain) = LOWER(:chain)', {
          chain: filters.chain,
        });
      }

      if (filters?.isOpen24Hours !== undefined) {
        query.andWhere('pharmacy.isOpen24Hours = :isOpen24Hours', {
          isOpen24Hours: filters.isOpen24Hours,
        });
      }

      if (filters?.offersDelivery !== undefined) {
        query.andWhere('pharmacy.offersDelivery = :offersDelivery', {
          offersDelivery: filters.offersDelivery,
        });
      }

      if (filters?.acceptsEPrescriptions !== undefined) {
        query.andWhere(
          'pharmacy.acceptsEPrescriptions = :acceptsEPrescriptions',
          {
            acceptsEPrescriptions: filters.acceptsEPrescriptions,
          },
        );
      }

      query.orderBy('pharmacy.rating', 'DESC');

      return await query.getMany();
    } catch (error) {
      this.logger.error(`Error finding pharmacies: ${error.message}`);
      throw error;
    }
  }

  async findNearby(
    latitude: number,
    longitude: number,
    radiusMiles: number = 10,
  ): Promise<Pharmacy[]> {
    try {
      // Haversine formula for distance calculation
      const query = this.pharmacyRepository
        .createQueryBuilder('pharmacy')
        .where('pharmacy.isActive = :isActive', { isActive: true })
        .andWhere('pharmacy.latitude IS NOT NULL')
        .andWhere('pharmacy.longitude IS NOT NULL')
        .addSelect(
          `(
          3959 * acos(
            cos(radians(:latitude)) * 
            cos(radians(pharmacy.latitude)) * 
            cos(radians(pharmacy.longitude) - radians(:longitude)) + 
            sin(radians(:latitude)) * 
            sin(radians(pharmacy.latitude))
          )
        )`,
          'distance',
        )
        .setParameters({ latitude, longitude })
        .having('distance <= :radius', { radius: radiusMiles })
        .orderBy('distance', 'ASC');

      return await query.getMany();
    } catch (error) {
      this.logger.error(`Error finding nearby pharmacies: ${error.message}`);
      throw error;
    }
  }

  async findById(id: string): Promise<Pharmacy> {
    try {
      const pharmacy = await this.pharmacyRepository.findOne({
        where: { id, isActive: true },
      });

      if (!pharmacy) {
        throw new NotFoundException(`Pharmacy with ID ${id} not found`);
      }

      return pharmacy;
    } catch (error) {
      this.logger.error(`Error finding pharmacy: ${error.message}`);
      throw error;
    }
  }

  async create(pharmacyData: Partial<Pharmacy>): Promise<Pharmacy> {
    try {
      const pharmacy = this.pharmacyRepository.create(pharmacyData);
      return await this.pharmacyRepository.save(pharmacy);
    } catch (error) {
      this.logger.error(`Error creating pharmacy: ${error.message}`);
      throw error;
    }
  }

  async update(id: string, pharmacyData: Partial<Pharmacy>): Promise<Pharmacy> {
    try {
      const pharmacy = await this.findById(id);
      Object.assign(pharmacy, pharmacyData);
      return await this.pharmacyRepository.save(pharmacy);
    } catch (error) {
      this.logger.error(`Error updating pharmacy: ${error.message}`);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const pharmacy = await this.findById(id);
      pharmacy.isActive = false;
      await this.pharmacyRepository.save(pharmacy);
    } catch (error) {
      this.logger.error(`Error deleting pharmacy: ${error.message}`);
      throw error;
    }
  }

  async searchByName(name: string): Promise<Pharmacy[]> {
    try {
      return await this.pharmacyRepository
        .createQueryBuilder('pharmacy')
        .where('pharmacy.isActive = :isActive', { isActive: true })
        .andWhere('LOWER(pharmacy.name) LIKE LOWER(:name)', {
          name: `%${name}%`,
        })
        .orderBy('pharmacy.rating', 'DESC')
        .getMany();
    } catch (error) {
      this.logger.error(`Error searching pharmacies: ${error.message}`);
      throw error;
    }
  }

  async getChains(): Promise<string[]> {
    try {
      const result = await this.pharmacyRepository
        .createQueryBuilder('pharmacy')
        .select('DISTINCT pharmacy.chain', 'chain')
        .where('pharmacy.isActive = :isActive', { isActive: true })
        .andWhere('pharmacy.chain IS NOT NULL')
        .orderBy('pharmacy.chain', 'ASC')
        .getRawMany();

      return result.map((r) => r.chain);
    } catch (error) {
      this.logger.error(`Error getting pharmacy chains: ${error.message}`);
      throw error;
    }
  }

  async updateRating(pharmacyId: string): Promise<void> {
    try {
      // This would typically calculate from reviews
      // For now, just a placeholder
      this.logger.log(`Rating updated for pharmacy ${pharmacyId}`);
    } catch (error) {
      this.logger.error(`Error updating pharmacy rating: ${error.message}`);
      throw error;
    }
  }
}
