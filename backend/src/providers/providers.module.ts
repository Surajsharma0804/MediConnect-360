import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Provider } from '../entities/provider.entity';
import { ProviderReview } from '../entities/provider-review.entity';
import { ProviderController } from './controllers/provider.controller';
import { ProviderReviewController } from './controllers/provider-review.controller';
import { ProviderService } from './services/provider.service';
import { ProviderSearchService } from './services/provider-search.service';
import { ProviderReviewService } from './services/provider-review.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Provider, ProviderReview]),
  ],
  controllers: [
    ProviderController,
    ProviderReviewController,
  ],
  providers: [
    ProviderService,
    ProviderSearchService,
    ProviderReviewService,
  ],
  exports: [
    ProviderService,
    ProviderSearchService,
    ProviderReviewService,
  ],
})
export class ProvidersModule {}
