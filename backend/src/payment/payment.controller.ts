import { Controller, Get } from '@nestjs/common';

@Controller('payment')
export class PaymentController {
  @Get('health')
  getHealth() {
    return { status: 'ok', service: 'Payment Service' };
  }
}