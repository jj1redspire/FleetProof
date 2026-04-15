'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Loader2, Mic, MicOff, Camera, X, PenLine } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { getVehicleTypeLabel } from '@/lib/utils'
import RapidPhotoCapture from '@/components/checkout/RapidPhotoCapture'
import type { FPVehicle, TowMetadata, TowReason, KeysStatus } from '@/types'

type Step = 'driver' | 'tow_details' | 'photos' | 'voice' | 'done'

const TOW_REASONS: { value: TowReason; label: string }[] = [
  { value: 'roadside', label: 'Roadside Assistance / Breakdown' },
  { value: 'accident', label: 'Accident / Collision' },
  { value: 'police_impound', label: 'Police Impound / Law Enforcement' },
  { value: 'repo', label: 'Repossession / Recovery' },
  { value: 'parking_violation', label: 'Parking Violation / Private Property' },
]

const KEYS_OPTIONS: { value: KeysStatus; label: string }[] = [
  { value: 'with_owner', label: 'With owner / no keys taken' },
  { value: 'in_ignition', label: 'Keys in ignition' },
  { value: 'not_available', label: 'Keys not available' },
]

function isTowingBusiness(type: string) {
  return type === 'towing_company' || type === 'repo_recovery'
}

export default function CheckoutPage() {
  const params = useParams()
  const vehicleId = params.vehicleId as string
  const router = useRouter()

  const [vehicle, setVehicle] = useState<FPVehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<Step>('driver')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [isTowing, setIsTowing] = useState(false)

  // Core form state
  const [driverName, setDriverName] = useState('')
  const [mileage, setMileage] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [voiceNote, setVoiceNote] = useState('')
  const [recording, setRecording] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  // Tow-specific state
  const [towReason, setTowReason] = useState<TowReason>('roadside')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [vehicleVin, setVehicleVin] = useState('')
  const [keysStatus, setKeysStatus] = useState<KeysStatus>('with_owner')
  const [hookUpPoint, setHookUpPoint] = useState('')
  const [policeReportNumber, setPoliceReportNumber] = useState('')
  const [platePhoto, setPlatePhoto] = useState<string | null>(null)
  const [vinPhoto, setVinPhoto] = useState<string | null>(null)
  const [hookUpPhoto, setHookUpPhoto] = useState<string | null>(null)
  const [witnessName, setWitnessName] = useState('')
  const [witnessSignature, setWitnessSignature] = useState<string | null>(null)
  const [sigDrawing, setSigDrawing] = useState(false)
  const [showWitness, setShowWitness] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)
  const driverInputRef = useRef<HTMLInputElement>(null)
  const plateInputRef = useRef<HTMLInputElement>(null)
  const vinInputRef = useRef<HTMLInputElement>(null)
  const hookUpInputRef = useRef<HTMLInputElement>(null)
  const sigCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: v } = await supabase.from('fp_vehicles').select('*').eq('id', vehicleId).single()
      if (!v) { router.push('/dashboard'); return }
      setVehicle(v)

      // Load location to detect towing business type
      const { data: loc } = await supabase.from('fp_locations').select('business_type').eq('id', v.location_id).single()
      if (loc && isTowingBusiness(loc.business_type)) setIsTowing(true)

      const { data: existing } = await supabase.from('fp_sessions').select('id').eq('vehicle_id', vehicleId).eq('status', 'active').single()
      if (existing) { router.push(`/dashboard/return/${vehicleId}`); return }

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
    setStep(isTowing ? 'tow_details' : 'photos')
  }

  function handleTowDetailsSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStep('photos')
  }

  function capturePhoto(setter: (v: string) => void, inputRef: React.RefObject<HTMLInputElement>) {
    inputRef.current?.click()
  }

  function handlePhotoFile(e: React.ChangeEvent<HTMLInputElement>, setter: (v: string | null) => void) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setter(ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
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

  // Signature canvas
  function initSigCanvas() {
    const canvas = sigCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#f8f9fa'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#2D5016'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
  }

  function sigPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    setSigDrawing(true)
    const canvas = sigCanvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')!
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  function sigPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!sigDrawing) return
    const canvas = sigCanvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')!
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }

  function saveSignature() {
    setWitnessSignature(sigCanvasRef.current?.toDataURL('image/png') ?? null)
    setShowWitness(false)
  }

  function clearSig() { initSigCanvas() }

  async function handleCheckout() {
    setSaving(true)
    setError('')
    const supabase = createClient()

    const towMeta: TowMetadata | null = isTowing ? {
      tow_reason: towReason,
      vehicle_plate: vehiclePlate.trim(),
      vehicle_vin: vehicleVin.trim(),
      keys_status: keysStatus,
      hook_up_point: hookUpPoint.trim(),
      plate_photo: platePhoto,
      vin_photo: vinPhoto,
      hook_up_photo: hookUpPhoto,
      witness_name: witnessName.trim() || null,
      witness_signature: witnessSignature,
      police_report_number: policeReportNumber.trim() || null,
    } : null

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
        tow_metadata: towMeta,
      })
      .select()
      .single()

    if (sessionErr || !session) {
      setError(sessionErr?.message ?? 'Failed to create session')
      setSaving(false)
      return
    }

    setSessionId(session.id)

    fetch('/api/ai/analyze-condition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: session.id,
        photos,
        vehicle_type: vehicle?.vehicle_type,
        vehicle_number: vehicle?.vehicle_number,
        phase: 'checkout',
        tow_metadata: towMeta,
        is_towing: isTowing,
      }),
    }).catch(() => {})

    setStep('done')
    setSaving(false)
  }

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-forest-800" /></div>
  if (!vehicle) return null

  const isTowingReason = towReason === 'police_impound' || towReason === 'repo'

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
        <div className="w-24 text-right">
          <span className={`text-xs font-semibold px-2 py-1 rounded ${isTowing ? 'text-orange-800 bg-orange-50' : 'text-forest-800 bg-forest-50'}`}>
            {isTowing ? 'TOW LOG' : 'CHECKOUT'}
          </span>
        </div>
      </div>

      {/* Progress bar — only for towing (more steps) */}
      {isTowing && (
        <div className="bg-white border-b border-surface-border px-4 py-2">
          <div className="flex gap-2 max-w-lg mx-auto">
            {(['driver', 'tow_details', 'photos', 'voice'] as Step[]).map((s, i) => (
              <div key={s} className={`flex-1 h-1 rounded-full ${
                ['driver', 'tow_details', 'photos', 'voice', 'done'].indexOf(step) > i ? 'bg-forest-800' :
                step === s ? 'bg-forest-400' : 'bg-surface-border'
              }`} />
            ))}
          </div>
          <div className="flex justify-between text-xs text-charcoal-400 mt-1 max-w-lg mx-auto">
            <span>Driver</span><span>Vehicle</span><span>Photos</span><span>Notes</span>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto p-4 space-y-4">

        {/* STEP: Driver */}
        {step === 'driver' && (
          <div className="card mt-4">
            <h2 className="text-xl font-bold text-charcoal mb-4">
              {isTowing ? 'Driver / Operator' : 'Who is taking this vehicle?'}
            </h2>
            <form onSubmit={handleDriverSubmit} className="space-y-4">
              <div>
                <input
                  ref={driverInputRef}
                  type="text"
                  className="input text-xl py-4"
                  placeholder={isTowing ? 'Operator name' : 'Driver name'}
                  value={driverName}
                  onChange={e => setDriverName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
              {!isTowing && (
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
              )}
              <button type="submit" className="btn-primary w-full py-4 text-lg">
                {isTowing ? 'Next: Vehicle Details →' : 'Next: Take 4 Photos →'}
              </button>
            </form>
          </div>
        )}

        {/* STEP: Tow details (towing only) */}
        {step === 'tow_details' && (
          <div className="space-y-4 mt-4">
            <div className="card">
              <h2 className="text-xl font-bold text-charcoal mb-1">Vehicle Being Towed</h2>
              <p className="text-charcoal-400 text-sm mb-4">Document the vehicle before hook-up</p>

              <form onSubmit={handleTowDetailsSubmit} className="space-y-4">
                {/* Tow reason */}
                <div>
                  <label className="label">Tow Reason <span className="text-red-500">*</span></label>
                  <select className="input" value={towReason} onChange={e => setTowReason(e.target.value as TowReason)} required>
                    {TOW_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>

                {/* Plate */}
                <div>
                  <label className="label">License Plate <span className="text-charcoal-200">(optional)</span></label>
                  <div className="flex gap-2">
                    <input
                      ref={plateInputRef}
                      type="text"
                      className="input font-mono text-lg tracking-widest uppercase flex-1"
                      placeholder="ABC-1234"
                      value={vehiclePlate}
                      onChange={e => setVehiclePlate(e.target.value.toUpperCase())}
                    />
                    <button
                      type="button"
                      onClick={() => capturePhoto(setPlatePhoto, { current: document.getElementById('plate-photo-input') as HTMLInputElement })}
                      className={`btn-secondary px-3 flex-shrink-0 ${platePhoto ? 'border-forest-800 text-forest-800' : ''}`}
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input id="plate-photo-input" type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handlePhotoFile(e, setPlatePhoto)} />
                  </div>
                  {platePhoto && (
                    <div className="relative mt-2 inline-block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={platePhoto} alt="Plate" className="h-16 rounded border border-surface-border" />
                      <button onClick={() => setPlatePhoto(null)} className="absolute -top-1.5 -right-1.5 bg-red-600 rounded-full w-5 h-5 flex items-center justify-center">
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  )}
                </div>

                {/* VIN */}
                <div>
                  <label className="label">VIN <span className="text-charcoal-200">(optional)</span></label>
                  <div className="flex gap-2">
                    <input
                      ref={vinInputRef}
                      type="text"
                      className="input font-mono tracking-wider uppercase flex-1"
                      placeholder="1HGBH41JXMN109186"
                      value={vehicleVin}
                      onChange={e => setVehicleVin(e.target.value.toUpperCase())}
                      maxLength={17}
                    />
                    <button
                      type="button"
                      onClick={() => capturePhoto(setVinPhoto, { current: document.getElementById('vin-photo-input') as HTMLInputElement })}
                      className={`btn-secondary px-3 flex-shrink-0 ${vinPhoto ? 'border-forest-800 text-forest-800' : ''}`}
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input id="vin-photo-input" type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handlePhotoFile(e, setVinPhoto)} />
                  </div>
                  {vinPhoto && (
                    <div className="relative mt-2 inline-block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={vinPhoto} alt="VIN" className="h-16 rounded border border-surface-border" />
                      <button onClick={() => setVinPhoto(null)} className="absolute -top-1.5 -right-1.5 bg-red-600 rounded-full w-5 h-5 flex items-center justify-center">
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Keys status */}
                <div>
                  <label className="label">Keys Status <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-1 gap-2">
                    {KEYS_OPTIONS.map(opt => (
                      <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        keysStatus === opt.value ? 'border-forest-800 bg-forest-50' : 'border-surface-border hover:border-charcoal-200'
                      }`}>
                        <input type="radio" name="keys" value={opt.value} checked={keysStatus === opt.value} onChange={() => setKeysStatus(opt.value as KeysStatus)} className="sr-only" />
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${keysStatus === opt.value ? 'border-forest-800 bg-forest-800' : 'border-charcoal-200'}`} />
                        <span className="text-sm font-medium text-charcoal">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Hook-up point */}
                <div>
                  <label className="label">Hook-Up Point <span className="text-charcoal-200">(optional)</span></label>
                  <div className="flex gap-2">
                    <input
                      ref={hookUpInputRef}
                      type="text"
                      className="input flex-1"
                      placeholder="e.g. front frame, rear axle, subframe"
                      value={hookUpPoint}
                      onChange={e => setHookUpPoint(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => capturePhoto(setHookUpPhoto, { current: document.getElementById('hookup-photo-input') as HTMLInputElement })}
                      className={`btn-secondary px-3 flex-shrink-0 ${hookUpPhoto ? 'border-forest-800 text-forest-800' : ''}`}
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input id="hookup-photo-input" type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handlePhotoFile(e, setHookUpPhoto)} />
                  </div>
                  {hookUpPhoto && (
                    <div className="relative mt-2 inline-block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={hookUpPhoto} alt="Hook-up" className="h-16 rounded border border-surface-border" />
                      <button onClick={() => setHookUpPhoto(null)} className="absolute -top-1.5 -right-1.5 bg-red-600 rounded-full w-5 h-5 flex items-center justify-center">
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Police report number (for police/repo) */}
                {isTowingReason && (
                  <div>
                    <label className="label">
                      {towReason === 'police_impound' ? 'Police Report / Case Number' : 'Authorization Number'}
                      <span className="text-charcoal-200"> (optional)</span>
                    </label>
                    <input
                      type="text"
                      className="input font-mono"
                      placeholder={towReason === 'police_impound' ? 'RPT-2024-1234' : 'AUTH-5678'}
                      value={policeReportNumber}
                      onChange={e => setPoliceReportNumber(e.target.value)}
                    />
                  </div>
                )}

                {/* Witness signature */}
                {!showWitness ? (
                  <button
                    type="button"
                    onClick={() => { setShowWitness(true); setTimeout(initSigCanvas, 50) }}
                    className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
                  >
                    <PenLine className="w-4 h-4" />
                    {isTowingReason ? 'Add Officer / Witness Signature' : 'Add Witness Signature (optional)'}
                  </button>
                ) : (
                  <div className="space-y-2 border border-surface-border rounded-lg p-3">
                    <div>
                      <label className="label">Witness Name / Badge Number</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Officer Johnson #4521"
                        value={witnessName}
                        onChange={e => setWitnessName(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-charcoal-400">Witness signature:</p>
                    <canvas
                      ref={sigCanvasRef}
                      width={420}
                      height={100}
                      className="w-full rounded border border-surface-border cursor-crosshair touch-none"
                      onPointerDown={sigPointerDown}
                      onPointerMove={sigPointerMove}
                      onPointerUp={() => setSigDrawing(false)}
                    />
                    <div className="flex gap-2">
                      <button type="button" onClick={saveSignature} className="btn-primary text-sm flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" /> Save Signature
                      </button>
                      <button type="button" onClick={clearSig} className="btn-secondary text-sm">Clear</button>
                      <button type="button" onClick={() => setShowWitness(false)} className="btn-secondary text-sm">Cancel</button>
                    </div>
                  </div>
                )}

                {witnessSignature && !showWitness && (
                  <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <CheckCircle className="w-4 h-4 text-green-700 flex-shrink-0" />
                    <span className="text-sm text-green-800 font-medium">
                      Witness signature captured{witnessName ? ` — ${witnessName}` : ''}
                    </span>
                    <button type="button" onClick={() => setWitnessSignature(null)} className="ml-auto text-green-600 hover:text-green-800">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <button type="submit" className="btn-primary w-full py-4 text-lg">
                  Next: Take Condition Photos →
                </button>
              </form>
            </div>
          </div>
        )}

        {/* STEP: Photos */}
        {step === 'photos' && (
          <div className="mt-4">
            <div className="mb-4 text-center">
              <h2 className="text-xl font-bold text-charcoal">
                {isTowing ? 'Vehicle Condition Photos' : '4 Quick Photos'}
              </h2>
              <p className="text-charcoal-400 text-sm mt-1">
                {isTowing
                  ? 'Document all 4 sides before hook-up — this is your pre-tow evidence'
                  : 'Front → Back → Left → Right. Tap each once.'}
              </p>
            </div>
            <RapidPhotoCapture onComplete={handlePhotosComplete} />
          </div>
        )}

        {/* STEP: Voice note */}
        {step === 'voice' && (
          <div className="card mt-4">
            <h2 className="text-xl font-bold text-charcoal mb-2">
              {isTowing ? 'Additional Notes?' : 'Note Anything?'}
            </h2>
            <p className="text-charcoal-400 text-sm mb-4">
              {isTowing
                ? 'Optional — existing damage, hazmat, personal property visible, other observations'
                : 'Optional — existing damage, items left in cart, etc.'}
            </p>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">{error}</div>}

            <div className="space-y-3">
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
                {saving ? (isTowing ? 'Logging Tow...' : 'Checking Out...') : (isTowing ? 'Complete Tow Log' : 'Complete Checkout')}
              </button>

              <button onClick={handleCheckout} disabled={saving} className="w-full text-center text-charcoal-400 text-sm py-2">
                Skip note — {isTowing ? 'log now' : 'checkout now'}
              </button>
            </div>
          </div>
        )}

        {/* STEP: Done */}
        {step === 'done' && (
          <div className="card mt-4 text-center py-10">
            <CheckCircle className="w-20 h-20 text-forest-800 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-charcoal mb-1">
              {isTowing ? 'Tow Logged ✓' : 'Checked Out ✓'}
            </h2>
            <p className="text-charcoal-400 mb-1">{vehicle.vehicle_number}</p>
            <p className="text-charcoal-600 font-medium mb-2">{driverName}</p>
            {isTowing && vehiclePlate && (
              <p className="text-charcoal-400 text-sm mb-1">Plate: <span className="font-mono font-semibold text-charcoal">{vehiclePlate}</span></p>
            )}
            {isTowing && (
              <p className="text-charcoal-400 text-sm mb-4">
                {TOW_REASONS.find(r => r.value === towReason)?.label}
                {witnessSignature && ' · Witness signed'}
              </p>
            )}
            <p className="text-xs text-charcoal-400 mb-6">AI is analyzing the condition photos in the background.</p>

            <div className="flex flex-col gap-2">
              <Link href="/dashboard" className="btn-primary">
                Back to Fleet Dashboard
              </Link>
              {sessionId && (
                <Link href={`/dashboard/sessions/${sessionId}`} className="btn-secondary text-sm">
                  View {isTowing ? 'Tow Record' : 'Session Details'}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
