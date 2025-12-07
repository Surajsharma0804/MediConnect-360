import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  CostEstimatorService,
  CostEstimate,
} from '../services/cost-estimator.service';

@Controller('api/insurance/cost-estimator')
@UseGuards(JwtAuthGuard)
export class CostEstimatorController {
  constructor(private readonly costEstimatorService: CostEstimatorService) {}

  @Get('services')
  getAvailableServices() {
    return this.costEstimatorService.getAvailableServices();
  }

  @Post('estimate')
  async estimateCost(
    @Request() req,
    @Body('serviceType') serviceType: string,
    @Body('insuranceCardId') insuranceCardId?: string,
  ): Promise<CostEstimate> {
    return this.costEstimatorService.estimateCost(
      req.user.userId,
      serviceType,
      insuranceCardId,
    );
  }

  @Post('compare')
  async compareProviders(
    @Request() req,
    @Body('serviceType') serviceType: string,
    @Body('providerCosts') providerCosts: any[],
    @Body('insuranceCardId') insuranceCardId?: string,
  ): Promise<
    Array<CostEstimate & { providerId: string; providerName: string }>
  > {
    return this.costEstimatorService.compareProviders(
      req.user.userId,
      serviceType,
      providerCosts,
      insuranceCardId,
    );
  }
}
