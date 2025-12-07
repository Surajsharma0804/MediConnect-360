import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider, ProviderStatus } from '../../entities/provider.entity';

interface SearchFilters {
  specialization?: string;
  insuranceAccepted?: string[];
  minRating?: number;
  acceptingNewPatients?: boolean;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  languages?: string[];
}

@Injectable()
export class ProviderSearchService {
  private readonly logger = new Logger(ProviderSearchService.name);

  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
  ) {}

  async search(
    filters: SearchFilters,
    limit = 20,
    offset = 0,
  ): Promise<{ providers: Provider[]; total: number }> {
    try {
      const query = this.providerRepository
        .createQueryBuilder('provider')
        .where('provider.status = :status', { status: ProviderStatus.ACTIVE });

      // Filter by specialization
      if (filters.specialization) {
        query.andWhere(':specialization = ANY(provider.specializations)', {
          specialization: filters.specialization,
        });
      }

      // Filter by insurance
      if (filters.insuranceAccepted && filters.insuranceAccepted.length > 0) {
        query.andWhere('provider.insuranceAccepted && :insurance', {
          insurance: filters.insuranceAccepted,
        });
      }

      // Filter by rating
      if (filters.minRating) {
        query.andWhere('provider.rating >= :minRating', {
          minRating: filters.minRating,
        });
      }

      // Filter by accepting new patients
      if (filters.acceptingNewPatients !== undefined) {
        query.andWhere('provider.acceptsNewPatients = :accepting', {
          accepting: filters.acceptingNewPatients,
        });
      }

      // Filter by languages
      if (filters.languages && filters.languages.length > 0) {
        query.andWhere('provider.languages && :languages', {
          languages: filters.languages,
        });
      }

      // Geo-location search
      if (filters.latitude && filters.longitude && filters.radiusKm) {
        // Using Haversine formula for distance calculation
        query.andWhere(
          `(6371 * acos(cos(radians(:lat)) * cos(radians(provider.latitude)) * 
          cos(radians(provider.longitude) - radians(:lng)) + 
          sin(radians(:lat)) * sin(radians(provider.latitude)))) <= :radius`,
          {
            lat: filters.latitude,
            lng: filters.longitude,
            radius: filters.radiusKm,
          },
        );
      }

      // Order by rating
      query.orderBy('provider.rating', 'DESC');
      query.addOrderBy('provider.totalReviews', 'DESC');

      // Pagination
      query.skip(offset).take(limit);

      const [providers, total] = await query.getManyAndCount();

      this.logger.log(`Search returned ${providers.length} providers`);
      return { providers, total };
    } catch (error) {
      this.logger.error(`Error searching providers: ${error.message}`);
      throw new Error('Failed to search providers');
    }
  }

  async findNearby(
    latitude: number,
    longitude: number,
    radiusKm = 50,
    limit = 20,
  ): Promise<Provider[]> {
    try {
      const providers = await this.providerRepository
        .createQueryBuilder('provider')
        .where('provider.status = :status', { status: ProviderStatus.ACTIVE })
        .andWhere(
          `(6371 * acos(cos(radians(:lat)) * cos(radians(provider.latitude)) * 
          cos(radians(provider.longitude) - radians(:lng)) + 
          sin(radians(:lat)) * sin(radians(provider.latitude)))) <= :radius`,
          { lat: latitude, lng: longitude, radius: radiusKm },
        )
        .orderBy('provider.rating', 'DESC')
        .take(limit)
        .getMany();

      return providers;
    } catch (error) {
      this.logger.error(`Error finding nearby providers: ${error.message}`);
      throw new Error('Failed to find nearby providers');
    }
  }

  async getSpecializations(): Promise<string[]> {
    try {
      const result = await this.providerRepository
        .createQueryBuilder('provider')
        .select('DISTINCT unnest(provider.specializations)', 'specialization')
        .where('provider.status = :status', { status: ProviderStatus.ACTIVE })
        .getRawMany();

      return result.map((r) => r.specialization).sort();
    } catch (error) {
      this.logger.error(`Error fetching specializations: ${error.message}`);
      throw new Error('Failed to fetch specializations');
    }
  }
}
