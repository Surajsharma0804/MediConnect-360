import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InsuranceCard } from '../../entities/insurance-card.entity';

export interface CostEstimate {
  serviceType: string;
  providerCost: number;
  insuranceCoverage: number;
  patientResponsibility: number;
  breakdown: {
    copay: number;
    coinsurance: number;
    deductible: number;
    outOfPocket: number;
  };
  notes: string[];
}

@Injectable()
export class CostEstimatorService {
  private readonly logger = new Logger(CostEstimatorService.name);

  // Average costs for common services (in USD)
  private readonly serviceCosts = {
    primary_care_visit: 150,
    specialist_visit: 250,
    urgent_care: 200,
    emergency_room: 1500,
    lab_test_basic: 100,
    lab_test_comprehensive: 300,
    xray: 200,
    mri: 1200,
    ct_scan: 800,
    ultrasound: 300,
    physical_therapy: 150,
    mental_health_session: 200,
    telemedicine: 75,
    prescription_generic: 20,
    prescription_brand: 150,
  };

  constructor(
    @InjectRepository(InsuranceCard)
    private insuranceCardRepository: Repository<InsuranceCard>,
  ) {}

  async estimateCost(
    userId: string,
    serviceType: string,
    insuranceCardId?: string,
  ): Promise<CostEstimate> {
    try {
      const providerCost = this.serviceCosts[serviceType] || 100;

      if (!insuranceCardId) {
        // No insurance - patient pays full cost
        return {
          serviceType,
          providerCost,
          insuranceCoverage: 0,
          patientResponsibility: providerCost,
          breakdown: {
            copay: 0,
            coinsurance: 0,
            deductible: 0,
            outOfPocket: providerCost,
          },
          notes: ['No insurance - full cost applies'],
        };
      }

      const insuranceCard = await this.insuranceCardRepository.findOne({
        where: { id: insuranceCardId, userId },
      });

      if (!insuranceCard) {
        throw new Error('Insurance card not found');
      }

      // Calculate costs based on insurance
      const deductibleRemaining =
        Number(insuranceCard.deductible || 0) -
        Number(insuranceCard.deductibleMet || 0);

      let copay = 0;
      let coinsurance = 0;
      let deductibleApplied = 0;

      // Determine copay based on service type
      if (serviceType.includes('primary_care')) {
        copay = Number(insuranceCard.copayPrimaryCare || 0);
      } else if (serviceType.includes('specialist')) {
        copay = Number(insuranceCard.copaySpecialist || 0);
      } else if (serviceType.includes('emergency')) {
        copay = Number(insuranceCard.copayEmergency || 0);
      } else if (serviceType.includes('urgent_care')) {
        copay = Number(insuranceCard.copayUrgentCare || 0);
      }

      // If deductible not met, patient pays toward deductible
      if (deductibleRemaining > 0) {
        deductibleApplied = Math.min(providerCost - copay, deductibleRemaining);
      }

      // After deductible, coinsurance applies (typically 20%)
      const remainingAfterDeductible = providerCost - copay - deductibleApplied;
      if (remainingAfterDeductible > 0) {
        coinsurance = remainingAfterDeductible * 0.2; // 20% coinsurance
      }

      const patientResponsibility = copay + deductibleApplied + coinsurance;
      const insuranceCoverage = providerCost - patientResponsibility;

      const notes: string[] = [];
      if (deductibleRemaining > 0) {
        notes.push(`Deductible remaining: $${deductibleRemaining.toFixed(2)}`);
      }
      if (copay > 0) {
        notes.push(`Copay applies: $${copay.toFixed(2)}`);
      }
      notes.push(
        'Estimate based on average costs and typical insurance coverage',
      );
      notes.push('Actual costs may vary by provider and location');

      return {
        serviceType,
        providerCost,
        insuranceCoverage,
        patientResponsibility,
        breakdown: {
          copay,
          coinsurance,
          deductible: deductibleApplied,
          outOfPocket: patientResponsibility,
        },
        notes,
      };
    } catch (error) {
      this.logger.error(`Error estimating cost: ${error.message}`);
      throw error;
    }
  }

  async compareProviders(
    userId: string,
    serviceType: string,
    providerCosts: Array<{
      providerId: string;
      providerName: string;
      cost: number;
    }>,
    insuranceCardId?: string,
  ): Promise<
    Array<CostEstimate & { providerId: string; providerName: string }>
  > {
    try {
      const estimates = await Promise.all(
        providerCosts.map(async (provider) => {
          const estimate = await this.estimateCost(
            userId,
            serviceType,
            insuranceCardId,
          );
          // Adjust for provider-specific cost
          const costRatio = provider.cost / estimate.providerCost;
          return {
            ...estimate,
            providerId: provider.providerId,
            providerName: provider.providerName,
            providerCost: provider.cost,
            insuranceCoverage: estimate.insuranceCoverage * costRatio,
            patientResponsibility: estimate.patientResponsibility * costRatio,
          };
        }),
      );

      // Sort by patient responsibility (lowest first)
      return estimates.sort(
        (a, b) => a.patientResponsibility - b.patientResponsibility,
      );
    } catch (error) {
      this.logger.error(`Error comparing providers: ${error.message}`);
      throw error;
    }
  }

  getAvailableServices(): Array<{
    key: string;
    name: string;
    averageCost: number;
  }> {
    return Object.entries(this.serviceCosts).map(([key, cost]) => ({
      key,
      name: key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      averageCost: cost,
    }));
  }
}
