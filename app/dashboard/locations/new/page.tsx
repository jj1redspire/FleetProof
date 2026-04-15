'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase'

const BUSINESS_TYPES = [
  { value: 'golf_course', label: 'Golf Course / Country Club' },
  { value: 'resort', label: 'Resort / Hotel' },
  { value: 'community', label: 'Retirement / Residential Community' },
  { value: 'university', label: 'University / Campus' },
  { value: 'hotel', label: 'Hotel / Airport Shuttle' },
  { value: 'other', label: 'Other' },
]

export default function NewLocationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', address: '', business_type: 'golf_course' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { error: err } = await supabase.from('fp_locations').insert({
      user_id: user.id,
      name: form.name.trim(),
      address: form.address.trim() || null,
      business_type: form.business_type,
    })

    if (err) { setError(err.message); setLoading(false) }
    else router.push('/dashboard/fleet/new')
  }

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto space-y-5">
      <div>
        <Link href="/dashboard" className="text-charcoal-400 hover:text-charcoal flex items-center gap-1.5 text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-charcoal">Add Location</h1>
        <p className="text-charcoal-400 text-sm mt-1">Your fleet base of operations</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label">Organization / Location Name</label>
          <input type="text" className="input" placeholder="Pebble Beach Golf Links" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Address <span className="text-charcoal-200">(optional)</span></label>
          <input type="text" className="input" placeholder="1700 17-Mile Drive, Pebble Beach, CA" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
        </div>
        <div>
          <label className="label">Business Type</label>
          <select className="input" value={form.business_type} onChange={e => setForm(f => ({ ...f, business_type: e.target.value }))}>
            {BUSINESS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Creating...' : 'Create Location → Add Vehicles'}
        </button>
      </form>
    </div>
  )
}
