import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { compareSession } from '@/lib/anthropic'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const {
      session_id,
      checkout_photos,
      return_photos,
      vehicle_type,
      vehicle_number,
      driver_name,
      checkout_time,
      return_time,
    } = await request.json()

    if (!checkout_photos?.length || !return_photos?.length) {
      return NextResponse.json({ error: 'Both checkout and return photos required' }, { status: 400 })
    }

    const result = await compareSession(
      checkout_photos,
      return_photos,
      vehicle_type ?? 'vehicle',
      vehicle_number ?? 'unknown',
      driver_name ?? 'driver',
      checkout_time ? new Date(checkout_time).toLocaleString() : 'checkout',
      return_time ? new Date(return_time).toLocaleString() : 'return'
    )

    // Update session with comparison results
    if (session_id) {
      await supabase.from('fp_sessions').update({
        return_ai_report: result,
        damage_detected: result.damage_detected,
        damage_items: { new_damage: result.new_damage, unchanged: result.unchanged },
      }).eq('id', session_id)

      // Create damage records for each new damage item
      if (result.damage_detected && result.new_damage.length > 0) {
        // Get vehicle_id from session
        const { data: sess } = await supabase.from('fp_sessions').select('vehicle_id').eq('id', session_id).single()
        if (sess) {
          const damageRows = result.new_damage.map(dmg => ({
            vehicle_id: sess.vehicle_id,
            session_id,
            description: `${dmg.location}: ${dmg.description}`,
            severity: dmg.severity,
            photos: [],
            repair_status: 'open' as const,
          }))
          await supabase.from('fp_damage_records').insert(damageRows)

          // Update vehicle condition status
          const worstSeverity = result.new_damage.reduce((worst, d) => {
            if (d.severity === 'major') return 'needs_repair'
            if (d.severity === 'moderate' && worst !== 'needs_repair') return 'minor_damage'
            if (worst === 'good') return 'minor_damage'
            return worst
          }, 'good' as string)

          await supabase.from('fp_vehicles').update({ condition_status: worstSeverity }).eq('id', sess.vehicle_id)
        }
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('compare-session error:', error)
    return NextResponse.json({ error: 'Comparison failed' }, { status: 500 })
  }
}
