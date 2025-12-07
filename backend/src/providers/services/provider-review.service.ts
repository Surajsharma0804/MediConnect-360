import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProviderReview } from '../../entities/provider-review.entity';
import { ProviderService } from './provider.service';

@Injectable()
export class ProviderReviewService {
  private readonly logger = new Logger(ProviderReviewService.name);

  constructor(
    @InjectRepository(ProviderReview)
    private readonly reviewRepository: Repository<ProviderReview>,
    private readonly providerService: ProviderService,
  ) {}

  async create(
    userId: string,
    providerId: string,
    data: Partial<ProviderReview>,
  ): Promise<ProviderReview> {
    try {
      // Check if user already reviewed this provider
      const existing = await this.reviewRepository.findOne({
        where: { userId, providerId },
      });

      if (existing) {
        throw new BadRequestException(
          'You have already reviewed this provider',
        );
      }

      const review = this.reviewRepository.create({
        ...data,
        userId,
        providerId,
      });

      const saved = await this.reviewRepository.save(review);
      this.logger.log(`Created review ${saved.id} for provider ${providerId}`);

      // Update provider rating
      await this.updateProviderRating(providerId);

      return saved;
    } catch (error) {
      this.logger.error(`Error creating review: ${error.message}`);
      throw error;
    }
  }

  async findByProvider(
    providerId: string,
    limit = 20,
    offset = 0,
  ): Promise<{ reviews: ProviderReview[]; total: number }> {
    try {
      const [reviews, total] = await this.reviewRepository.findAndCount({
        where: { providerId },
        order: { createdAt: 'DESC' },
        take: limit,
        skip: offset,
      });

      return { reviews, total };
    } catch (error) {
      this.logger.error(`Error fetching reviews: ${error.message}`);
      throw new Error('Failed to fetch reviews');
    }
  }

  async findOne(id: string): Promise<ProviderReview> {
    try {
      const review = await this.reviewRepository.findOne({
        where: { id },
      });

      if (!review) {
        throw new NotFoundException('Review not found');
      }

      return review;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching review: ${error.message}`);
      throw new Error('Failed to fetch review');
    }
  }

  async update(
    id: string,
    userId: string,
    data: Partial<ProviderReview>,
  ): Promise<ProviderReview> {
    try {
      const review = await this.findOne(id);

      if (review.userId !== userId) {
        throw new BadRequestException('You can only update your own reviews');
      }

      Object.assign(review, data);
      const updated = await this.reviewRepository.save(review);
      this.logger.log(`Updated review ${id}`);

      // Update provider rating
      await this.updateProviderRating(review.providerId);

      return updated;
    } catch (error) {
      this.logger.error(`Error updating review: ${error.message}`);
      throw error;
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    try {
      const review = await this.findOne(id);

      if (review.userId !== userId) {
        throw new BadRequestException('You can only delete your own reviews');
      }

      const providerId = review.providerId;
      await this.reviewRepository.softRemove(review);
      this.logger.log(`Deleted review ${id}`);

      // Update provider rating
      await this.updateProviderRating(providerId);
    } catch (error) {
      this.logger.error(`Error deleting review: ${error.message}`);
      throw error;
    }
  }

  async markHelpful(
    reviewId: string,
    userId: string,
    helpful: boolean = true,
  ): Promise<ProviderReview> {
    try {
      const review = await this.findOne(reviewId);

      if (helpful) {
        review.helpfulCount += 1;
      } else {
        review.notHelpfulCount += 1;
      }

      const updated = await this.reviewRepository.save(review);
      this.logger.log(`Updated helpful votes for review ${reviewId}`);
      return updated;
    } catch (error) {
      this.logger.error(`Error marking review helpful: ${error.message}`);
      throw new Error('Failed to mark review helpful');
    }
  }

  private async updateProviderRating(providerId: string): Promise<void> {
    try {
      const reviews = await this.reviewRepository.find({
        where: { providerId },
      });

      if (reviews.length === 0) {
        return;
      }

      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0,
      );
      const averageRating = totalRating / reviews.length;

      await this.providerService.updateRating(
        providerId,
        averageRating,
        reviews.length,
      );
    } catch (error) {
      this.logger.error(`Error updating provider rating: ${error.message}`);
    }
  }
}
