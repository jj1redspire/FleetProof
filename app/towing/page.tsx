'use client'

import Link from 'next/link'
import { Truck, Camera, Shield, FileText, ChevronDown, ChevronUp, CheckCircle, DollarSign, Star, AlertTriangle, PenLine } from 'lucide-react'
import { useState } from 'react'

const FAQS = [
  {
    q: 'How does FleetProof protect me from false damage claims?',
    a: 'Before you hook up, you document the vehicle\'s pre-existing condition with 4 timestamped photos (front, back, left, right). If a vehicle owner later claims you caused damage that was already there before you touched the vehicle, you pull up the pre-tow record — photos, timestamp, GPS-verified — and the claim ends. No pre-existing damage is undocumented.',
  },
  {
    q: 'Does FleetProof meet state pre-tow documentation requirements?',
    a: 'FleetProof generates the digital record format required or recommended in WA, CA, NJ, OH, and other states with pre-tow documentation laws. The record includes timestamped photos, license plate, VIN, hook-up point, keys status, and optional officer/witness signature. Check your state\'s specific requirements — FleetProof is designed to meet the highest-bar states.',
  },
  {
    q: 'Can I capture a police officer\'s signature at the scene?',
    a: 'Yes. The tow log includes an optional "witness signature" step — a digital signature pad that can be signed by the officer, lot attendant, or any third party present at the tow. Witness name and badge number are also captured and included in the report.',
  },
  {
    q: 'What happens if a repo customer gets aggressive?',
    a: 'The FleetProof repo log documents the pre-repossession vehicle condition, the authorization number, key status, and optionally a law enforcement witness. This documentation establishes the factual record before any dispute begins. It\'s not a personal safety tool — but it is a legal protection tool.',
  },
  {
    q: 'How long does logging a tow take?',
    a: 'About 30 seconds for a standard roadside or impound. You enter the driver name, select tow reason, capture the plate and 4 photos, and tap Complete. The VIN, hook-up point, and witness steps are optional — skip them when speed matters, include them when documentation quality matters.',
  },
  {
    q: 'Can I use this alongside my existing TMS or dispatch software?',
    a: 'Yes — FleetProof is documentation-only, not a dispatch tool. It doesn\'t replace your TMS. It adds a legal-grade photo record to every tow that your TMS doesn\'t capture. Export PDFs can be attached to your existing job records.',
  },
]

export default function TowingLandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white text-charcoal">
      {/* Nav */}
      <nav className="border-b border-surface-border bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Truck className="w-6 h-6 text-forest-800" />
            <span className="text-xl font-bold text-charcoal">FleetProof</span>
            <span className="text-xs bg-orange-100 text-orange-800 font-semibold px-2 py-0.5 rounded ml-1">Towing</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-charcoal-400 hover:text-charcoal text-sm font-medium hidden sm:block">Log in</Link>
            <Link href="/auth/signup" className="btn-primary text-sm">Start Free Trial</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-800 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <AlertTriangle className="w-3.5 h-3.5" />
          Tow Operators — 14-Day Free Trial
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-charcoal leading-tight">
          You Get Blamed For Damage
          <br />
          <span className="text-red-700">You Didn&apos;t Cause.</span>{' '}
          <span className="text-forest-800">Every Week.</span>
        </h1>
        <p className="text-lg sm:text-xl text-charcoal-400 mt-6 max-w-3xl mx-auto leading-relaxed">
          Document vehicle condition before every hook-up. 30 seconds. Photo-verified. Digitally signed.
          No more false damage claims that your word can&apos;t beat.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link href="/auth/signup" className="btn-primary text-base px-8 py-3">Start Your Free 14-Day Trial</Link>
          <Link href="#how-it-works" className="btn-secondary text-base px-8 py-3">See How It Works</Link>
        </div>
        <p className="text-charcoal-200 text-sm mt-4">$39/truck/month · $99/company unlimited trucks · No contract</p>
      </section>

      {/* Pain point bar */}
      <section className="bg-red-700 text-white py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-2xl font-bold mb-2">Average tow damage claim: $2,000</p>
          <p className="text-red-200 text-lg">Average annual claims per truck: 6–12 &nbsp;·&nbsp; Most are false &nbsp;·&nbsp; Most go unpaid because you can&apos;t prove it</p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-charcoal mb-3">How FleetProof Towing Works</h2>
        <p className="text-center text-charcoal-400 mb-12 max-w-2xl mx-auto">30 seconds before you hook up. Permanent legal-grade record.</p>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { step: '1', icon: Truck, title: 'Arrive at Vehicle', desc: 'Open FleetProof on your phone. Select the tow reason (roadside, impound, repo) and capture the license plate.' },
            { step: '2', icon: Camera, title: 'Snap 4 Photos', desc: 'Front, back, left side, right side. Every angle documented before you touch the vehicle. 20 seconds.' },
            { step: '3', icon: PenLine, title: 'Optional: Get Witness Signature', desc: 'Police officer, lot attendant, property manager — digital signature pad right on your phone. Adds legal weight.' },
            { step: '4', icon: FileText, title: 'Dispute-Proof Record', desc: 'Owner claims you scratched their car? Pull up the pre-tow record. Timestamp, GPS, photos. Claim denied.' },
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
          <h2 className="text-3xl font-bold text-center text-charcoal mb-3">Why Tow Operators Use FleetProof</h2>
          <p className="text-center text-charcoal-400 mb-12">Documentation that holds up when it counts</p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="card flex gap-4">
              <DollarSign className="w-8 h-8 flex-shrink-0 mt-0.5 text-red-700" />
              <div>
                <h3 className="font-semibold text-charcoal mb-2">Damage Claim Defense</h3>
                <p className="text-charcoal-400 text-sm leading-relaxed">
                  False damage claims cost tow operators $500–$10,000 per incident — and most can&apos;t be defended without photo evidence.
                  FleetProof pre-tow documentation ends disputes before they escalate. Your photos beat their word, every time.
                </p>
                <p className="text-sm font-semibold text-red-700 mt-2">Average false claim cost: $2,000</p>
              </div>
            </div>

            <div className="card flex gap-4">
              <Shield className="w-8 h-8 flex-shrink-0 mt-0.5 text-blue-700" />
              <div>
                <h3 className="font-semibold text-charcoal mb-2">Insurance Premium Reduction</h3>
                <p className="text-charcoal-400 text-sm leading-relaxed">
                  Progressive Commercial, Great West, and other commercial auto carriers reward documented pre-tow inspection programs
                  with lower premiums and faster claims resolution. FleetProof&apos;s timestamped records are the documentation they want to see.
                </p>
                <p className="text-sm font-semibold text-blue-700 mt-2">Verified by major commercial auto carriers</p>
              </div>
            </div>

            <div className="card flex gap-4">
              <FileText className="w-8 h-8 flex-shrink-0 mt-0.5 text-forest-800" />
              <div>
                <h3 className="font-semibold text-charcoal mb-2">Police Impound Compliance</h3>
                <p className="text-charcoal-400 text-sm leading-relaxed">
                  WA, CA, NJ, OH and other states require or strongly recommend pre-tow vehicle condition documentation for police impounds.
                  FleetProof generates the timestamped photo record + digital officer signature your state requires.
                </p>
                <p className="text-sm font-semibold text-forest-800 mt-2">State compliance for impound documentation</p>
              </div>
            </div>

            <div className="card flex gap-4">
              <AlertTriangle className="w-8 h-8 flex-shrink-0 mt-0.5 text-orange-700" />
              <div>
                <h3 className="font-semibold text-charcoal mb-2">Repo Protection</h3>
                <p className="text-charcoal-400 text-sm leading-relaxed">
                  Repossession tows face the highest false damage claim rates in the industry.
                  FleetProof captures the pre-repo vehicle condition, authorization number, and optional law enforcement witness signature —
                  the complete evidentiary record for hostile-owner disputes.
                </p>
                <p className="text-sm font-semibold text-orange-700 mt-2">Hostile-owner documentation built in</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI callout */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="border border-forest-200 bg-forest-50 rounded-2xl p-8 text-center">
          <Star className="w-8 h-8 text-forest-800 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-charcoal mb-6">The Math Is Obvious</h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-surface-border p-4">
              <p className="text-2xl font-bold text-red-700">$2,000</p>
              <p className="text-sm text-charcoal-400 mt-1">Average tow damage claim</p>
            </div>
            <div className="bg-white rounded-xl border border-surface-border p-4">
              <p className="text-2xl font-bold text-charcoal">6–12</p>
              <p className="text-sm text-charcoal-400 mt-1">False claims per truck / year</p>
            </div>
            <div className="bg-white rounded-xl border border-surface-border p-4">
              <p className="text-2xl font-bold text-forest-800">$39/mo</p>
              <p className="text-sm text-charcoal-400 mt-1">FleetProof per truck</p>
            </div>
          </div>
          <p className="text-charcoal text-lg font-medium">
            One prevented false claim pays for <span className="text-forest-800 font-bold">4 years</span> of FleetProof.
          </p>
          <p className="text-charcoal-400 text-sm mt-2">One prevented insurance premium increase might pay for a decade.</p>
        </div>
      </section>

      {/* What&apos;s captured */}
      <section className="bg-surface-muted border-y border-surface-border py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center text-charcoal mb-3">Everything Captured in 30 Seconds</h2>
          <p className="text-center text-charcoal-400 mb-10">Tow-specific documentation built for your workflow</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { emoji: '📸', title: '4 Condition Photos', desc: 'Front, back, left, right — all 4 angles before hook-up' },
              { emoji: '🔢', title: 'License Plate + Photo', desc: 'Plate captured with optional camera photo for verification' },
              { emoji: '🔩', title: 'VIN Documentation', desc: 'VIN entry + photo of the VIN sticker or plate' },
              { emoji: '🪝', title: 'Hook-Up Point', desc: 'Where the vehicle was connected — your protection against frame damage claims' },
              { emoji: '🔑', title: 'Keys Status', desc: 'With owner / in ignition / not available — all documented' },
              { emoji: '✍️', title: 'Witness Signature', desc: 'Officer, lot attendant, or property manager signs digitally on your phone' },
              { emoji: '📋', title: 'Police Report Number', desc: 'Impound case number or authorization linked to the record' },
              { emoji: '⏱️', title: 'Timestamp + GPS', desc: 'Automatic timestamp on every record — tamper-evident' },
              { emoji: '📄', title: 'PDF Export', desc: 'Professional report for disputes, insurance, legal use' },
            ].map((item, i) => (
              <div key={i} className="card">
                <div className="text-2xl mb-2">{item.emoji}</div>
                <h3 className="font-semibold text-charcoal mb-1">{item.title}</h3>
                <p className="text-sm text-charcoal-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-charcoal mb-3">Simple Towing Pricing</h2>
        <p className="text-center text-charcoal-400 mb-12">14-day free trial. No contracts. Cancel anytime.</p>
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="card flex flex-col">
            <h3 className="font-bold text-charcoal text-xl">Single Truck</h3>
            <p className="text-charcoal-400 text-sm mt-1">Owner-operator or one truck</p>
            <p className="text-4xl font-bold text-forest-800 mt-4">$39<span className="text-lg text-charcoal-400">/mo</span></p>
            <ul className="mt-5 space-y-2.5 flex-1">
              {[
                '1 tow truck',
                'Unlimited tow logs',
                'Pre-tow photo documentation',
                'Plate & VIN capture',
                'Witness / officer signature',
                'Hook-up documentation',
                'AI damage comparison',
                'PDF dispute reports',
              ].map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-charcoal-600">
                  <CheckCircle className="w-4 h-4 text-forest-800 flex-shrink-0 mt-0.5" />{f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup" className="mt-6 btn-secondary block text-center py-3 rounded-lg font-semibold">
              Start Free Trial
            </Link>
          </div>

          <div className="card flex flex-col border-2 border-forest-800/30 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-forest-800 text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>
            <h3 className="font-bold text-charcoal text-xl">Towing Company</h3>
            <p className="text-charcoal-400 text-sm mt-1">Unlimited trucks, all operators</p>
            <p className="text-4xl font-bold text-forest-800 mt-4">$99<span className="text-lg text-charcoal-400">/mo</span></p>
            <ul className="mt-5 space-y-2.5 flex-1">
              {[
                'Unlimited tow trucks',
                'Everything in Single Truck',
                'Multiple drivers / operators',
                'Driver incident history',
                'Shift summary reports',
                'Insurance export package',
                'Priority support',
              ].map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-charcoal-600">
                  <CheckCircle className="w-4 h-4 text-forest-800 flex-shrink-0 mt-0.5" />{f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup" className="mt-6 btn-primary block text-center py-3 rounded-lg font-semibold">
              Start Free Trial
            </Link>
          </div>
        </div>
        <p className="text-center text-charcoal-400 text-sm mt-6">
          Also available: FleetProof for golf courses, resorts, and campus fleets —{' '}
          <Link href="/" className="text-forest-800 hover:text-forest-700 underline">see all plans</Link>
        </p>
      </section>

      {/* FAQ */}
      <section className="bg-surface-muted border-y border-surface-border py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center text-charcoal mb-10">Towing FAQ</h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="card bg-white">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex items-center justify-between w-full text-left gap-4">
                  <span className="font-semibold text-charcoal">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-forest-800 flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-charcoal-400 flex-shrink-0" />}
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
          <h2 className="text-3xl font-bold mb-3">Your Next Tow Is Coming</h2>
          <p className="text-forest-100 text-lg mb-2">Will you have 30 seconds of documentation that could prevent a $2,000 claim?</p>
          <p className="text-forest-200 text-sm mb-6">14-day free trial · $39/truck · No contract · Cancel anytime</p>
          <Link href="/auth/signup" className="bg-white text-forest-800 hover:bg-forest-50 font-bold text-base px-8 py-3 rounded-lg inline-block transition-colors">
            Start Your Free 14-Day Trial
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
            <Link href="/" className="hover:text-charcoal">Fleet Plans</Link>
            <Link href="/auth/login" className="hover:text-charcoal">Log in</Link>
            <Link href="/auth/signup" className="hover:text-charcoal">Sign up</Link>
          </div>
          <p className="text-charcoal-200 text-sm">© 2026 FleetProof. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
