// Payment API Service
// Maps to: backend/src/payment/payment.controller.ts

import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  isPopular: boolean;
  stripePriceId: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  plan?: SubscriptionPlan;
}

export interface Invoice {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  description: string;
  dueDate: string;
  paidAt?: string;
  invoiceUrl?: string;
  createdAt: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const paymentAPI = {
  /** Create a payment intent */
  createPaymentIntent: (amount: number, currency?: string, description?: string) =>
    api.post<PaymentIntent>('/payment/create-intent', { amount, currency, description }),

  /** Get available subscription plans */
  getPlans: () =>
    api.get<SubscriptionPlan[]>('/payment/plans', { skipAuth: true }),

  /** Get current subscription */
  getSubscription: () =>
    api.get<Subscription>('/payment/subscription'),

  /** Subscribe to a plan */
  subscribe: (planId: string, paymentMethodId: string) =>
    api.post<Subscription>('/payment/subscribe', { planId, paymentMethodId }),

  /** Cancel subscription */
  cancelSubscription: () =>
    api.post<{ message: string }>('/payment/subscription/cancel'),

  /** Get billing history */
  getInvoices: () =>
    api.get<Invoice[]>('/payment/invoices'),

  /** Get a single invoice */
  getInvoice: (id: string) =>
    api.get<Invoice>(`/payment/invoices/${id}`),
};

export default paymentAPI;
