export interface FPUser {
  id: string
  email: string
  stripe_customer_id: string | null
  subscription_status: 'trial' | 'active' | 'past_due' | 'canceled' | 'free'
  plan: 'starter' | 'pro' | 'enterprise' | 'free'
  created_at: string
}

export interface FPLocation {
  id: string
  user_id: string
  name: string
  address: string | null
  business_type: 'golf_course' | 'resort' | 'community' | 'university' | 'hotel' | 'other'
  created_at: string
}

export type VehicleCondition = 'good' | 'minor_damage' | 'needs_repair'
export type VehicleType = 'golf_cart' | 'lsv' | 'shuttle' | 'utility' | 'bicycle' | 'scooter' | 'other'

export interface FPVehicle {
  id: string
  location_id: string
  vehicle_number: string
  vehicle_type: VehicleType
  qr_code: string | null
  initial_photos: string[]
  condition_status: VehicleCondition
  created_at: string
}

export type SessionStatus = 'active' | 'completed' | 'disputed'

export interface FPSession {
  id: string
  vehicle_id: string
  driver_name: string
  checkout_time: string
  return_time: string | null
  checkout_photos: string[]
  return_photos: string[]
  checkout_voice: string | null
  return_voice: string | null
  checkout_ai_report: Record<string, unknown> | null
  return_ai_report: Record<string, unknown> | null
  damage_detected: boolean
  damage_items: Record<string, unknown> | null
  damage_cost: number | null
  status: SessionStatus
  created_at: string
}

export type DamageRepairStatus = 'open' | 'scheduled' | 'completed'

export interface FPDamageRecord {
  id: string
  vehicle_id: string
  session_id: string | null
  description: string
  severity: 'minor' | 'moderate' | 'major'
  photos: string[]
  repair_cost: number | null
  repair_status: DamageRepairStatus
  created_at: string
}

export interface FPSubscription {
  id: string
  user_id: string
  stripe_subscription_id: string
  status: string
  current_period_start: string | null
  current_period_end: string | null
  created_at: string
}
