import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
  Headers,
} from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('create-intent')
  @UseGuards(AuthGuard('jwt'))
  async createPaymentIntent(
    @Body() body: { amount: number; currency?: string; metadata?: any },
    @Req() req,
  ) {
    return this.paymentService.createPaymentIntent(
      body.amount,
      body.currency || 'usd',
      { ...body.metadata, userId: req.user.id },
    );
  }

  @Post('create-checkout-session')
  @UseGuards(AuthGuard('jwt'))
  async createCheckoutSession(
    @Body() body: { priceId: string; successUrl: string; cancelUrl: string },
    @Req() req,
  ) {
    return this.paymentService.createCheckoutSession(
      body.priceId,
      body.successUrl,
      body.cancelUrl,
      req.user.email,
    );
  }

  @Post('create-customer')
  @UseGuards(AuthGuard('jwt'))
  async createCustomer(@Req() req) {
    return this.paymentService.createCustomer(req.user.email, req.user.name, {
      userId: req.user.id,
    });
  }

  @Post('create-subscription')
  @UseGuards(AuthGuard('jwt'))
  async createSubscription(
    @Body() body: { customerId: string; priceId: string },
  ) {
    return this.paymentService.createSubscription(
      body.customerId,
      body.priceId,
    );
  }

  @Post('cancel-subscription/:subscriptionId')
  @UseGuards(AuthGuard('jwt'))
  async cancelSubscription(@Param('subscriptionId') subscriptionId: string) {
    return this.paymentService.cancelSubscription(subscriptionId);
  }

  @Get('intent/:paymentIntentId')
  @UseGuards(AuthGuard('jwt'))
  async getPaymentIntent(@Param('paymentIntentId') paymentIntentId: string) {
    return this.paymentService.getPaymentIntent(paymentIntentId);
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: any,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody || req.body;
    const event = await this.paymentService.constructWebhookEvent(
      rawBody,
      signature,
    );

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Handle successful payment
        console.log('Payment succeeded:', event.data.object);
        break;
      case 'payment_intent.payment_failed':
        // Handle failed payment
        console.log('Payment failed:', event.data.object);
        break;
      case 'customer.subscription.created':
        // Handle new subscription
        console.log('Subscription created:', event.data.object);
        break;
      case 'customer.subscription.deleted':
        // Handle canceled subscription
        console.log('Subscription canceled:', event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }
}
