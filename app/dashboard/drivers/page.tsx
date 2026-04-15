'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Loader2, AlertTriangle, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import type { FPSession } from '@/types'

interface DriverStats {
  name: string
  total: number
  withDamage: number
  cleanReturns: number
  totalCost: number
  lastSeen: string
}

export default function DriversPage() {
  const router = useRouter()
  const [drivers, setDrivers] = useState<DriverStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: locs } = await supabase.from('fp_locations').select('id').eq('user_id', user.id)
      const locIds = (locs ?? []).map((l: { id: string }) => l.id)
      if (locIds.length === 0) { setLoading(false); return }

      const { data: vehicles } = await supabase.from('fp_vehicles').select('id').in('location_id', locIds)
      const vehicleIds = (vehicles ?? []).map((v: { id: string }) => v.id)

      const { data: sessions } = await supabase
        .from('fp_sessions')
        .select('driver_name, damage_detected, damage_cost, checkout_time, status')
        .in('vehicle_id', vehicleIds)
        .eq('status', 'completed')
        .order('checkout_time', { ascending: false })

      const driverMap = new Map<string, DriverStats>()
      ;(sessions ?? []).forEach((s: Pick<FPSession, 'driver_name' | 'damage_detected' | 'damage_cost' | 'checkout_time'>) => {
        if (!driverMap.has(s.driver_name)) {
          driverMap.set(s.driver_name, { name: s.driver_name, total: 0, withDamage: 0, cleanReturns: 0, totalCost: 0, lastSeen: s.checkout_time })
        }
        const d = driverMap.get(s.driver_name)!
        d.total++
        if (s.damage_detected) { d.withDamage++; d.totalCost += s.damage_cost || 0 }
        else d.cleanReturns++
        if (s.checkout_time > d.lastSeen) d.lastSeen = s.checkout_time
      })

      const sorted = Array.from(driverMap.values()).sort((a, b) => b.withDamage - a.withDamage)
      setDrivers(sorted)
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-forest-800" /></div>

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold text-charcoal">Driver History</h1>
      <p className="text-charcoal-400 text-sm">Track damage incidents per driver. Sort by damage incidents to identify patterns.</p>

      {drivers.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="w-12 h-12 text-charcoal-200 mx-auto mb-3" />
          <p className="text-charcoal-400">Driver history will appear after completed sessions.</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-muted border-b border-surface-border text-left">
                <th className="px-4 py-3 text-charcoal-400 font-medium">Driver</th>
                <th className="px-4 py-3 text-charcoal-400 font-medium text-center">Sessions</th>
                <th className="px-4 py-3 text-charcoal-400 font-medium text-center">Damage</th>
                <th className="px-4 py-3 text-charcoal-400 font-medium text-center">Clean</th>
                <th className="px-4 py-3 text-charcoal-400 font-medium text-right">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d, i) => (
                <tr key={d.name} className={`border-t border-surface-border ${i % 2 === 0 ? 'bg-white' : 'bg-surface-muted'}`}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-charcoal">{d.name}</p>
                  </td>
                  <td className="px-4 py-3 text-center text-charcoal">{d.total}</td>
                  <td className="px-4 py-3 text-center">
                    {d.withDamage > 0 ? (
                      <span className="flex items-center justify-center gap-1 text-red-700 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {d.withDamage}
                      </span>
                    ) : (
                      <span className="text-charcoal-200">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="flex items-center justify-center gap-1 text-forest-800">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {d.cleanReturns}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {d.totalCost > 0 ? (
                      <span className="font-semibold text-red-700">{formatCurrency(d.totalCost)}</span>
                    ) : (
                      <span className="text-charcoal-200">$0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
