'use client'

import { useRef, useState } from 'react'
import { Camera, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const POSITIONS = [
  { id: 'front', label: 'FRONT', emoji: '⬆️', hint: 'Front of vehicle' },
  { id: 'back', label: 'BACK', emoji: '⬇️', hint: 'Rear of vehicle' },
  { id: 'left', label: 'LEFT', emoji: '⬅️', hint: 'Left side' },
  { id: 'right', label: 'RIGHT', emoji: '➡️', hint: 'Right side' },
]

interface Props {
  onComplete: (photos: string[]) => void
  disabled?: boolean
}

export default function RapidPhotoCapture({ onComplete, disabled }: Props) {
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null, null])
  const [currentIdx, setCurrentIdx] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allDone = photos.every(p => p !== null)
  const capturedCount = photos.filter(Boolean).length

  function handleCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string
      setPhotos(prev => {
        const next = [...prev]
        next[currentIdx] = dataUrl
        return next
      })
      // Auto-advance to next position
      if (currentIdx < POSITIONS.length - 1) {
        setCurrentIdx(i => i + 1)
        // Auto-trigger camera for next position after brief delay
        setTimeout(() => fileInputRef.current?.click(), 300)
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function retakePhoto(idx: number) {
    setPhotos(prev => {
      const next = [...prev]
      next[idx] = null
      return next
    })
    setCurrentIdx(idx)
  }

  function handleComplete() {
    const validPhotos = photos.filter(Boolean) as string[]
    onComplete(validPhotos)
  }

  return (
    <div className="space-y-4">
      {/* Current position indicator */}
      {!allDone && (
        <div className="bg-forest-50 border border-forest-200 rounded-xl p-4 text-center">
          <div className="text-4xl mb-1">{POSITIONS[currentIdx].emoji}</div>
          <p className="text-2xl font-bold text-forest-800">{POSITIONS[currentIdx].label}</p>
          <p className="text-charcoal-400 text-sm mt-1">{POSITIONS[currentIdx].hint}</p>
        </div>
      )}

      {/* Progress dots */}
      <div className="flex justify-center gap-3">
        {POSITIONS.map((pos, i) => (
          <div key={pos.id} className="flex flex-col items-center gap-1">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all',
              photos[i] ? 'bg-forest-800 border-forest-800 text-white' :
              i === currentIdx ? 'bg-forest-100 border-forest-800 text-forest-800' :
              'bg-white border-surface-border text-charcoal-400'
            )}>
              {photos[i] ? <Check className="w-5 h-5" /> : pos.label.slice(0, 1)}
            </div>
            <span className="text-xs text-charcoal-400">{pos.label}</span>
          </div>
        ))}
      </div>

      {/* Photo thumbnails */}
      <div className="grid grid-cols-4 gap-2">
        {POSITIONS.map((pos, i) => (
          <div key={pos.id} className="relative">
            {photos[i] ? (
              <div className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photos[i]!}
                  alt={pos.label}
                  className="w-full aspect-square object-cover rounded-lg border-2 border-forest-800"
                />
                <button
                  onClick={() => retakePhoto(i)}
                  className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5 text-red-600" />
                </button>
                <div className="absolute bottom-1 left-1 bg-forest-800 text-white text-xs px-1.5 py-0.5 rounded">
                  {pos.label}
                </div>
              </div>
            ) : (
              <button
                onClick={() => { setCurrentIdx(i); fileInputRef.current?.click() }}
                className={cn(
                  'w-full aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-colors',
                  i === currentIdx
                    ? 'border-forest-800 bg-forest-50 text-forest-800'
                    : 'border-surface-border bg-surface-muted text-charcoal-400'
                )}
              >
                <Camera className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{pos.label}</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Camera input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCapture}
        disabled={disabled}
      />

      {/* Main capture button or complete button */}
      {!allDone ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3"
        >
          <Camera className="w-6 h-6" />
          Take {POSITIONS[currentIdx].label} Photo ({capturedCount}/4)
        </button>
      ) : (
        <button
          onClick={handleComplete}
          disabled={disabled}
          className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800"
        >
          <Check className="w-6 h-6" />
          All 4 Photos Captured — Continue
        </button>
      )}

      {capturedCount > 0 && !allDone && (
        <p className="text-center text-charcoal-400 text-sm">
          {capturedCount} of 4 captured • Tap any position above to retake
        </p>
      )}
    </div>
  )
}
