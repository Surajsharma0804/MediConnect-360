import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private stripe: Stripe;

  constructor() {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      this.logger.warn(
        'STRIPE_SECRET_KEY not configured. Payment features will be disabled.',
      );
      return;
    }

    this.stripe = new Stripe(apiKey, {
      apiVersion: '2025-11-17.clover',
    });
    this.logger.log('Stripe Payment Service initialized');
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata?: any,
  ) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      this.logger.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  async createSubscription(customerId: string, priceId: string) {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      return subscription;
    } catch (error) {
      this.logger.error('Error creating subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  async createCustomer(email: string, name: string, metadata?: any) {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata,
      });

      return customer;
    } catch (error) {
      this.logger.error('Error creating customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  async getPaymentIntent(paymentIntentId: string) {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      this.logger.error('Error retrieving payment intent:', error);
      throw new Error('Failed to retrieve payment intent');
    }
  }

  async cancelSubscription(subscriptionId: string) {
    try {
      return await this.stripe.subscriptions.cancel(subscriptionId);
    } catch (error) {
      this.logger.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  constructWebhookEvent(payload: Buffer, signature: string) {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        throw new Error('Webhook secret not configured');
      }

      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (error) {
      this.logger.error('Error constructing webhook event:', error);
      throw error;
    }
  }

  async createCheckoutSession(
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    customerEmail?: string,
  ) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: customerEmail,
      });

      return session;
    } catch (error) {
      this.logger.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }
}
