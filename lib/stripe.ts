import Stripe from 'stripe'

export function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? '')
}

export const PLANS = {
  starter: {
    name: 'Up to 50 Vehicles',
    price: 99,
    priceId: process.env.STRIPE_PRICE_STARTER!,
    vehicles: 50,
    features: [
      'Up to 50 vehicles',
      'Unlimited checkout/return sessions',
      'QR code stickers per vehicle',
      'AI damage detection',
      'Damage attribution reports',
      'PDF insurance export',
      'Driver damage history',
      'Shift summary reports',
    ],
  },
  pro: {
    name: 'Up to 200 Vehicles',
    price: 199,
    priceId: process.env.STRIPE_PRICE_PRO!,
    vehicles: 200,
    features: [
      'Up to 200 vehicles',
      'Everything in Starter',
      'Multiple locations',
      'Damage cost tracking',
      'Monthly cost reports',
      'Priority support',
    ],
  },
  enterprise: {
    name: 'Unlimited Vehicles',
    price: 399,
    priceId: process.env.STRIPE_PRICE_ENTERPRISE!,
    vehicles: 999999,
    features: [
      'Unlimited vehicles',
      'Everything in Pro',
      'Unlimited locations',
      'API access',
      'White-label reports',
      'Dedicated support',
    ],
  },
} as const

export type PlanKey = keyof typeof PLANS
