'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Briefcase, History } from 'lucide-react'

const NAV = [
  { href: '/client',         label: 'My Requests', icon: LayoutDashboard },
  { href: '/client/active',  label: 'Active Jobs',  icon: Briefcase },
  { href: '/client/history', label: 'History',      icon: History },
]

export function ClientNav() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 p-3 space-y-0.5">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ${
              active
                ? 'bg-amber-50 text-amber-700 font-medium'
                : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
            }`}
          >
            <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-amber-600' : ''}`} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
