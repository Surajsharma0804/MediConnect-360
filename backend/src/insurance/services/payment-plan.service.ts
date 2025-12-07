import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PaymentPlan,
  PaymentPlanStatus,
} from '../../entities/payment-plan.entity';
import { PaymentService } from '../../services/payment.service';
import { NotificationService } from '../../services/notification.service';

@Injectable()
export class PaymentPlanService {
  private readonly logger = new Logger(PaymentPlanService.name);

  constructor(
    @InjectRepository(PaymentPlan)
    private paymentPlanRepository: Repository<PaymentPlan>,
    private paymentService: PaymentService,
    private notificationService: NotificationService,
  ) {}

  async create(
    userId: string,
    planData: Partial<PaymentPlan>,
  ): Promise<PaymentPlan> {
    try {
      const plan = this.paymentPlanRepository.create({
        ...planData,
        userId,
        amountPaid: 0,
        amountRemaining: planData.totalAmount,
        installmentsPaid: 0,
      });

      return await this.paymentPlanRepository.save(plan);
    } catch (error) {
      this.logger.error(`Error creating payment plan: ${error.message}`);
      throw error;
    }
  }

  async findByUser(userId: string): Promise<PaymentPlan[]> {
    try {
      return await this.paymentPlanRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Error finding payment plans: ${error.message}`);
      throw error;
    }
  }

  async findById(id: string, userId: string): Promise<PaymentPlan> {
    try {
      const plan = await this.paymentPlanRepository.findOne({
        where: { id, userId },
      });

      if (!plan) {
        throw new NotFoundException('Payment plan not found');
      }

      return plan;
    } catch (error) {
      this.logger.error(`Error finding payment plan: ${error.message}`);
      throw error;
    }
  }

  async processPayment(
    id: string,
    userId: string,
    amount: number,
  ): Promise<PaymentPlan> {
    try {
      const plan = await this.findById(id, userId);

      plan.amountPaid = Number(plan.amountPaid) + amount;
      plan.amountRemaining = Number(plan.totalAmount) - Number(plan.amountPaid);
      plan.installmentsPaid += 1;

      const paymentRecord = {
        date: new Date(),
        amount,
        status: 'completed',
        transactionId: `TXN-${Date.now()}`,
      };

      plan.paymentHistory = [...(plan.paymentHistory || []), paymentRecord];

      if (plan.amountRemaining <= 0) {
        plan.status = PaymentPlanStatus.COMPLETED;
        plan.completedDate = new Date();
      }

      // Calculate next payment date
      if (plan.status === PaymentPlanStatus.ACTIVE) {
        plan.nextPaymentDate = this.calculateNextPaymentDate(
          plan.nextPaymentDate,
          plan.frequency,
        );
      }

      return await this.paymentPlanRepository.save(plan);
    } catch (error) {
      this.logger.error(`Error processing payment: ${error.message}`);
      throw error;
    }
  }

  private calculateNextPaymentDate(currentDate: Date, frequency: string): Date {
    const next = new Date(currentDate);
    switch (frequency) {
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'bi_weekly':
        next.setDate(next.getDate() + 14);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        break;
    }
    return next;
  }
}
