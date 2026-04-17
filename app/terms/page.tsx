import Link from 'next/link'
import { Truck } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service | FleetProof',
}

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-charcoal mb-2">Terms of Service</h1>
        <p className="text-charcoal-400 text-sm mb-10">Last updated: April 17, 2026</p>

        <div className="prose prose-sm max-w-none text-charcoal space-y-8">

          <section>
            <h2 className="text-xl font-semibold text-charcoal mb-3">1. Agreement to Terms</h2>
            <p className="text-charcoal-600 leading-relaxed">
              These Terms of Service ("Terms") constitute a legally binding agreement between you and Ashward Group LLC
              ("Company," "we," "us," or "our") governing your access to and use of FleetProof, available at
              fleetproof.io (the "Service"). By accessing or using the Service, you agree to be bound by these Terms.
              If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-charcoal mb-3">2. Description of Service</h2>
            <p className="text-charcoal-600 leading-relaxed">
              FleetProof is a fleet condition documentation platform that enables businesses to capture, store, and
              analyze vehicle condition via photo evidence at the time of checkout and return. The Service uses
              AI-powered image analysis (via Anthropic Claude Vision) to detect condition changes between sessions and
              generate documentation reports. FleetProof is intended solely for vehicle condition documentation
              purposes and does not constitute legal advice, insurance advice, or a guarantee of any legal outcome.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-charcoal mb-3">3. Subscriptions and Billing</h2>
            <p className="text-charcoal-600 leading-relaxed mb-3">
              FleetProof is offered on a monthly subscription basis. By subscribing, you authorize Ashward Group LLC
              to charge your payment method on a recurring monthly basis until you cancel.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-charcoal-600">
              <li>
                <strong>Auto-Renewal:</strong> All subscriptions automatically renew at the end of each billing period
                at the then-current rate. You will receive no separate notice before each renewal charge. It is your
                responsibility to cancel before the renewal date if you do not wish to continue.
              </li>
              <li>
                <strong>Free Trial:</strong> New accounts receive a 14-day free trial. No credit card is required to
                start a trial. If you add a payment method and do not cancel before the trial ends, your subscription
                will begin and your card will be charged.
              </li>
              <li>
                <strong>Cancellation:</strong> You may cancel your subscription at any time from your billing settings.
                Cancellation takes effect at the end of the current paid period.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-charcoal mb-3">4. Refund Policy</h2>
            <p className="text-charcoal-600 leading-relaxed">
              All subscription fees are non-refundable. We do not provide refunds or credits for partial months of
              service, unused features, or for periods during which the Service was available but not used. If you
              believe you were charged in error, contact us at{' '}
              <a href="mailto:joel@ashwardgroup.com" className="text-forest-800 hover:underline">
                joel@ashwardgroup.com
              </a>{' '}
              within 30 days of the charge and we will review your case.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-charcoal mb-3">5. Photo Evidence and Data Storage</h2>
            <p className="text-charcoal-600 leading-relaxed">
              FleetProof stores vehicle inspection photos and associated session data on your behalf for the purpose
              of condition documentation. You are solely responsible for the accuracy of the documentation you create.
              FleetProof does not verify the completeness of any inspection and makes no representations about the
              sufficiency of any documentation for legal, insurance, or other purposes. AI-generated condition
              analyses are provided for informational purposes only and are not a substitute for professional judgment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-charcoal mb-3">6. Acceptable Use</h2>
            <p className="text-charcoal-600 leading-relaxed mb-3">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2 text-charcoal-600">
              <li>Use the Service for any unlawful purpose or in violation of any applicable laws or regulations</li>
              <li>Upload content that is defamatory, fraudulent, obscene, or infringes any third-party rights</li>
              <li>Attempt to reverse-engineer, decompile, or extract source code from the Service</li>
              <li>Resell or sublicense access to the Service without written permission</li>
              <li>Use automated tools to scrape or extract data from the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-charcoal mb-3">7. Intellectual Property</h2>
            <p className="text-charcoal-600 leading-relaxed">
              The Service, including its design, code, and content, is owned by Ashward Group LLC and protected by
              applicable intellectual property laws. You retain ownership of your data (photos, vehicle records,
              session reports) and grant Ashward Group LLC a limited license to store and process that data solely
              to provide the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-charcoal mb-3">8. Disclaimer of Warranties</h2>
            <p className="text-charcoal-600 leading-relaxed">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED,
              INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
              NON-INFRINGEMENT. ASHWARD GROUP LLC DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE,
              OR THAT ANY DEFECTS WILL BE CORRECTED.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-charcoal mb-3">9. Limitation of Liability</h2>
            <p className="text-charcoal-600 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, ASHWARD GROUP LLC SHALL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, DATA LOSS, OR BUSINESS
              INTERRUPTION, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY FOR ANY CLAIM
              ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID TO US
              IN THE 12 MONTHS PRECEDING THE CLAIM.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-charcoal mb-3">10. Termination</h2>
            <p className="text-charcoal-600 leading-relaxed">
              We reserve the right to suspend or terminate your account at any time for violation of these Terms or
              for any other reason at our sole discretion, with or without notice. Upon termination, your right to
              access the Service ceases immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-charcoal mb-3">11. Governing Law and Disputes</h2>
            <p className="text-charcoal-600 leading-relaxed">
              These Terms are governed by and construed in accordance with the laws of the State of Oregon, without
              regard to its conflict of law provisions. Any disputes arising under these Terms shall be resolved
              exclusively in the state or federal courts located in Oregon, and you consent to personal jurisdiction
              in those courts.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-charcoal mb-3">12. Changes to Terms</h2>
            <p className="text-charcoal-600 leading-relaxed">
              We may update these Terms from time to time. When we do, we will update the "Last updated" date above.
              Continued use of the Service after changes constitute your acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-charcoal mb-3">13. Contact</h2>
            <p className="text-charcoal-600 leading-relaxed">
              For questions about these Terms, contact Ashward Group LLC at:{' '}
              <a href="mailto:joel@ashwardgroup.com" className="text-forest-800 hover:underline">
                joel@ashwardgroup.com
              </a>
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
