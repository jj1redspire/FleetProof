'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Loader2, Mic, MicOff } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { getVehicleTypeLabel } from '@/lib/utils'
import RapidPhotoCapture from '@/components/checkout/RapidPhotoCapture'
import type { FPVehicle } from '@/types'

type Step = 'driver' | 'photos' | 'voice' | 'done'

export default function CheckoutPage() {
  const params = useParams()
  const vehicleId = params.vehicleId as string
  const router = useRouter()

  const [vehicle, setVehicle] = useState<FPVehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<Step>('driver')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [driverName, setDriverName] = useState('')
  const [mileage, setMileage] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [voiceNote, setVoiceNote] = useState('')
  const [recording, setRecording] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)
  const driverInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: v } = await supabase.from('fp_vehicles').select('*').eq('id', vehicleId).single()
      if (!v) { router.push('/dashboard'); return }
      setVehicle(v)

      // Check for existing active session
      const { data: existing } = await supabase.from('fp_sessions').select('id').eq('vehicle_id', vehicleId).eq('status', 'active').single()
      if (existing) {
        router.push(`/dashboard/return/${vehicleId}`)
        return
      }

      // Pre-fill driver name from localStorage
      const savedName = localStorage.getItem('fp_last_driver') ?? ''
      setDriverName(savedName)
      setLoading(false)
      setTimeout(() => driverInputRef.current?.focus(), 100)
    }
    load()
  }, [vehicleId, router])

  function handleDriverSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!driverName.trim()) return
    localStorage.setItem('fp_last_driver', driverName.trim())
    setStep('photos')
  }

  function handlePhotosComplete(capturedPhotos: string[]) {
    setPhotos(capturedPhotos)
    setStep('voice')
  }

  function startVoice() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition
    if (!SR) { handleCheckout(); return }
    const recognition = new SR()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'
    let finalText = ''
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => { finalText = e.results[0][0].transcript }
    recognition.onend = () => { setVoiceNote(finalText); setRecording(false) }
    recognition.start()
    recognitionRef.current = recognition
    setRecording(true)
  }

  function stopVoice() {
    recognitionRef.current?.stop()
    setRecording(false)
  }

  async function handleCheckout() {
    setSaving(true)
    setError('')
    const supabase = createClient()

    const { data: session, error: sessionErr } = await supabase
      .from('fp_sessions')
      .insert({
        vehicle_id: vehicleId,
        driver_name: driverName.trim(),
        checkout_time: new Date().toISOString(),
        checkout_photos: photos,
        checkout_voice: voiceNote || null,
        status: 'active',
        damage_detected: false,
        damage_items: null,
      })
      .select()
      .single()

    if (sessionErr || !session) {
      setError(sessionErr?.message ?? 'Failed to create session')
      setSaving(false)
      return
    }

    setSessionId(session.id)

    // Trigger background AI analysis (don't await — keep it fast)
    fetch('/api/ai/analyze-condition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: session.id,
        photos,
        vehicle_type: vehicle?.vehicle_type,
        vehicle_number: vehicle?.vehicle_number,
        phase: 'checkout',
      }),
    }).catch(() => { /* best effort */ })

    setStep('done')
    setSaving(false)
  }

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-forest-800" /></div>
  if (!vehicle) return null

  return (
    <div className="min-h-screen bg-surface-muted">
      {/* Top bar */}
      <div className="bg-white border-b border-surface-border px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="text-charcoal-400 hover:text-charcoal flex items-center gap-1.5 text-sm">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <div className="text-center">
          <p className="font-bold text-charcoal">{vehicle.vehicle_number}</p>
          <p className="text-xs text-charcoal-400">{getVehicleTypeLabel(vehicle.vehicle_type)}</p>
        </div>
        <div className="w-20 text-right">
          <span className="text-xs font-semibold text-forest-800 bg-forest-50 px-2 py-1 rounded">CHECKOUT</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">

        {/* STEP: Driver name */}
        {step === 'driver' && (
          <div className="card mt-4">
            <h2 className="text-xl font-bold text-charcoal mb-4">Who is taking this vehicle?</h2>
            <form onSubmit={handleDriverSubmit} className="space-y-4">
              <div>
                <input
                  ref={driverInputRef}
                  type="text"
                  className="input text-xl py-4"
                  placeholder="Driver name"
                  value={driverName}
                  onChange={e => setDriverName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="label">Mileage / Hours <span className="text-charcoal-200">(optional)</span></label>
                <input
                  type="number"
                  className="input"
                  placeholder="Current odometer or hour meter"
                  value={mileage}
                  onChange={e => setMileage(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary w-full py-4 text-lg">
                Next: Take 4 Photos →
              </button>
            </form>
          </div>
        )}

        {/* STEP: Photos */}
        {step === 'photos' && (
          <div className="mt-4">
            <div className="mb-4 text-center">
              <h2 className="text-xl font-bold text-charcoal">4 Quick Photos</h2>
              <p className="text-charcoal-400 text-sm mt-1">Front → Back → Left → Right. Tap each once.</p>
            </div>
            <RapidPhotoCapture onComplete={handlePhotosComplete} />
          </div>
        )}

        {/* STEP: Voice note (optional) */}
        {step === 'voice' && (
          <div className="card mt-4">
            <h2 className="text-xl font-bold text-charcoal mb-2">Note Anything?</h2>
            <p className="text-charcoal-400 text-sm mb-4">Optional — existing damage, items left in cart, etc.</p>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">{error}</div>}

            <div className="space-y-3">
              {/* Voice or text */}
              <textarea
                className="input h-20 resize-none"
                placeholder="Type a note, or use voice below..."
                value={voiceNote}
                onChange={e => setVoiceNote(e.target.value)}
              />

              <div className="flex gap-2">
                {!recording ? (
                  <button onClick={startVoice} className="btn-secondary flex items-center gap-2 flex-1">
                    <Mic className="w-4 h-4" /> Voice Note
                  </button>
                ) : (
                  <button onClick={stopVoice} className="btn-secondary flex items-center gap-2 flex-1 text-red-600 border-red-200 animate-pulse">
                    <MicOff className="w-4 h-4" /> Stop Recording
                  </button>
                )}
              </div>

              <button
                onClick={handleCheckout}
                disabled={saving}
                className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                {saving ? 'Checking Out...' : 'Complete Checkout'}
              </button>

              <button onClick={handleCheckout} disabled={saving} className="w-full text-center text-charcoal-400 text-sm py-2">
                Skip note — checkout now
              </button>
            </div>
          </div>
        )}

        {/* STEP: Done */}
        {step === 'done' && (
          <div className="card mt-4 text-center py-10">
            <CheckCircle className="w-20 h-20 text-forest-800 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-charcoal mb-1">Checked Out ✓</h2>
            <p className="text-charcoal-400 mb-1">{vehicle.vehicle_number}</p>
            <p className="text-charcoal-600 font-medium mb-6">{driverName}</p>
            <p className="text-xs text-charcoal-400 mb-6">AI is analyzing the checkout photos in the background.</p>

            <div className="flex flex-col gap-2">
              <Link href="/dashboard" className="btn-primary">
                Back to Fleet Dashboard
              </Link>
              {sessionId && (
                <Link href={`/dashboard/sessions/${sessionId}`} className="btn-secondary text-sm">
                  View Session Details
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
