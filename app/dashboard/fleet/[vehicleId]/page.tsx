'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, QrCode, Printer, Car, Clock, AlertTriangle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { formatDateTime, getVehicleTypeLabel, formatCurrency } from '@/lib/utils'
import type { FPVehicle, FPSession, FPDamageRecord } from '@/types'

export default function VehicleDetailPage() {
  const params = useParams()
  const vehicleId = params.vehicleId as string
  const router = useRouter()

  const [vehicle, setVehicle] = useState<FPVehicle | null>(null)
  const [sessions, setSessions] = useState<FPSession[]>([])
  const [damages, setDamages] = useState<FPDamageRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSession, setActiveSession] = useState<FPSession | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const [{ data: v }, { data: sess }, { data: dmg }] = await Promise.all([
        supabase.from('fp_vehicles').select('*').eq('id', vehicleId).single(),
        supabase.from('fp_sessions').select('*').eq('vehicle_id', vehicleId).order('checkout_time', { ascending: false }).limit(50),
        supabase.from('fp_damage_records').select('*').eq('vehicle_id', vehicleId).order('created_at', { ascending: false }),
      ])

      setVehicle(v)
      setSessions(sess ?? [])
      setDamages(dmg ?? [])
      setActiveSession((sess ?? []).find((s: FPSession) => s.status === 'active') ?? null)
      setLoading(false)
    }
    load()
  }, [vehicleId, router])

  function printQR() {
    const win = window.open('', '_blank')
    if (!win || !vehicle?.qr_code) return
    win.document.write(`
      <html><body style="text-align:center;padding:20px;font-family:sans-serif">
      <h2 style="font-size:32px;margin-bottom:8px">${vehicle.vehicle_number}</h2>
      <p style="color:#666;margin-bottom:16px">${getVehicleTypeLabel(vehicle.vehicle_type)}</p>
      <img src="${vehicle.qr_code}" width="250" height="250" />
      <p style="margin-top:12px;font-size:14px;color:#666">Scan to checkout/return</p>
      <p style="font-size:12px;color:#999">FleetProof — fleetproof.io</p>
      </body></html>
    `)
    win.document.close()
    win.print()
  }

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-forest-800" /></div>
  if (!vehicle) return null

  const totalDamageCost = damages.reduce((s, d) => s + (d.repair_cost || 0), 0)

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
      <div>
        <Link href="/dashboard/fleet" className="text-charcoal-400 hover:text-charcoal flex items-center gap-1.5 text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Vehicles
        </Link>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-charcoal">{vehicle.vehicle_number}</h1>
              <p className="text-charcoal-400 mt-1">{getVehicleTypeLabel(vehicle.vehicle_type)}</p>
            </div>
            <div className="text-right">
              <span className={`text-sm px-3 py-1.5 rounded-full font-semibold ${
                vehicle.condition_status === 'good' ? 'badge-available' :
                vehicle.condition_status === 'minor_damage' ? 'badge-minor' : 'badge-needs-repair'
              }`}>
                {vehicle.condition_status === 'good' ? 'Good Condition' :
                 vehicle.condition_status === 'minor_damage' ? 'Minor Damage' : 'Needs Repair'}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-surface-border flex flex-wrap gap-4 text-sm">
            <span className="text-charcoal-400">Sessions: <span className="font-medium text-charcoal">{sessions.length}</span></span>
            <span className="text-charcoal-400">Damage incidents: <span className="font-medium text-charcoal">{damages.length}</span></span>
            {totalDamageCost > 0 && (
              <span className="text-charcoal-400">Total damage cost: <span className="font-medium text-red-700">{formatCurrency(totalDamageCost)}</span></span>
            )}
          </div>

          <div className="mt-4 flex gap-2 flex-wrap">
            {activeSession ? (
              <Link href={`/dashboard/return/${vehicle.id}`} className="btn-danger flex items-center gap-2">
                <Car className="w-4 h-4" /> Process Return
              </Link>
            ) : (
              <Link href={`/dashboard/checkout/${vehicle.id}`} className="btn-primary flex items-center gap-2">
                <Car className="w-4 h-4" /> Checkout Vehicle
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* QR Code */}
      {vehicle.qr_code && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-forest-800" />
              <h2 className="font-semibold text-charcoal">QR Code Sticker</h2>
            </div>
            <button onClick={printQR} className="btn-secondary text-sm flex items-center gap-1.5">
              <Printer className="w-4 h-4" /> Print
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={vehicle.qr_code} alt="Vehicle QR Code" className="w-32 h-32 border border-surface-border rounded-lg" />
            <div className="text-sm text-charcoal-400 space-y-1.5">
              <p>1. Click <strong>Print</strong> to print this sticker</p>
              <p>2. Laminate for weather resistance</p>
              <p>3. Attach to the vehicle (dashboard or frame)</p>
              <p>4. Attendants scan to start checkout instantly</p>
            </div>
          </div>
        </div>
      )}

      {/* Active session alert */}
      {activeSession && (
        <div className="card border-blue-200 bg-blue-50">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-800">Currently Checked Out</p>
              <p className="text-sm text-blue-700 mt-0.5">
                {activeSession.driver_name} — since {formatDateTime(activeSession.checkout_time)}
              </p>
              <Link href={`/dashboard/return/${vehicle.id}`} className="text-sm text-blue-800 font-medium underline mt-2 inline-block">
                Process Return →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Damage records */}
      {damages.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-charcoal mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            Damage History ({damages.length})
          </h2>
          <div className="space-y-2">
            {damages.map(d => (
              <div key={d.id} className="card border-red-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-charcoal">{d.description}</p>
                    <p className="text-xs text-charcoal-400 mt-1">{formatDateTime(d.created_at)}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium badge-${d.severity}`}>{d.severity}</span>
                    {d.repair_cost && <p className="text-sm font-semibold text-red-700 mt-1">{formatCurrency(d.repair_cost)}</p>}
                    <p className={`text-xs mt-0.5 ${d.repair_status === 'completed' ? 'text-green-700' : 'text-charcoal-400'}`}>
                      {d.repair_status}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session history */}
      <div>
        <h2 className="text-lg font-semibold text-charcoal mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-charcoal-400" />
          Session History ({sessions.length})
        </h2>
        {sessions.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-charcoal-400">No sessions yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map(s => (
              <Link key={s.id} href={`/dashboard/sessions/${s.id}`} className="card flex items-center justify-between hover:shadow-md transition-shadow group">
                <div>
                  <p className="font-medium text-charcoal">{s.driver_name}</p>
                  <p className="text-xs text-charcoal-400 mt-0.5">{formatDateTime(s.checkout_time)}{s.return_time ? ` → ${formatDateTime(s.return_time)}` : ' — in progress'}</p>
                </div>
                <div className="flex items-center gap-2">
                  {s.damage_detected ? (
                    <span className="badge-needs-repair">Damage</span>
                  ) : s.status === 'completed' ? (
                    <span className="badge-available">Clean</span>
                  ) : (
                    <span className="badge-checked-out">Active</span>
                  )}
                  {s.damage_cost && <span className="text-sm font-semibold text-red-700">{formatCurrency(s.damage_cost)}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
