'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ClipboardList, Loader2, ChevronRight, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { formatDateTime, formatCurrency, duration } from '@/lib/utils'
import type { FPSession } from '@/types'

export default function SessionsPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<(FPSession & { vehicle_number?: string })[]>([])
  const [filtered, setFiltered] = useState<typeof sessions>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: locs } = await supabase.from('fp_locations').select('id').eq('user_id', user.id)
      const locIds = (locs ?? []).map((l: { id: string }) => l.id)
      if (locIds.length === 0) { setLoading(false); return }

      const { data: vehicles } = await supabase.from('fp_vehicles').select('id, vehicle_number').in('location_id', locIds)
      const vehicleMap = new Map<string, string>()
      ;(vehicles ?? []).forEach((v: { id: string; vehicle_number: string }) => vehicleMap.set(v.id, v.vehicle_number))

      const { data: sess } = await supabase
        .from('fp_sessions')
        .select('*')
        .in('vehicle_id', Array.from(vehicleMap.keys()))
        .order('checkout_time', { ascending: false })
        .limit(200)

      const enriched = (sess ?? []).map((s: FPSession) => ({ ...s, vehicle_number: vehicleMap.get(s.vehicle_id) ?? '?' }))
      setSessions(enriched)
      setFiltered(enriched)
      setLoading(false)
    }
    load()
  }, [router])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(sessions.filter(s =>
      s.driver_name.toLowerCase().includes(q) ||
      (s.vehicle_number ?? '').toLowerCase().includes(q)
    ))
  }, [search, sessions])

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-forest-800" /></div>

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold text-charcoal">Sessions</h1>

      {sessions.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
          <input className="input pl-9" placeholder="Search driver or vehicle..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <ClipboardList className="w-12 h-12 text-charcoal-200 mx-auto mb-3" />
          <p className="text-charcoal-400">No sessions yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(s => (
            <Link key={s.id} href={`/dashboard/sessions/${s.id}`} className="card flex items-center justify-between hover:shadow-md transition-shadow group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-charcoal">{s.vehicle_number}</span>
                  <span className="text-charcoal-400">·</span>
                  <span className="font-medium text-charcoal truncate">{s.driver_name}</span>
                </div>
                <p className="text-xs text-charcoal-400 mt-0.5">
                  {formatDateTime(s.checkout_time)}
                  {s.return_time ? ` — ${duration(s.checkout_time, s.return_time)}` : ' — in progress'}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                {s.damage_detected ? (
                  <span className="badge-needs-repair">Damage</span>
                ) : s.status === 'completed' ? (
                  <span className="badge-available">Clean</span>
                ) : (
                  <span className="badge-checked-out">Active</span>
                )}
                {s.damage_cost && <span className="text-sm font-semibold text-red-700">{formatCurrency(s.damage_cost)}</span>}
                <ChevronRight className="w-4 h-4 text-charcoal-200 group-hover:text-forest-800 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
