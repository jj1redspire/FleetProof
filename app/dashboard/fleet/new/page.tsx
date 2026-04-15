'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { generateVehicleQR } from '@/lib/qr'

const VEHICLE_TYPES = [
  { value: 'golf_cart', label: 'Golf Cart' },
  { value: 'lsv', label: 'LSV (Low Speed Vehicle)' },
  { value: 'shuttle', label: 'Shuttle / Van' },
  { value: 'utility', label: 'Utility Vehicle' },
  { value: 'bicycle', label: 'Bicycle' },
  { value: 'scooter', label: 'Scooter' },
  { value: 'other', label: 'Other' },
]

export default function NewVehiclePage() {
  const router = useRouter()
  const [locationId, setLocationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingLoc, setLoadingLoc] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ vehicle_number: '', vehicle_type: 'golf_cart' })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: locs } = await supabase.from('fp_locations').select('id').eq('user_id', user.id).limit(1)
      setLocationId(locs?.[0]?.id ?? null)
      setLoadingLoc(false)
    }
    load()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!locationId) { setError('No location found. Please add a location first.'); return }
    setLoading(true)
    setError('')

    const supabase = createClient()

    // Insert vehicle first to get ID
    const { data: vehicle, error: insertErr } = await supabase
      .from('fp_vehicles')
      .insert({
        location_id: locationId,
        vehicle_number: form.vehicle_number.trim(),
        vehicle_type: form.vehicle_type,
        condition_status: 'good',
        initial_photos: [],
      })
      .select()
      .single()

    if (insertErr || !vehicle) { setError(insertErr?.message ?? 'Failed to create vehicle'); setLoading(false); return }

    // Generate QR code
    try {
      const qrCode = await generateVehicleQR(vehicle.id)
      await supabase.from('fp_vehicles').update({ qr_code: qrCode }).eq('id', vehicle.id)
    } catch { /* QR generation is best-effort */ }

    router.push(`/dashboard/fleet/${vehicle.id}`)
  }

  if (loadingLoc) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-forest-800" /></div>

  if (!locationId) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <div className="card text-center py-12">
          <p className="text-charcoal-400 mb-4">Please add a location first.</p>
          <Link href="/dashboard/locations/new" className="btn-primary inline-block">Add Location</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto space-y-5">
      <div>
        <Link href="/dashboard/fleet" className="text-charcoal-400 hover:text-charcoal flex items-center gap-1.5 text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Vehicles
        </Link>
        <h1 className="text-2xl font-bold text-charcoal">Add Vehicle</h1>
        <p className="text-charcoal-400 text-sm mt-1">A QR code sticker will be generated automatically</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label">Vehicle Number / ID</label>
          <input
            type="text"
            className="input text-2xl font-bold tracking-wider"
            placeholder="Cart #47 or GPL-102"
            value={form.vehicle_number}
            onChange={e => setForm(f => ({ ...f, vehicle_number: e.target.value }))}
            required
          />
          <p className="text-charcoal-400 text-xs mt-1">This is what appears on the fleet grid. Make it easy to read at a glance.</p>
        </div>

        <div>
          <label className="label">Vehicle Type</label>
          <select className="input" value={form.vehicle_type} onChange={e => setForm(f => ({ ...f, vehicle_type: e.target.value }))}>
            {VEHICLE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div className="bg-forest-50 border border-forest-100 rounded-lg p-3">
          <p className="text-xs text-forest-800 font-medium">After adding this vehicle:</p>
          <ol className="text-xs text-charcoal-600 mt-1.5 space-y-1 list-decimal list-inside">
            <li>Open the vehicle detail page</li>
            <li>Print the QR code sticker</li>
            <li>Laminate and attach to the vehicle</li>
            <li>Attendants scan it to start checkout in 15 seconds</li>
          </ol>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Generating QR & Adding...' : 'Add Vehicle'}
        </button>
      </form>
    </div>
  )
}
