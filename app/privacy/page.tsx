import Link from 'next/link'
import { Truck } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy | FleetProof',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-charcoal">
      {/* Nav */}
      <nav className="border-b border-surface-border bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Truck className="w-6 h-6 text-forest-800" />
            <span className="text-xl font-bold text-charcoal">FleetProof</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-bold text-charcoal mb-2">Privacy Policy</h1>
        <p className="text-charcoal-400 text-sm mb-10">Last updated: April 17, 2026</p>

        <div className="prose prose-sm max-w-none text-charcoal space-y-8">

          <section>
            <h2 className="text-xl font-semibold text-charcoal mb-3">1. Overview</h2>
            <p className="text-charcoal-600 leading-relaxed">
              Ashward Group LLC ("we," "us," or "our") operates FleetProof (fleetproof.io). This Privacy Policy
              explains what data we collect, how we use it, and your rights regarding that data. By using FleetProof,
              you agree to the practices described here.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-charcoal mb-3">2. Data We Collect</h2>

            <h3 className="text-base font-semibold text-charcoal mb-2 mt-4">Account Information</h3>
            <p className="text-charcoal-600 leading-relaxed">
              When you create an account, we collect your name, email address, organization name, and billing
              information (processed by Stripe — we do not store raw card numbers).
            </p>

            <h3 className="text-base font-semibold text-charcoal mb-2 mt-4">Vehicle and Fleet Data</h3>
            <p className="text-charcoal-600 leading-relaxed">
              We store vehicle records you create: vehicle name, type, identifier, QR code association, and any
              notes you add. This data is tied to your account.
            </p>

            <h3 className="text-base font-semibold text-charcoal mb-2 mt-4">Inspection Photos</h3>
            <p className="text-charcoal-600 leading-relaxed">
              Photos captured during checkout and return sessions are uploaded and stored in our cloud storage
              (Supabase). These photos are associated with the specific session, vehicle, and driver record.
              Photos are analyzed by Anthropic Claude Vision to detect condition changes — images are sent to
              Anthropic's API for analysis and are subject to Anthropic's data handling practices. We do not
              use your photos for model training.
            </p>

            <h3 className="text-base font-semibold text-charcoal mb-2 mt-4">Session and Driver Records</h3>
            <p className="text-charcoal-600 leading-relaxed">
              Each checkout and return session logs: timestamp, driver name (as entered by your attendant),
              vehicle identifier, session duration, and AI-generated condition analysis.
            </p>

            <h3 className="text-base font-semibold text-charcoal mb-2 mt-4">QR Code Scan Logs</h3>
            <p className="text-charcoal-600 leading-relaxed">
              When a vehicle QR code is scanned to initiate a session, we log the scan event with a timestamp
              and vehicle ID. We do not collect device identifiers or location data from QR scans.
            </p>

            <h3 className="text-base font-semibold text-charcoal mb-2 mt-4">Usage Data</h3>
            <p className="text-charcoal-600 leading-relaxed">
              We collect standard server logs including IP addresses, browser type, and pages visited for
              security and performance purposes. This data is not sold or shared for advertising.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-charcoal mb-3">3. How We Use Your Data</h2>
            <ul className="list-disc pl-5 space-y-2 text-charcoal-600">
              <li>To provide and operate the FleetProof service</li>
              <li>To process payments and manage your subscription</li>
              <li>To generate AI-powered condition analysis and session reports</li>
              <li>To send transactional emails (account confirmation, billing receipts)</li>
              <li>To troubleshoot issues and improve the Service</li>
              <li>To comply with legal obligations</li>
            </ul>
            <p className="text-charcoal-600 leading-relaxed mt-3">
              We do not sell your data. We do not use your data for behavioral advertising.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-charcoal mb-3">4. Third-Party Services</h2>
            <p className="text-charcoal-600 leading-relaxed mb-3">
              FleetProof relies on the following third-party providers to operate. Each has its own privacy practices:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-charcoal-600">
              <li>
                <strong>Supabase</strong> — Database, file storage, and authentication provider. Data is stored
                in Supabase-managed infrastructure. See{' '}
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-forest-800 hover:underline">
                  supabase.com/privacy
                </a>.
              </li>
              <li>
                <strong>Stripe</strong> — Payment processing. Stripe handles all billing data and is PCI-DSS
                compliant. See{' '}
                <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-forest-800 hover:underline">
                  stripe.com/privacy
                </a>.
              </li>
              <li>
                <strong>Anthropic</strong> — AI image analysis via Claude Vision API. Inspection photos are
                sent to Anthropic for condition analysis. See{' '}
                <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-forest-800 hover:underline">
                  anthropic.com/privacy
                </a>.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-charcoal mb-3">5. Data Retention</h2>
            <p className="text-charcoal-600 leading-relaxed">
              We retain your account data and inspection records for as long as your account is active. If you
              cancel your subscription, your data is retained for 90 days before permanent deletion to allow
              for account recovery. After 90 days, all associated data including photos, session records, and
              vehicle data is deleted from our systems.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-charcoal mb-3">6. Your Rights</h2>
            <p className="text-charcoal-600 leading-relaxed mb-3">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-2 text-charcoal-600">
              <li><strong>Access</strong> — Request a copy of the data we hold about you</li>
              <li><strong>Correction</strong> — Request correction of inaccurate data</li>
              <li><strong>Deletion</strong> — Request deletion of your account and all associated data</li>
              <li><strong>Portability</strong> — Request your data in a machine-readable format</li>
            </ul>
            <p className="text-charcoal-600 leading-relaxed mt-3">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:joel@ashwardgroup.com" className="text-forest-800 hover:underline">
                joel@ashwardgroup.com
              </a>. We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-charcoal mb-3">7. Security</h2>
            <p className="text-charcoal-600 leading-relaxed">
              We use industry-standard security measures including HTTPS encryption, row-level security in our
              database, and access controls to protect your data. No method of transmission over the Internet
              is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-charcoal mb-3">8. Children's Privacy</h2>
            <p className="text-charcoal-600 leading-relaxed">
              FleetProof is not directed at children under 13 and we do not knowingly collect data from children
              under 13. If you believe we have inadvertently collected such data, contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-charcoal mb-3">9. Changes to This Policy</h2>
            <p className="text-charcoal-600 leading-relaxed">
              We may update this Privacy Policy periodically. The "Last updated" date at the top reflects the
              most recent revision. Continued use of the Service after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-charcoal mb-3">10. Contact</h2>
            <p className="text-charcoal-600 leading-relaxed">
              Privacy questions or data requests:{' '}
              <a href="mailto:joel@ashwardgroup.com" className="text-forest-800 hover:underline">
                joel@ashwardgroup.com
              </a>
              <br />
              Ashward Group LLC
            </p>
          </section>

        </div>
      </main>

      <footer className="bg-white border-t border-surface-border py-8 mt-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-charcoal-200 text-sm">© 2026 Ashward Group LLC. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-charcoal-400">
            <Link href="/terms" className="hover:text-charcoal">Terms</Link>
            <Link href="/privacy" className="hover:text-charcoal">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
