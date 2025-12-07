import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider, ProviderStatus } from '../../entities/provider.entity';

@Injectable()
export class ProviderService {
  private readonly logger = new Logger(ProviderService.name);

  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
  ) {}

  async create(data: Partial<Provider>): Promise<Provider> {
    try {
      const provider = this.providerRepository.create(data);
      const saved = await this.providerRepository.save(provider);
      this.logger.log(`Created provider ${saved.id}`);
      return saved;
    } catch (error) {
      this.logger.error(`Error creating provider: ${error.message}`);
      throw new Error('Failed to create provider');
    }
  }

  async findAll(
    limit = 50,
    offset = 0,
  ): Promise<{ providers: Provider[]; total: number }> {
    try {
      const [providers, total] = await this.providerRepository.findAndCount({
        where: { status: ProviderStatus.ACTIVE },
        order: { rating: 'DESC' },
        take: limit,
        skip: offset,
      });
      return { providers, total };
    } catch (error) {
      this.logger.error(`Error fetching providers: ${error.message}`);
      throw new Error('Failed to fetch providers');
    }
  }

  async findOne(id: string): Promise<Provider> {
    try {
      const provider = await this.providerRepository.findOne({
        where: { id },
      });

      if (!provider) {
        throw new NotFoundException('Provider not found');
      }

      return provider;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching provider: ${error.message}`);
      throw new Error('Failed to fetch provider');
    }
  }

  async update(id: string, data: Partial<Provider>): Promise<Provider> {
    try {
      const provider = await this.findOne(id);
      Object.assign(provider, data);
      const updated = await this.providerRepository.save(provider);
      this.logger.log(`Updated provider ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Error updating provider: ${error.message}`);
      throw new Error('Failed to update provider');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const provider = await this.findOne(id);
      await this.providerRepository.softRemove(provider);
      this.logger.log(`Deleted provider ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting provider: ${error.message}`);
      throw new Error('Failed to delete provider');
    }
  }

  async findBySpecialization(specialization: string): Promise<Provider[]> {
    try {
      return await this.providerRepository
        .createQueryBuilder('provider')
        .where('provider.status = :status', { status: ProviderStatus.ACTIVE })
        .andWhere(':specialization = ANY(provider.specializations)', {
          specialization,
        })
        .orderBy('provider.rating', 'DESC')
        .getMany();
    } catch (error) {
      this.logger.error(`Error searching by specialization: ${error.message}`);
      throw new Error('Failed to search providers');
    }
  }

  async updateRating(
    providerId: string,
    newRating: number,
    totalReviews: number,
  ): Promise<void> {
    try {
      await this.providerRepository.update(providerId, {
        rating: newRating,
        totalReviews,
      });
      this.logger.log(`Updated rating for provider ${providerId}`);
    } catch (error) {
      this.logger.error(`Error updating rating: ${error.message}`);
      throw new Error('Failed to update rating');
    }
  }
}
