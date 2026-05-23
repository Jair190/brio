'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Wrench, Menu, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

type User = {
  full_name: string | null
  role: string | null
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          full_name: data.user.user_metadata?.full_name ?? null,
          role: data.user.user_metadata?.role ?? 'client',
        })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          full_name: session.user.user_metadata?.full_name ?? null,
          role: session.user.user_metadata?.role ?? 'client',
        })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setDropdownOpen(false)
    router.push('/')
    router.refresh()
  }

  const firstName = user?.full_name?.split(' ')[0] ?? 'Account'
  const dashboardHref = user?.role === 'tradesman' ? '/tradesman' : '/client'

  return (
    <nav className="border-b border-slate-200/60 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-lg text-slate-900">
          <Wrench className="h-5 w-5 text-blue-600" />
          Brio
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-6">
          <Link href="/#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200">
            How it works
          </Link>
          <Link href="/signup/tradesman" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200">
            For Plumbers
          </Link>
          <Link href="/beta" className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors duration-200">
            Dev
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors duration-200"
              >
                <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                  {firstName[0].toUpperCase()}
                </div>
                {firstName}
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
                  <Link
                    href={dashboardHref}
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="transition-colors duration-200">Log in</Button>
              </Link>
              <Link href="/founders">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200">
                  About us
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="sm:hidden p-2 transition-colors duration-200"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden border-t border-slate-200/60 bg-white px-4 py-4 space-y-3">
          <Link href="/#how-it-works" className="block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-150" onClick={() => setOpen(false)}>
            How it works
          </Link>
          <Link href="/signup/tradesman" className="block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-150" onClick={() => setOpen(false)}>
            For Plumbers
          </Link>
          <Link href="/beta" className="block text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors duration-150" onClick={() => setOpen(false)}>
            Dev
          </Link>

          {user ? (
            <>
              <div className="text-sm font-medium text-slate-700 py-1">Hi, {firstName}</div>
              <Link href={dashboardHref} onClick={() => setOpen(false)}>
                <Button variant="outline" size="sm" className="w-full justify-start">Dashboard</Button>
              </Link>
              <button onClick={handleSignOut} className="w-full text-left text-sm font-medium text-slate-600 hover:text-slate-900 py-1 transition-colors">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start transition-colors duration-200">Log in</Button>
              </Link>
              <Link href="/founders" onClick={() => setOpen(false)}>
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200">About us</Button>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
