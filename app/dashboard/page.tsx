'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Car, Loader2, Clock, CheckCircle, AlertTriangle, QrCode } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { cn, formatTime, getVehicleTypeLabel } from '@/lib/utils'
import type { FPVehicle, FPSession } from '@/types'

interface VehicleWithSession extends FPVehicle {
  active_session?: FPSession
}

export default function FleetDashboard() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<VehicleWithSession[]>([])
  const [loading, setLoading] = useState(true)
  const [locationId, setLocationId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      // Get first location
      const { data: locs } = await supabase.from('fp_locations').select('id').eq('user_id', user.id).limit(1)
      if (!locs || locs.length === 0) { setLoading(false); return }
      const locId = locs[0].id
      setLocationId(locId)

      // Get vehicles + active sessions
      const { data: veh } = await supabase
        .from('fp_vehicles')
        .select('*')
        .eq('location_id', locId)
        .order('vehicle_number')

      const { data: sessions } = await supabase
        .from('fp_sessions')
        .select('*')
        .eq('status', 'active')
        .in('vehicle_id', (veh ?? []).map((v: FPVehicle) => v.id))

      const sessionMap = new Map<string, FPSession>()
      ;(sessions ?? []).forEach((s: FPSession) => sessionMap.set(s.vehicle_id, s))

      setVehicles((veh ?? []).map((v: FPVehicle) => ({ ...v, active_session: sessionMap.get(v.id) })))
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-forest-800" /></div>

  if (!locationId) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="card text-center py-16">
          <Car className="w-14 h-14 text-forest-800 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-charcoal mb-2">Set Up Your Fleet</h2>
          <p className="text-charcoal-400 mb-6">Add your location and vehicles to get started.</p>
          <Link href="/dashboard/locations/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Location
          </Link>
        </div>
      </div>
    )
  }

  const checkedOut = vehicles.filter(v => v.active_session)
  const available = vehicles.filter(v => !v.active_session && v.condition_status === 'good')
  const needsRepair = vehicles.filter(v => v.condition_status === 'needs_repair')
  const minorDamage = vehicles.filter(v => !v.active_session && v.condition_status === 'minor_damage')

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Fleet Dashboard</h1>
          <p className="text-charcoal-400 text-sm mt-0.5">{vehicles.length} vehicles total</p>
        </div>
        <Link href="/dashboard/fleet/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /><span className="hidden sm:inline">Add Vehicle</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Available', value: available.length, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
          { label: 'Checked Out', value: checkedOut.length, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
          { label: 'Minor Damage', value: minorDamage.length, color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
          { label: 'Needs Repair', value: needsRepair.length, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
        ].map(s => (
          <div key={s.label} className={`card border ${s.bg} text-center`}>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-charcoal-600 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Vehicle grid */}
      {vehicles.length === 0 ? (
        <div className="card text-center py-12">
          <Car className="w-12 h-12 text-charcoal-200 mx-auto mb-3" />
          <p className="text-charcoal-400 mb-4">No vehicles yet. Add your first vehicle to get started.</p>
          <Link href="/dashboard/fleet/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Vehicle
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {vehicles.map(vehicle => {
            const session = vehicle.active_session
            const isOut = !!session
            const condColor = vehicle.condition_status === 'good' ? 'border-green-200 bg-green-50'
              : vehicle.condition_status === 'minor_damage' ? 'border-yellow-200 bg-yellow-50'
              : 'border-red-200 bg-red-50'

            return (
              <div
                key={vehicle.id}
                className={cn(
                  'card border-2 cursor-pointer hover:shadow-md transition-shadow p-3',
                  isOut ? 'border-blue-300 bg-blue-50' : condColor
                )}
              >
                {/* Vehicle number */}
                <div className="text-center mb-2">
                  <p className="text-xl font-bold text-charcoal leading-tight">{vehicle.vehicle_number}</p>
                  <p className="text-xs text-charcoal-400">{getVehicleTypeLabel(vehicle.vehicle_type)}</p>
                </div>

                {/* Status */}
                {isOut ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-blue-700">
                      <Clock className="w-3 h-3" />
                      <span className="truncate font-medium">{session.driver_name}</span>
                    </div>
                    <p className="text-xs text-charcoal-400">Since {formatTime(session.checkout_time)}</p>
                  </div>
                ) : vehicle.condition_status === 'good' ? (
                  <div className="flex items-center gap-1 text-xs text-green-700">
                    <CheckCircle className="w-3 h-3" />
                    <span>Available</span>
                  </div>
                ) : vehicle.condition_status === 'minor_damage' ? (
                  <div className="flex items-center gap-1 text-xs text-yellow-700">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Minor damage</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-red-700">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Needs repair</span>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-2 space-y-1">
                  {!isOut ? (
                    <Link
                      href={`/dashboard/checkout/${vehicle.id}`}
                      className="block w-full text-center text-xs font-semibold bg-forest-800 hover:bg-forest-700 text-white py-1.5 rounded-md transition-colors"
                    >
                      Checkout
                    </Link>
                  ) : (
                    <Link
                      href={`/dashboard/return/${vehicle.id}`}
                      className="block w-full text-center text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white py-1.5 rounded-md transition-colors"
                    >
                      Return
                    </Link>
                  )}
                  <Link
                    href={`/dashboard/fleet/${vehicle.id}`}
                    className="block w-full text-center text-xs text-charcoal-400 hover:text-charcoal py-1 flex items-center justify-center gap-1"
                  >
                    <QrCode className="w-3 h-3" /> Details
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
