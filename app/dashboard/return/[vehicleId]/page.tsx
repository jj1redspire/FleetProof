'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Loader2, Mic, MicOff, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { getVehicleTypeLabel, formatDateTime } from '@/lib/utils'
import RapidPhotoCapture from '@/components/checkout/RapidPhotoCapture'
import type { FPVehicle, FPSession } from '@/types'

type Step = 'confirm' | 'photos' | 'voice' | 'done'

export default function ReturnPage() {
  const params = useParams()
  const vehicleId = params.vehicleId as string
  const router = useRouter()

  const [vehicle, setVehicle] = useState<FPVehicle | null>(null)
  const [session, setSession] = useState<FPSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<Step>('confirm')
  const [saving, setSaving] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const [voiceNote, setVoiceNote] = useState('')
  const [recording, setRecording] = useState(false)
  const [damageResult, setDamageResult] = useState<{ damage_detected: boolean; new_damage: unknown[] } | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: v } = await supabase.from('fp_vehicles').select('*').eq('id', vehicleId).single()
      if (!v) { router.push('/dashboard'); return }
      setVehicle(v)

      const { data: sess } = await supabase.from('fp_sessions').select('*').eq('vehicle_id', vehicleId).eq('status', 'active').single()
      if (!sess) {
        router.push(`/dashboard/checkout/${vehicleId}`)
        return
      }
      setSession(sess)
      setLoading(false)
    }
    load()
  }, [vehicleId, router])

  function startVoice() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition
    if (!SR) { handleReturn(); return }
    const recognition = new SR()
    recognition.continuous = false
    recognition.lang = 'en-US'
    let finalText = ''
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => { finalText = e.results[0][0].transcript }
    recognition.onend = () => { setVoiceNote(finalText); setRecording(false) }
    recognition.start()
    recognitionRef.current = recognition
    setRecording(true)
  }

  function stopVoice() { recognitionRef.current?.stop(); setRecording(false) }

  async function handleReturn() {
    if (!session || !vehicle) return
    setSaving(true)

    const supabase = createClient()
    const returnTime = new Date().toISOString()

    await supabase.from('fp_sessions').update({
      return_time: returnTime,
      return_photos: photos,
      return_voice: voiceNote || null,
      status: 'completed',
    }).eq('id', session.id)

    // Trigger AI comparison (background)
    const compRes = await fetch('/api/ai/compare-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: session.id,
        checkout_photos: session.checkout_photos,
        return_photos: photos,
        vehicle_type: vehicle.vehicle_type,
        vehicle_number: vehicle.vehicle_number,
        driver_name: session.driver_name,
        checkout_time: session.checkout_time,
        return_time: returnTime,
      }),
    })

    if (compRes.ok) {
      const result = await compRes.json()
      setDamageResult(result)
    }

    setStep('done')
    setSaving(false)
  }

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-forest-800" /></div>
  if (!vehicle || !session) return null

  return (
    <div className="min-h-screen bg-surface-muted">
      <div className="bg-white border-b border-surface-border px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="text-charcoal-400 hover:text-charcoal flex items-center gap-1.5 text-sm">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <div className="text-center">
          <p className="font-bold text-charcoal">{vehicle.vehicle_number}</p>
          <p className="text-xs text-charcoal-400">{getVehicleTypeLabel(vehicle.vehicle_type)}</p>
        </div>
        <div className="w-20 text-right">
          <span className="text-xs font-semibold text-orange-800 bg-orange-50 px-2 py-1 rounded">RETURN</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">

        {/* STEP: Confirm */}
        {step === 'confirm' && (
          <div className="card mt-4">
            <h2 className="text-xl font-bold text-charcoal mb-4">Confirm Return</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="font-semibold text-blue-800 text-lg">{session.driver_name}</p>
              <p className="text-blue-600 text-sm mt-1">Checked out {formatDateTime(session.checkout_time)}</p>
            </div>
            <button onClick={() => setStep('photos')} className="btn-primary w-full py-4 text-lg">
              Take 4 Return Photos →
            </button>
            <p className="text-center text-charcoal-400 text-xs mt-2">Same 4 positions: Front, Back, Left, Right</p>
          </div>
        )}

        {/* STEP: Photos */}
        {step === 'photos' && (
          <div className="mt-4">
            <div className="mb-4 text-center">
              <h2 className="text-xl font-bold text-charcoal">Return Photos</h2>
              <p className="text-charcoal-400 text-sm mt-1">Same 4 angles as checkout. AI will compare them.</p>
            </div>
            <RapidPhotoCapture onComplete={p => { setPhotos(p); setStep('voice') }} />
          </div>
        )}

        {/* STEP: Voice */}
        {step === 'voice' && (
          <div className="card mt-4">
            <h2 className="text-xl font-bold text-charcoal mb-2">Any Damage to Note?</h2>
            <p className="text-charcoal-400 text-sm mb-4">Optional — AI will already scan for damage automatically.</p>

            <div className="space-y-3">
              <textarea
                className="input h-20 resize-none"
                placeholder="Type a note, or use voice..."
                value={voiceNote}
                onChange={e => setVoiceNote(e.target.value)}
              />

              <div className="flex gap-2">
                {!recording ? (
                  <button onClick={startVoice} className="btn-secondary flex items-center gap-2 flex-1">
                    <Mic className="w-4 h-4" /> Voice Note
                  </button>
                ) : (
                  <button onClick={stopVoice} className="btn-secondary flex items-center gap-2 flex-1 text-red-600 animate-pulse">
                    <MicOff className="w-4 h-4" /> Stop Recording
                  </button>
                )}
              </div>

              <button
                onClick={handleReturn}
                disabled={saving}
                className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                {saving ? 'Processing Return...' : 'Complete Return'}
              </button>

              <button onClick={handleReturn} disabled={saving} className="w-full text-center text-charcoal-400 text-sm py-2">
                Skip note — process return now
              </button>
            </div>
          </div>
        )}

        {/* STEP: Done */}
        {step === 'done' && (
          <div className="mt-4 space-y-4">
            <div className="card text-center py-8">
              {damageResult?.damage_detected ? (
                <>
                  <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-3" />
                  <h2 className="text-2xl font-bold text-charcoal mb-1">Damage Detected</h2>
                  <p className="text-red-700 font-medium mb-1">{vehicle.vehicle_number} returned by {session.driver_name}</p>
                  <p className="text-charcoal-400 text-sm mb-4">{(damageResult.new_damage as unknown[]).length} new damage item{(damageResult.new_damage as unknown[]).length !== 1 ? 's' : ''} found</p>
                </>
              ) : (
                <>
                  <CheckCircle className="w-16 h-16 text-forest-800 mx-auto mb-3" />
                  <h2 className="text-2xl font-bold text-charcoal mb-1">Returned Clean ✓</h2>
                  <p className="text-charcoal-600 font-medium mb-1">{vehicle.vehicle_number} — {session.driver_name}</p>
                  <p className="text-charcoal-400 text-sm mb-4">No new damage detected by AI</p>
                </>
              )}

              <div className="flex flex-col gap-2">
                <Link href="/dashboard" className="btn-primary">
                  Back to Fleet Dashboard
                </Link>
                <Link href={`/dashboard/sessions/${session.id}`} className="btn-secondary text-sm">
                  View Full Comparison Report
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
