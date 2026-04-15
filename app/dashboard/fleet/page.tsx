'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Car, Plus, ChevronRight, Loader2, QrCode } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { getVehicleTypeLabel } from '@/lib/utils'
import type { FPVehicle } from '@/types'

export default function FleetPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<FPVehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: locs } = await supabase.from('fp_locations').select('id').eq('user_id', user.id).limit(1)
      if (!locs || locs.length === 0) { setLoading(false); return }
      const { data } = await supabase.from('fp_vehicles').select('*').eq('location_id', locs[0].id).order('vehicle_number')
      setVehicles(data ?? [])
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-forest-800" /></div>

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-charcoal">Vehicles</h1>
        <Link href="/dashboard/fleet/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Vehicle
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="card text-center py-16">
          <Car className="w-12 h-12 text-charcoal-200 mx-auto mb-3" />
          <p className="text-charcoal-400 mb-4">No vehicles yet.</p>
          <Link href="/dashboard/fleet/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add First Vehicle
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {vehicles.map(v => (
            <Link key={v.id} href={`/dashboard/fleet/${v.id}`} className="card flex items-center justify-between hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  v.condition_status === 'good' ? 'bg-green-100 text-green-800' :
                  v.condition_status === 'minor_damage' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>{v.vehicle_number.slice(0, 2)}</div>
                <div>
                  <p className="font-semibold text-charcoal">{v.vehicle_number}</p>
                  <p className="text-sm text-charcoal-400">{getVehicleTypeLabel(v.vehicle_type)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  v.condition_status === 'good' ? 'badge-available' :
                  v.condition_status === 'minor_damage' ? 'badge-minor' : 'badge-needs-repair'
                }`}>
                  {v.condition_status === 'good' ? 'Good' : v.condition_status === 'minor_damage' ? 'Minor Damage' : 'Needs Repair'}
                </span>
                {v.qr_code && <QrCode className="w-4 h-4 text-charcoal-200 group-hover:text-forest-800 transition-colors" />}
                <ChevronRight className="w-4 h-4 text-charcoal-200 group-hover:text-forest-800 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
