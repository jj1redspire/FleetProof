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
    vertical: 'fleet' as const,
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
    vertical: 'fleet' as const,
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
    vertical: 'fleet' as const,
    features: [
      'Unlimited vehicles',
      'Everything in Pro',
      'Unlimited locations',
      'API access',
      'White-label reports',
      'Dedicated support',
    ],
  },
  // ── Towing vertical ──────────────────────────────────────────────────────
  tow_single: {
    name: 'Single Truck',
    price: 39,
    priceId: process.env.STRIPE_PRICE_TOW_SINGLE!,
    vehicles: 1,
    vertical: 'towing' as const,
    features: [
      '1 tow truck',
      'Unlimited tow logs',
      'Pre-tow vehicle documentation',
      'Plate & VIN photo capture',
      'Witness / officer signature',
      'Hook-up point documentation',
      'AI damage comparison',
      'PDF claim defense reports',
    ],
  },
  tow_unlimited: {
    name: 'Towing Company',
    price: 99,
    priceId: process.env.STRIPE_PRICE_TOW_UNLIMITED!,
    vehicles: 999999,
    vertical: 'towing' as const,
    features: [
      'Unlimited tow trucks',
      'Everything in Single Truck',
      'Multiple drivers / operators',
      'Driver damage history',
      'Shift summary reports',
      'Insurance export package',
      'Priority support',
    ],
  },
} as const

export type PlanKey = keyof typeof PLANS
