import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { analyzeCondition } from '@/lib/anthropic'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { session_id, photos, vehicle_type, vehicle_number, phase, tow_metadata } = await request.json()
    if (!photos || photos.length === 0) return NextResponse.json({ error: 'No photos provided' }, { status: 400 })

    const report = await analyzeCondition(photos, vehicle_type ?? 'vehicle', vehicle_number ?? 'unknown', tow_metadata ?? null)

    // Save to session
    if (session_id && phase) {
      const field = phase === 'checkout' ? 'checkout_ai_report' : 'return_ai_report'
      await supabase.from('fp_sessions').update({ [field]: report }).eq('id', session_id)

      // If checkout phase and damage detected, flag it
      if (phase === 'checkout' && report.damage_visible && report.damage_visible.length > 0) {
        // Note existing damage but don't flag as damage_detected (that's for new damage on return)
      }
    }

    return NextResponse.json({ report })
  } catch (error) {
    console.error('analyze-condition error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
