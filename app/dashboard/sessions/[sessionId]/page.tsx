'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, CheckCircle, Loader2, Download, Car, Edit2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { formatDateTime, formatCurrency, duration, getVehicleTypeLabel } from '@/lib/utils'
import { generateSessionReport } from '@/lib/pdf'
import type { FPVehicle, FPSession, FPLocation } from '@/types'

export default function SessionDetailPage() {
  const params = useParams()
  const sessionId = params.sessionId as string
  const router = useRouter()

  const [session, setSession] = useState<FPSession | null>(null)
  const [vehicle, setVehicle] = useState<FPVehicle | null>(null)
  const [location, setLocation] = useState<FPLocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingCost, setEditingCost] = useState(false)
  const [costValue, setCostValue] = useState('')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: sess } = await supabase.from('fp_sessions').select('*').eq('id', sessionId).single()
      if (!sess) { router.push('/dashboard/sessions'); return }
      setSession(sess)
      setCostValue(String(sess.damage_cost ?? ''))

      const [{ data: v }, ] = await Promise.all([
        supabase.from('fp_vehicles').select('*').eq('id', sess.vehicle_id).single(),
      ])
      setVehicle(v)
      if (v) {
        const { data: loc } = await supabase.from('fp_locations').select('*').eq('id', v.location_id).single()
        setLocation(loc)
      }
      setLoading(false)
    }
    load()
  }, [sessionId, router])

  async function saveCost() {
    const cost = parseFloat(costValue) || null
    const supabase = createClient()
    await supabase.from('fp_sessions').update({ damage_cost: cost }).eq('id', sessionId)
    setSession(prev => prev ? { ...prev, damage_cost: cost } : prev)
    setEditingCost(false)
  }

  async function handleExport() {
    if (!vehicle || !session || !location) return
    setExporting(true)
    try {
      const blob = generateSessionReport(vehicle, session, location.name)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `FleetProof-${vehicle.vehicle_number}-${sessionId.slice(0, 8)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) { console.error(err) }
    setExporting(false)
  }

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-forest-800" /></div>
  if (!session || !vehicle) return null

  const comparison = session.return_ai_report as {
    damage_detected?: boolean
    new_damage?: Array<{ location: string; severity: string; description: string; checkout_condition: string; return_condition: string }>
    unchanged?: string[]
    summary?: string
    attribution_statement?: string
  } | null

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
      <div>
        <Link href="/dashboard/sessions" className="text-charcoal-400 hover:text-charcoal flex items-center gap-1.5 text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Sessions
        </Link>

        <div className="card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Car className="w-5 h-5 text-charcoal-400" />
                <h1 className="text-xl font-bold text-charcoal">{vehicle.vehicle_number}</h1>
                <span className="text-charcoal-400">·</span>
                <span className="text-charcoal">{getVehicleTypeLabel(vehicle.vehicle_type)}</span>
              </div>
              <p className="text-lg font-semibold text-charcoal">{session.driver_name}</p>
              <p className="text-sm text-charcoal-400 mt-1">
                Checkout: {formatDateTime(session.checkout_time)}
                {session.return_time && ` → Return: ${formatDateTime(session.return_time)}`}
              </p>
              {session.return_time && (
                <p className="text-sm text-charcoal-400">Duration: {duration(session.checkout_time, session.return_time)}</p>
              )}
            </div>
            <div className="flex-shrink-0">
              {session.damage_detected ? (
                <div className="text-center">
                  <AlertTriangle className="w-10 h-10 text-red-600 mx-auto" />
                  <p className="text-xs font-semibold text-red-700 mt-1">Damage Found</p>
                </div>
              ) : session.status === 'completed' ? (
                <div className="text-center">
                  <CheckCircle className="w-10 h-10 text-forest-800 mx-auto" />
                  <p className="text-xs font-semibold text-forest-800 mt-1">Clean Return</p>
                </div>
              ) : (
                <span className="badge-checked-out">Active</span>
              )}
            </div>
          </div>

          {session.status === 'completed' && (
            <div className="mt-4 pt-4 border-t border-surface-border flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm text-charcoal-400">Damage cost:</span>
                {editingCost ? (
                  <div className="flex items-center gap-1">
                    <span className="text-charcoal-400">$</span>
                    <input type="number" className="input w-24 py-1 text-sm" value={costValue} onChange={e => setCostValue(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && saveCost()} />
                    <button onClick={saveCost} className="text-forest-800 hover:text-forest-700"><Check className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className={`font-semibold ${session.damage_cost ? 'text-red-700' : 'text-charcoal-400'}`}>
                      {session.damage_cost ? formatCurrency(session.damage_cost) : 'Not set'}
                    </span>
                    <button onClick={() => setEditingCost(true)} className="text-charcoal-200 hover:text-charcoal-400"><Edit2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>
              <button onClick={handleExport} disabled={exporting} className="btn-secondary text-sm flex items-center gap-1.5">
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Export PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI Attribution Statement */}
      {comparison?.attribution_statement && (
        <div className={`card border-2 ${session.damage_detected ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
          <p className="text-sm font-semibold text-charcoal mb-1">AI Finding</p>
          <p className={`font-medium ${session.damage_detected ? 'text-red-800' : 'text-forest-800'}`}>
            {comparison.attribution_statement}
          </p>
          {comparison.summary && <p className="text-sm text-charcoal-600 mt-2">{comparison.summary}</p>}
        </div>
      )}

      {/* New damage items */}
      {comparison?.new_damage && comparison.new_damage.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-charcoal mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            New Damage ({comparison.new_damage.length} item{comparison.new_damage.length !== 1 ? 's' : ''})
          </h2>
          <div className="space-y-2">
            {comparison.new_damage.map((dmg, i) => (
              <div key={i} className="card border-red-200">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge-${dmg.severity}`}>{dmg.severity}</span>
                      <span className="font-semibold text-charcoal">{dmg.location}</span>
                    </div>
                    <p className="text-sm text-charcoal-600">{dmg.description}</p>
                    <p className="text-xs text-charcoal-400 mt-1">
                      Before: {dmg.checkout_condition} → After: {dmg.return_condition}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unchanged areas */}
      {comparison?.unchanged && comparison.unchanged.length > 0 && (
        <div className="card bg-green-50 border-green-200">
          <p className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" /> Confirmed Unchanged
          </p>
          <p className="text-sm text-green-700">{comparison.unchanged.join(' · ')}</p>
        </div>
      )}

      {/* Photo pairs */}
      {session.checkout_photos.length > 0 && session.return_photos && session.return_photos.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-charcoal mb-3">Before / After Photos</h2>
          <div className="space-y-3">
            {['Front', 'Back', 'Left', 'Right'].map((pos, i) => (
              session.checkout_photos[i] || (session.return_photos && session.return_photos[i]) ? (
                <div key={pos}>
                  <p className="text-xs font-semibold text-charcoal-400 uppercase mb-1.5">{pos}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {session.checkout_photos[i] && (
                      <div>
                        <p className="text-xs text-charcoal-400 mb-1">Checkout</p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={session.checkout_photos[i]} alt={`${pos} checkout`} className="w-full aspect-video object-cover rounded-lg border border-surface-border" />
                      </div>
                    )}
                    {session.return_photos && session.return_photos[i] && (
                      <div>
                        <p className="text-xs text-charcoal-400 mb-1">Return</p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={session.return_photos[i]} alt={`${pos} return`} className="w-full aspect-video object-cover rounded-lg border border-surface-border" />
                      </div>
                    )}
                  </div>
                </div>
              ) : null
            ))}
          </div>
        </div>
      )}

      {/* Still active — prompt for return */}
      {session.status === 'active' && (
        <div className="card border-blue-200 bg-blue-50 text-center">
          <p className="font-semibold text-blue-800 mb-2">Session In Progress</p>
          <Link href={`/dashboard/return/${vehicle.id}`} className="btn-primary bg-orange-600 hover:bg-orange-700 inline-flex items-center gap-2">
            Process Return
          </Link>
        </div>
      )}
    </div>
  )
}
