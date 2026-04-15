'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Car, ClipboardList, Users, FileText, Settings, CreditCard, Truck, Menu, X, LogOut, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase'

const NAV = [
  { label: 'Fleet Dashboard', href: '/dashboard', icon: Home },
  { label: 'Vehicles', href: '/dashboard/fleet', icon: Car },
  { label: 'Sessions', href: '/dashboard/sessions', icon: ClipboardList },
  { label: 'Drivers', href: '/dashboard/drivers', icon: Users },
  { label: 'Reports', href: '/dashboard/reports', icon: FileText },
  { label: 'Locations', href: '/dashboard/locations/new', icon: MapPin },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
]

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  function NavLinks({ onClick }: { onClick?: () => void }) {
    return (
      <>
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href.replace('/new', '')))
          return (
            <Link
              key={href}
              href={href}
              onClick={onClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-forest-100 text-forest-800 border border-forest-200'
                  : 'text-charcoal-600 hover:text-charcoal hover:bg-surface-muted'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </>
    )
  }

  return (
    <div className="flex h-screen bg-surface-muted overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-surface-border flex-shrink-0">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-surface-border">
          <Truck className="w-6 h-6 text-forest-800 flex-shrink-0" />
          <span className="text-lg font-bold text-charcoal">FleetProof</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <NavLinks />
        </nav>
        <div className="px-3 py-4 border-t border-surface-border">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-charcoal-400 hover:text-charcoal hover:bg-surface-muted transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex flex-col w-72 max-w-[85vw] bg-white border-r border-surface-border h-full">
            <div className="flex items-center justify-between px-5 py-5 border-b border-surface-border">
              <div className="flex items-center gap-2.5">
                <Truck className="w-6 h-6 text-forest-800" />
                <span className="text-lg font-bold text-charcoal">FleetProof</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-charcoal-400 hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              <NavLinks onClick={() => setMobileOpen(false)} />
            </nav>
            <div className="px-3 py-4 border-t border-surface-border">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-charcoal-400 hover:text-charcoal hover:bg-surface-muted transition-colors w-full"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex md:hidden items-center justify-between px-4 py-3 bg-white border-b border-surface-border">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-forest-800" />
            <span className="font-bold text-charcoal">FleetProof</span>
          </div>
          <button onClick={() => setMobileOpen(true)} className="text-charcoal-400 hover:text-charcoal">
            <Menu className="w-6 h-6" />
          </button>
        </div>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
