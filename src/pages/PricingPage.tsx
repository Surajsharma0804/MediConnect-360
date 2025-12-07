import React, { useState } from 'react';
import { Check, Zap, Crown, Sparkles } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  popular?: boolean;
  priceId: string;
}

const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  const pricingTiers: PricingTier[] = [
    {
      name: 'Basic',
      price: billingCycle === 'monthly' ? '$0' : '$0',
      period: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'Perfect for getting started with basic health tracking',
      priceId: 'price_basic',
      icon: <Zap className="w-6 h-6" />,
      features: [
        'AI Symptom Checker',
        'Basic Health Records',
        'Appointment Scheduling',
        'Email Support',
        '5 Virtual Consultations/month',
      ],
    },
    {
      name: 'Pro',
      price: billingCycle === 'monthly' ? '$29' : '$290',
      period: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'Advanced features for comprehensive health management',
      priceId: billingCycle === 'monthly' ? 'price_pro_monthly' : 'price_pro_yearly',
      icon: <Crown className="w-6 h-6" />,
      popular: true,
      features: [
        'Everything in Basic',
        'Unlimited Virtual Consultations',
        'Advanced AI Health Insights',
        'Priority Support',
        'Health Analytics Dashboard',
        'Prescription Management',
        'Lab Results Integration',
      ],
    },
    {
      name: 'Enterprise',
      price: billingCycle === 'monthly' ? '$99' : '$990',
      period: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'Complete healthcare solution for organizations',
      priceId: billingCycle === 'monthly' ? 'price_enterprise_monthly' : 'price_enterprise_yearly',
      icon: <Sparkles className="w-6 h-6" />,
      features: [
        'Everything in Pro',
        'Multi-user Management',
        'Custom Integrations',
        'Dedicated Account Manager',
        'HIPAA Compliance Tools',
        'Advanced Security Features',
        'API Access',
        'White-label Options',
      ],
    },
  ];

  const handleSubscribe = async (priceId: string, tierName: string) => {
    if (tierName === 'Basic') {
      window.location.href = '/dashboard';
      return;
    }

    setLoading(priceId);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/payment/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/dashboard?payment=success`,
          cancelUrl: `${window.location.origin}/pricing?payment=cancelled`,
        }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          console.error('Stripe error:', error);
          alert('Payment failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-slate-400 mb-8">
            Select the perfect plan for your healthcare needs
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center glass-panel p-1 rounded-lg">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`glass-panel p-8 rounded-2xl relative ${
                tier.popular ? 'ring-2 ring-purple-500 scale-105' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                  {tier.icon}
                </div>
                <h3 className="text-2xl font-bold">{tier.name}</h3>
              </div>

              <div className="mb-4">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span className="text-slate-400">{tier.period}</span>
              </div>

              <p className="text-slate-400 mb-6">{tier.description}</p>

              <button
                onClick={() => handleSubscribe(tier.priceId, tier.name)}
                disabled={loading === tier.priceId}
                className={`w-full py-3 rounded-lg font-medium transition-all mb-6 ${
                  tier.popular
                    ? 'btn-primary'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                {loading === tier.priceId ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : tier.name === 'Basic' ? (
                  'Get Started Free'
                ) : (
                  'Subscribe Now'
                )}
              </button>

              <ul className="space-y-3">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="glass-panel p-6 text-left">
              <h3 className="font-semibold mb-2">Can I change plans later?</h3>
              <p className="text-slate-400">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            <div className="glass-panel p-6 text-left">
              <h3 className="font-semibold mb-2">Is my data secure?</h3>
              <p className="text-slate-400">
                Absolutely. We use bank-level encryption and are HIPAA compliant to ensure your health data is always protected.
              </p>
            </div>
            <div className="glass-panel p-6 text-left">
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-slate-400">
                We accept all major credit cards, debit cards, and digital wallets through our secure payment processor Stripe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
