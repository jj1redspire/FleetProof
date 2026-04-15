'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Loader2, Download, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { FPSession } from '@/types'

export default function ReportsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0])
  const [sessions, setSessions] = useState<(FPSession & { vehicle_number?: string })[]>([])
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setLoading(false)
    }
    load()
  }, [router])

  async function loadShiftData() {
    setGenerating(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: locs } = await supabase.from('fp_locations').select('id').eq('user_id', user.id)
    const locIds = (locs ?? []).map((l: { id: string }) => l.id)
    const { data: vehicles } = await supabase.from('fp_vehicles').select('id, vehicle_number').in('location_id', locIds)
    const vehicleMap = new Map<string, string>()
    ;(vehicles ?? []).forEach((v: { id: string; vehicle_number: string }) => vehicleMap.set(v.id, v.vehicle_number))

    const start = `${reportDate}T00:00:00`
    const end = `${reportDate}T23:59:59`
    const { data: sess } = await supabase
      .from('fp_sessions')
      .select('*')
      .in('vehicle_id', Array.from(vehicleMap.keys()))
      .gte('checkout_time', start)
      .lte('checkout_time', end)
      .order('checkout_time')

    setSessions((sess ?? []).map((s: FPSession) => ({ ...s, vehicle_number: vehicleMap.get(s.vehicle_id) ?? '?' })))
    setGenerating(false)
  }

  function downloadShiftCSV() {
    const headers = ['Vehicle', 'Driver', 'Checkout', 'Return', 'Duration', 'Damage', 'Cost']
    const rows = sessions.map(s => [
      s.vehicle_number ?? '',
      s.driver_name,
      s.checkout_time,
      s.return_time ?? 'Active',
      s.return_time ? Math.round((new Date(s.return_time).getTime() - new Date(s.checkout_time).getTime()) / 60000) + 'min' : 'Active',
      s.damage_detected ? 'Yes' : 'No',
      s.damage_cost ? `$${s.damage_cost}` : '$0',
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `FleetProof-Shift-${reportDate}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-forest-800" /></div>

  const totalSessions = sessions.length
  const damageCount = sessions.filter(s => s.damage_detected).length
  const totalCost = sessions.reduce((sum, s) => sum + (s.damage_cost || 0), 0)
  const stillOut = sessions.filter(s => s.status === 'active').length

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-charcoal">Reports</h1>

      {/* Shift Summary */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-forest-800" />
          <h2 className="text-lg font-semibold text-charcoal">Shift Summary</h2>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1">
            <label className="label">Date</label>
            <input type="date" className="input" value={reportDate} onChange={e => setReportDate(e.target.value)} />
          </div>
          <div className="flex items-end">
            <button onClick={loadShiftData} disabled={generating} className="btn-primary flex items-center gap-2">
              {generating && <Loader2 className="w-4 h-4 animate-spin" />}
              {generating ? 'Loading...' : 'Load Report'}
            </button>
          </div>
        </div>

        {sessions.length > 0 && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {[
                { label: 'Total Sessions', value: totalSessions, color: 'text-charcoal' },
                { label: 'Damage Incidents', value: damageCount, color: 'text-red-700' },
                { label: 'Still Out', value: stillOut, color: 'text-blue-700' },
                { label: 'Damage Cost', value: formatCurrency(totalCost), color: 'text-red-700' },
              ].map(s => (
                <div key={s.label} className="bg-surface-muted rounded-lg p-3 text-center">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-charcoal-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-charcoal">Shift: {formatDate(reportDate)}</p>
              <button onClick={downloadShiftCSV} className="btn-secondary text-sm flex items-center gap-1.5">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border text-left">
                    <th className="pb-2 text-charcoal-400 font-medium">Vehicle</th>
                    <th className="pb-2 text-charcoal-400 font-medium">Driver</th>
                    <th className="pb-2 text-charcoal-400 font-medium">Checkout</th>
                    <th className="pb-2 text-charcoal-400 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(s => (
                    <tr key={s.id} className="border-t border-surface-border">
                      <td className="py-2 font-semibold text-charcoal">{s.vehicle_number}</td>
                      <td className="py-2 text-charcoal">{s.driver_name}</td>
                      <td className="py-2 text-charcoal-400 text-xs">{new Date(s.checkout_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</td>
                      <td className="py-2">
                        {s.damage_detected ? <span className="badge-needs-repair">Damage</span> :
                         s.status === 'active' ? <span className="badge-checked-out">Active</span> :
                         <span className="badge-available">Clean</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Insurance export info */}
      <div className="card">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-forest-800 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="font-semibold text-charcoal">Vehicle Insurance Reports</h2>
            <p className="text-sm text-charcoal-400 mt-1">
              Full damage history reports per vehicle are available from the Vehicle detail page.
              Go to <strong>Vehicles → [vehicle] → Export Insurance Report</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
