import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'FleetProof — Vehicle Condition Documentation for Fleets',
  description: 'Document vehicle condition at checkout and return in 15 seconds. AI identifies new damage and attributes it to the responsible driver.',
  keywords: 'fleet management, vehicle condition documentation, golf cart damage, fleet damage tracking, cart condition report',
  openGraph: {
    title: 'FleetProof — Every Cart Returns. Not Every Cart Returns Undamaged.',
    description: 'Document vehicle condition at checkout and return in 15 seconds. AI shows exactly who caused the damage and when.',
    type: 'website',
    url: 'https://fleetproof.io',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} bg-surface text-charcoal antialiased`}>
        {children}
      </body>
    </html>
  )
}
