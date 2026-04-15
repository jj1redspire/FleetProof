-- FleetProof Database Schema
-- All tables use fp_ prefix
-- Run in Supabase SQL Editor

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS fp_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  subscription_status TEXT NOT NULL DEFAULT 'free'
    CHECK (subscription_status IN ('trial', 'active', 'past_due', 'canceled', 'free')),
  plan TEXT NOT NULL DEFAULT 'free'
    CHECK (plan IN ('starter', 'pro', 'enterprise', 'free')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE fp_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own record" ON fp_users FOR ALL USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION fp_handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.fp_users (id, email) VALUES (NEW.id, NEW.email) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_fp_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION fp_handle_new_user();

-- ============================================================
-- LOCATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS fp_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES fp_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  business_type TEXT DEFAULT 'golf_course'
    CHECK (business_type IN ('golf_course', 'resort', 'community', 'university', 'hotel', 'other')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE fp_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own locations" ON fp_locations
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- VEHICLES
-- ============================================================
CREATE TABLE IF NOT EXISTS fp_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES fp_locations(id) ON DELETE CASCADE,
  vehicle_number TEXT NOT NULL,
  vehicle_type TEXT NOT NULL DEFAULT 'golf_cart'
    CHECK (vehicle_type IN ('golf_cart', 'lsv', 'shuttle', 'utility', 'bicycle', 'scooter', 'other')),
  qr_code TEXT,               -- base64 PNG data URL of QR code
  initial_photos JSONB NOT NULL DEFAULT '[]',
  condition_status TEXT NOT NULL DEFAULT 'good'
    CHECK (condition_status IN ('good', 'minor_damage', 'needs_repair')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE fp_vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own vehicles" ON fp_vehicles
  FOR ALL USING (
    location_id IN (SELECT id FROM fp_locations WHERE user_id = auth.uid())
  );

-- ============================================================
-- SESSIONS (checkout → return)
-- ============================================================
CREATE TABLE IF NOT EXISTS fp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES fp_vehicles(id) ON DELETE CASCADE,
  driver_name TEXT NOT NULL,
  checkout_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  return_time TIMESTAMPTZ,
  checkout_photos JSONB NOT NULL DEFAULT '[]',   -- array of base64 strings
  return_photos JSONB NOT NULL DEFAULT '[]',
  checkout_voice TEXT,
  return_voice TEXT,
  checkout_ai_report JSONB,                       -- Claude condition analysis at checkout
  return_ai_report JSONB,                         -- Claude comparison result at return
  damage_detected BOOLEAN NOT NULL DEFAULT FALSE,
  damage_items JSONB,                             -- { new_damage[], unchanged[] }
  damage_cost NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'disputed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE fp_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sessions" ON fp_sessions
  FOR ALL USING (
    vehicle_id IN (
      SELECT v.id FROM fp_vehicles v
      JOIN fp_locations l ON l.id = v.location_id
      WHERE l.user_id = auth.uid()
    )
  );

-- ============================================================
-- DAMAGE RECORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS fp_damage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES fp_vehicles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES fp_sessions(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'minor'
    CHECK (severity IN ('minor', 'moderate', 'major')),
  photos JSONB NOT NULL DEFAULT '[]',
  repair_cost NUMERIC(10,2),
  repair_status TEXT NOT NULL DEFAULT 'open'
    CHECK (repair_status IN ('open', 'scheduled', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE fp_damage_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own damage records" ON fp_damage_records
  FOR ALL USING (
    vehicle_id IN (
      SELECT v.id FROM fp_vehicles v
      JOIN fp_locations l ON l.id = v.location_id
      WHERE l.user_id = auth.uid()
    )
  );

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS fp_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES fp_users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'trialing',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE fp_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own subscriptions" ON fp_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_fp_locations_user_id ON fp_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_fp_vehicles_location_id ON fp_vehicles(location_id);
CREATE INDEX IF NOT EXISTS idx_fp_sessions_vehicle_id ON fp_sessions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fp_sessions_status ON fp_sessions(status);
CREATE INDEX IF NOT EXISTS idx_fp_sessions_driver ON fp_sessions(driver_name);
CREATE INDEX IF NOT EXISTS idx_fp_sessions_checkout_time ON fp_sessions(checkout_time DESC);
CREATE INDEX IF NOT EXISTS idx_fp_damage_vehicle_id ON fp_damage_records(vehicle_id);
