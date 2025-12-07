import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PaymentPlanService } from '../services/payment-plan.service';

@Controller('api/insurance/payment-plans')
@UseGuards(JwtAuthGuard)
export class PaymentPlanController {
  constructor(private readonly paymentPlanService: PaymentPlanService) {}

  @Post()
  async create(@Request() req, @Body() planData: any) {
    return this.paymentPlanService.create(req.user.userId, planData);
  }

  @Get()
  async findAll(@Request() req) {
    return this.paymentPlanService.findByUser(req.user.userId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.paymentPlanService.findById(id, req.user.userId);
  }

  @Post(':id/payment')
  async processPayment(
    @Request() req,
    @Param('id') id: string,
    @Body('amount') amount: number,
  ) {
    return this.paymentPlanService.processPayment(id, req.user.userId, amount);
  }
}
