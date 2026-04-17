'use client'

import Link from 'next/link'
import { Truck, QrCode, Camera, Zap, FileText, CheckCircle, ChevronDown, ChevronUp, Shield, DollarSign, BarChart2, Star } from 'lucide-react'
import { useState } from 'react'

const FAQS = [
  {
    q: 'How fast is the checkout process really?',
    a: 'Typical checkout is 15–20 seconds. Attendant scans QR → taps 4 photos (front, back, left, right) → taps Checkout. The app pre-fills the last driver name, so returning guests are even faster. We designed this specifically for morning golf cart rushes where you\'re processing 50+ carts.',
  },
  {
    q: 'What if a cart comes back damaged and there\'s no pre-existing record?',
    a: 'You need a checkout record to attribute damage. That\'s the whole point — FleetProof only works if checkout photos were taken. Once your team builds the 15-second habit, every cart has a documented starting condition. Without it, you\'re back to "he said / she said."',
  },
  {
    q: 'Does FleetProof work on phones?',
    a: 'Yes — 100% mobile-first. Checkout happens on the attendant\'s phone in the parking lot. The camera integration is native mobile — tapping "Take Photo" opens your phone\'s camera directly. No app download required; it runs in the browser.',
  },
  {
    q: 'Can we use it for a mix of cart types?',
    a: 'Yes. You can set up golf carts, LSVs, shuttles, utility vehicles, and more — all in the same fleet. Each vehicle type gets its own entry and QR code.',
  },
  {
    q: 'How does the QR code work?',
    a: 'When you add a vehicle, FleetProof generates a QR code sticker. You print it, laminate it, and stick it on the cart. Attendants scan it with their phone — it opens the checkout page for that exact cart, pre-selected and ready for photos. No typing, no searching.',
  },
  {
    q: 'What if a guest disputes the damage charge?',
    a: 'You pull up the session report: timestamped checkout photos showing the cart in clean condition, timestamped return photos showing the new damage, and AI analysis identifying exactly what changed. That documentation ends most disputes immediately.',
  },
]

const VERTICALS = [
  {
    title: 'Golf Courses',
    icon: '⛳',
    problem: 'Morning rush means 50-100 carts leaving in 2 hours. If checkout takes 60 seconds each, it\'s a bottleneck.',
    solution: 'FleetProof checkout takes 15 seconds. Your attendants can process a full fleet before the first tee time.',
    use_cases: ['End-of-round damage attribution', 'Tournament cart tracking', 'Cart fleet condition reporting for insurance'],
  },
  {
    title: 'Resorts & Hotels',
    icon: '🏨',
    problem: 'Guests deny damage. You have no proof. You eat the cost or create a customer service nightmare.',
    solution: 'Pre/post photos with timestamps make damage attribution clear, professional, and defensible.',
    use_cases: ['Beach cart and bike rentals', 'Shuttle fleet condition tracking', 'Pool equipment documentation'],
  },
  {
    title: 'Retirement Communities',
    icon: '🏘️',
    problem: 'Residents use LSVs and community carts daily. Damage accumulates and attribution becomes impossible.',
    solution: 'Every checkout and return is documented. Damage history per resident, per vehicle, per month.',
    use_cases: ['Resident LSV programs', 'Community golf cart fleets', 'HOA vehicle liability tracking'],
  },
  {
    title: 'University Campuses',
    icon: '🎓',
    problem: 'Campus vehicles are used by dozens of departments. When a cart comes back damaged, no one knows who had it last.',
    solution: 'FleetProof ties every session to a specific user. Damage accountability changes behavior.',
    use_cases: ['Campus facilities vehicles', 'Event and AV carts', 'Groundskeeping equipment tracking'],
  },
]

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [openVertical, setOpenVertical] = useState<number | null>(0)

  return (
    <div className="min-h-screen bg-white text-charcoal">
      {/* Nav */}
      <nav className="border-b border-surface-border bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Truck className="w-6 h-6 text-forest-800" />
            <span className="text-xl font-bold text-charcoal">FleetProof</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-charcoal-400 hover:text-charcoal text-sm font-medium hidden sm:block">Log in</Link>
            <Link href="/auth/signup" className="btn-primary text-sm">Start Free Trial</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-forest-50 border border-forest-100 text-forest-800 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <Truck className="w-3.5 h-3.5" />
          14-Day Free Trial — No Credit Card Required
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-charcoal leading-tight">
          Every Cart Returns.
          <br />
          <span className="text-forest-800">Not Every Cart Returns Undamaged.</span>
        </h1>
        <p className="text-lg sm:text-xl text-charcoal-400 mt-6 max-w-3xl mx-auto leading-relaxed">
          Document vehicle condition at checkout and return in 15 seconds. AI identifies new damage and attributes it to the specific driver — with photo evidence.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link href="/auth/signup" className="btn-primary text-base px-8 py-3">Start Your Free 14-Day Trial</Link>
          <Link href="#how-it-works" className="btn-secondary text-base px-8 py-3">See How It Works</Link>
        </div>
        <p className="text-charcoal-200 text-sm mt-4">No credit card · No contract · Your next checkout is coming</p>
      </section>

      {/* Speed callout */}
      <section className="bg-forest-800 text-white py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Zap className="w-7 h-7 text-forest-100" />
            <span className="text-3xl font-bold">15 Seconds Per Vehicle</span>
          </div>
          <p className="text-forest-100 text-lg">
            Scan QR → 4 photos → tap Checkout. Golf course morning rush, handled.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-charcoal mb-3">How FleetProof Works</h2>
        <p className="text-center text-charcoal-400 mb-12 max-w-2xl mx-auto">Four steps. Your fleet is protected.</p>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { step: '1', icon: QrCode, title: 'Scan the QR Code', desc: 'QR sticker on every vehicle. Scan it → instantly opens checkout for that exact cart. No searching, no typing.' },
            { step: '2', icon: Camera, title: 'Snap 4 Photos', desc: 'Front, back, left, right. Tap tap tap tap. 10 seconds. AI analyzes them automatically.' },
            { step: '3', icon: CheckCircle, title: 'Hand Over the Keys', desc: 'Tap Checkout. Session logged with timestamp, photos, and condition report. Driver is documented.' },
            { step: '4', icon: Zap, title: 'AI Shows What Changed', desc: 'At return, same 4 photos. AI compares before/after. Shows exactly what\'s new. Names the driver.' },
          ].map((item, i) => (
            <div key={i} className="card text-center">
              <div className="w-8 h-8 bg-forest-800 text-white font-bold text-sm rounded-full flex items-center justify-center mx-auto mb-4">{item.step}</div>
              <item.icon className="w-7 h-7 text-forest-800 mx-auto mb-3" />
              <h3 className="font-semibold text-charcoal mb-2">{item.title}</h3>
              <p className="text-charcoal-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Value blocks */}
      <section className="bg-surface-muted border-y border-surface-border py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center text-charcoal mb-3">Why Fleet Managers Use FleetProof</h2>
          <p className="text-center text-charcoal-400 mb-12">Four kinds of protection — one app</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: Shield, title: 'Damage Attribution', color: 'text-forest-800', desc: '"It was like that when I got it." — No more. Photo-verified checkout and return proves exactly when damage occurred and who was responsible.' },
              { icon: FileText, title: 'Insurance Claims', color: 'text-blue-700', desc: 'Hail hits your fleet overnight. FleetProof shows timestamped condition of every vehicle the day before. Your claim gets paid in full, fast.' },
              { icon: DollarSign, title: 'Fleet Cost Tracking', color: 'text-green-700', desc: 'Track damage costs per vehicle, per driver, per month. Know which carts need replacement and which drivers need a conversation.' },
              { icon: BarChart2, title: 'Premium Reduction', color: 'text-purple-700', desc: 'Insurance carriers reward documented fleet programs. Your condition documentation history is your discount — and your defense.' },
            ].map((item, i) => (
              <div key={i} className="card flex gap-4">
                <item.icon className={`w-8 h-8 flex-shrink-0 mt-0.5 ${item.color}`} />
                <div>
                  <h3 className="font-semibold text-charcoal mb-2">{item.title}</h3>
                  <p className="text-charcoal-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verticals */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-charcoal mb-3">Built for Your Operation</h2>
        <p className="text-center text-charcoal-400 mb-10">FleetProof works for any fleet that moves — and comes back damaged.</p>
        <div className="space-y-3">
          {VERTICALS.map((v, i) => (
            <div key={i} className="card">
              <button onClick={() => setOpenVertical(openVertical === i ? null : i)} className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{v.icon}</span>
                  <span className="font-semibold text-charcoal text-lg">{v.title}</span>
                </div>
                {openVertical === i ? <ChevronUp className="w-4 h-4 text-charcoal-400" /> : <ChevronDown className="w-4 h-4 text-charcoal-400" />}
              </button>
              {openVertical === i && (
                <div className="mt-4 space-y-3">
                  <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                    <p className="text-xs font-semibold text-red-700 mb-1">The Problem</p>
                    <p className="text-sm text-charcoal">{v.problem}</p>
                  </div>
                  <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                    <p className="text-xs font-semibold text-green-700 mb-1">How FleetProof Helps</p>
                    <p className="text-sm text-charcoal">{v.solution}</p>
                  </div>
                  <ul className="space-y-1">
                    {v.use_cases.map((uc, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-charcoal-600">
                        <CheckCircle className="w-3.5 h-3.5 text-forest-800 flex-shrink-0" />{uc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ROI */}
      <section className="bg-forest-50 border-y border-forest-100 py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <Star className="w-8 h-8 text-forest-800 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-charcoal mb-6">The Math Is Simple</h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {[
              { value: '$200–500', label: 'Average cart repair cost' },
              { value: '$50,000+', label: 'Average fleet hail claim' },
              { value: '$99/mo', label: 'FleetProof Starter plan' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-surface-border p-4">
                <p className="text-2xl font-bold text-forest-800">{s.value}</p>
                <p className="text-sm text-charcoal-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="text-charcoal text-lg">
            One prevented dispute pays for <span className="text-forest-800 font-semibold">4 years</span> of FleetProof.
            One fleet hail claim pays for <span className="text-forest-800 font-semibold">42 years</span>.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-charcoal mb-3">Simple Pricing</h2>
        <p className="text-center text-charcoal-400 mb-12">14-day free trial on every plan. No contracts.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Starter', price: 99, vehicles: 'Up to 50 vehicles', popular: false, features: ['Up to 50 vehicles', 'Unlimited sessions', 'QR code stickers', 'AI damage detection', 'Damage attribution reports', 'PDF export', 'Driver history'] },
            { name: 'Pro', price: 199, vehicles: 'Up to 200 vehicles', popular: true, features: ['Up to 200 vehicles', 'Everything in Starter', 'Multiple locations', 'Damage cost tracking', 'Monthly reports', 'Priority support'] },
            { name: 'Fleet', price: 399, vehicles: 'Unlimited vehicles', popular: false, features: ['Unlimited vehicles', 'Everything in Pro', 'Unlimited locations', 'API access', 'White-label reports', 'Dedicated support'] },
          ].map((plan, i) => (
            <div key={i} className={`card flex flex-col relative ${plan.popular ? 'border-forest-800/30 border-2' : ''}`}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-forest-800 text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>}
              <div className="flex-1">
                <h3 className="font-bold text-charcoal text-xl">{plan.name}</h3>
                <p className="text-charcoal-400 text-sm mt-1">{plan.vehicles}</p>
                <p className="text-4xl font-bold text-forest-800 mt-4">${plan.price}<span className="text-lg text-charcoal-400">/mo</span></p>
                <ul className="mt-5 space-y-2.5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-charcoal-600">
                      <CheckCircle className="w-4 h-4 text-forest-800 flex-shrink-0 mt-0.5" />{f}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/auth/signup" className={`mt-6 block text-center py-3 rounded-lg font-semibold ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}>
                Start Free Trial
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-surface-muted border-y border-surface-border py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center text-charcoal mb-10">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="card bg-white">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex items-center justify-between w-full text-left gap-4">
                  <span className="font-semibold text-charcoal">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-4 h-4 text-forest-800 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-charcoal-400 flex-shrink-0" />}
                </button>
                {openFaq === i && <p className="mt-3 text-charcoal-400 text-sm leading-relaxed">{faq.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-forest-800 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold mb-3">Your Next Checkout Is Coming</h2>
          <p className="text-forest-100 text-lg mb-6">Will you have 15 seconds to protect your fleet?</p>
          <Link href="/auth/signup" className="bg-white text-forest-800 hover:bg-forest-50 font-bold text-base px-8 py-3 rounded-lg inline-block transition-colors">
            Start Your Free 14-Day Trial — No Credit Card
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-surface-border py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-forest-800" />
            <span className="font-bold text-charcoal">FleetProof</span>
          </div>
          <div className="flex gap-6 text-sm text-charcoal-400">
            <Link href="/auth/login" className="hover:text-charcoal">Log in</Link>
            <Link href="/auth/signup" className="hover:text-charcoal">Sign up</Link>
            <Link href="/terms" className="hover:text-charcoal">Terms</Link>
            <Link href="/privacy" className="hover:text-charcoal">Privacy</Link>
          </div>
          <p className="text-charcoal-200 text-sm">© 2026 FleetProof. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
