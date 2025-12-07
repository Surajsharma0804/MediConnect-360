import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InsuranceCard } from '../entities/insurance-card.entity';
import { InsuranceClaim } from '../entities/insurance-claim.entity';
import { PaymentPlan } from '../entities/payment-plan.entity';
import { Invoice } from '../entities/invoice.entity';
import { HsaFsaAccount } from '../entities/hsa-fsa-account.entity';
import { User } from '../entities/user.entity';
import { InsuranceCardService } from './services/insurance-card.service';
import { InsuranceClaimService } from './services/insurance-claim.service';
import { PaymentPlanService } from './services/payment-plan.service';
import { InvoiceService } from './services/invoice.service';
import { HsaFsaService } from './services/hsa-fsa.service';
import { CostEstimatorService } from './services/cost-estimator.service';
import { InsuranceCardController } from './controllers/insurance-card.controller';
import { InsuranceClaimController } from './controllers/insurance-claim.controller';
import { PaymentPlanController } from './controllers/payment-plan.controller';
import { InvoiceController } from './controllers/invoice.controller';
import { HsaFsaController } from './controllers/hsa-fsa.controller';
import { CostEstimatorController } from './controllers/cost-estimator.controller';
import { EmailService } from '../services/email.service';
import { NotificationService } from '../services/notification.service';
import { StorageService } from '../services/storage.service';
import { PaymentService } from '../services/payment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InsuranceCard,
      InsuranceClaim,
      PaymentPlan,
      Invoice,
      HsaFsaAccount,
      User,
    ]),
  ],
  controllers: [
    InsuranceCardController,
    InsuranceClaimController,
    PaymentPlanController,
    InvoiceController,
    HsaFsaController,
    CostEstimatorController,
  ],
  providers: [
    InsuranceCardService,
    InsuranceClaimService,
    PaymentPlanService,
    InvoiceService,
    HsaFsaService,
    CostEstimatorService,
    EmailService,
    NotificationService,
    StorageService,
    PaymentService,
  ],
  exports: [
    InsuranceCardService,
    InsuranceClaimService,
    PaymentPlanService,
    InvoiceService,
    HsaFsaService,
    CostEstimatorService,
  ],
})
export class InsuranceModule {}
