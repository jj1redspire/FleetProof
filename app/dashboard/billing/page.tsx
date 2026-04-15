'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, CheckCircle, Loader2, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { PLANS } from '@/lib/stripe'
import type { FPUser } from '@/types'

export default function BillingPage() {
  const router = useRouter()
  const [fpUser, setFpUser] = useState<FPUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase.from('fp_users').select('*').eq('id', user.id).single()
      setFpUser(data)
      setLoading(false)
    }
    load()
  }, [router])

  async function handleCheckout(plan: string) {
    setCheckoutLoading(plan)
    const res = await fetch('/api/stripe/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan }) })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setCheckoutLoading(null)
  }

  async function handlePortal() {
    setPortalLoading(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setPortalLoading(false)
  }

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-forest-800" /></div>

  const currentPlan = fpUser?.plan ?? 'free'
  const isActive = ['trial', 'active'].includes(fpUser?.subscription_status ?? '')

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-charcoal">Billing</h1>
        {isActive && fpUser?.stripe_customer_id && (
          <button onClick={handlePortal} disabled={portalLoading} className="btn-secondary text-sm flex items-center gap-2">
            {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
            Manage Billing
          </button>
        )}
      </div>

      <div className="card">
        <div className="flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-forest-800" />
          <div>
            <p className="font-semibold text-charcoal">Current Plan: <span className="text-forest-800">{currentPlan === 'free' ? 'Free Trial' : PLANS[currentPlan as keyof typeof PLANS]?.name ?? currentPlan}</span></p>
            <p className="text-sm text-charcoal-400">Status: <span className={fpUser?.subscription_status === 'active' ? 'text-green-700' : fpUser?.subscription_status === 'trial' ? 'text-blue-700' : 'text-orange-700'}>{fpUser?.subscription_status ?? 'free'}</span></p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {(Object.entries(PLANS) as [string, typeof PLANS[keyof typeof PLANS]][]).map(([key, plan]) => {
          const isCurrent = currentPlan === key && isActive
          return (
            <div key={key} className={`card flex flex-col ${isCurrent ? 'border-forest-800/40 border-2' : ''} ${key === 'pro' ? 'relative' : ''}`}>
              {key === 'pro' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-forest-800 text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>
              )}
              <div className="flex-1">
                <h3 className="font-bold text-charcoal text-lg">{plan.name}</h3>
                <p className="text-3xl font-bold text-forest-800 mt-2">${plan.price}<span className="text-base text-charcoal-400">/mo</span></p>
                <p className="text-sm text-charcoal-400 mt-1">{plan.vehicles >= 999999 ? 'Unlimited' : `Up to ${plan.vehicles}`} vehicles</p>
                <ul className="mt-4 space-y-2">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-charcoal-600">
                      <CheckCircle className="w-3.5 h-3.5 text-forest-800 flex-shrink-0 mt-0.5" />{f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-5">
                {isCurrent ? (
                  <div className="text-center text-sm text-forest-800 font-medium py-2.5">Current Plan</div>
                ) : (
                  <button onClick={() => handleCheckout(key)} disabled={!!checkoutLoading} className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold ${key === 'pro' ? 'btn-primary' : 'btn-secondary'}`}>
                    {checkoutLoading === key && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isActive ? 'Switch Plan' : 'Start Free Trial'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-center text-charcoal-400 text-sm">All plans include a 14-day free trial. Cancel anytime.</p>
    </div>
  )
}
