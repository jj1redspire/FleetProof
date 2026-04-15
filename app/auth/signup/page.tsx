'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Truck, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function SignupPage() {
  const [orgName, setOrgName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { org_name: orgName },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })
    if (authError) { setError(authError.message); setLoading(false) }
    else setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-surface-muted flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-forest-800 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-charcoal mb-2">Check your email</h1>
          <p className="text-charcoal-400 mb-6">
            We sent a confirmation link to <span className="font-medium text-charcoal">{email}</span>. Click it to start your 14-day free trial.
          </p>
          <Link href="/auth/login" className="text-forest-800 hover:text-forest-700 font-medium">Back to login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-muted flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Truck className="w-8 h-8 text-forest-800" />
            <span className="text-2xl font-bold text-charcoal">FleetProof</span>
          </div>
          <h1 className="text-xl font-semibold text-charcoal">Start your free trial</h1>
          <p className="text-charcoal-400 mt-1">14 days free — no credit card required</p>
        </div>

        <div className="card">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">{error}</div>
          )}
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="label">Organization / Fleet Name</label>
              <input type="text" className="input" placeholder="Pebble Beach Golf Links" value={orgName} onChange={e => setOrgName(e.target.value)} required />
            </div>
            <div>
              <label className="label">Email address</label>
              <input type="email" className="input" placeholder="fleet@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="Minimum 8 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating account...' : 'Start Free Trial'}
            </button>
          </form>
          <p className="text-center text-charcoal-400 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-forest-800 hover:text-forest-700 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
