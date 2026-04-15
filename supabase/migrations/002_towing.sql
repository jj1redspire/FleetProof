-- FleetProof Migration 002: Towing Vertical
-- Run in Supabase SQL Editor AFTER 001_initial.sql

-- ============================================================
-- 1. Add towing business types to fp_locations
-- ============================================================
-- Drop and recreate the business_type constraint to include towing types
ALTER TABLE fp_locations
  DROP CONSTRAINT IF EXISTS fp_locations_business_type_check;

ALTER TABLE fp_locations
  ADD CONSTRAINT fp_locations_business_type_check
  CHECK (business_type IN (
    'golf_course', 'resort', 'community', 'university', 'hotel',
    'towing_company', 'repo_recovery',
    'other'
  ));

-- ============================================================
-- 2. Add tow_metadata JSONB column to fp_sessions
-- ============================================================
-- Stores all tow-specific fields without altering core schema:
-- {
--   tow_reason: 'roadside' | 'accident' | 'police_impound' | 'repo' | 'parking_violation',
--   vehicle_plate: string,
--   vehicle_vin: string,
--   keys_status: 'with_owner' | 'in_ignition' | 'not_available',
--   hook_up_point: string,
--   plate_photo: string | null,    -- base64
--   vin_photo: string | null,      -- base64
--   hook_up_photo: string | null,  -- base64
--   witness_name: string | null,
--   witness_signature: string | null,  -- base64 PNG
--   police_report_number: string | null
-- }

ALTER TABLE fp_sessions
  ADD COLUMN IF NOT EXISTS tow_metadata JSONB DEFAULT NULL;

-- Index for querying tow sessions by reason or plate
CREATE INDEX IF NOT EXISTS idx_fp_sessions_tow_metadata
  ON fp_sessions USING gin(tow_metadata)
  WHERE tow_metadata IS NOT NULL;

-- ============================================================
-- 3. Helper view: tow sessions with key fields extracted
-- ============================================================
CREATE OR REPLACE VIEW fp_tow_sessions AS
SELECT
  s.id,
  s.vehicle_id,
  s.driver_name,
  s.checkout_time,
  s.return_time,
  s.damage_detected,
  s.damage_cost,
  s.status,
  s.tow_metadata->>'tow_reason'           AS tow_reason,
  s.tow_metadata->>'vehicle_plate'         AS vehicle_plate,
  s.tow_metadata->>'vehicle_vin'           AS vehicle_vin,
  s.tow_metadata->>'keys_status'           AS keys_status,
  s.tow_metadata->>'witness_name'          AS witness_name,
  s.tow_metadata->>'police_report_number'  AS police_report_number,
  (s.tow_metadata->>'witness_signature') IS NOT NULL AS has_witness_signature,
  s.created_at
FROM fp_sessions s
WHERE s.tow_metadata IS NOT NULL;

-- RLS: view inherits table RLS automatically
