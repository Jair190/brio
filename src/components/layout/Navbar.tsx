'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type User = { full_name: string | null; role: string | null }

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser({ full_name: data.user.user_metadata?.full_name ?? null, role: data.user.user_metadata?.role ?? 'client' })
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) setUser({ full_name: session.user.user_metadata?.full_name ?? null, role: session.user.user_metadata?.role ?? 'client' })
      else setUser(null)
    })
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => { subscription.unsubscribe(); window.removeEventListener('scroll', onScroll) }
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
    router.refresh()
  }

  const firstName = user?.full_name?.split(' ')[0] ?? 'Account'
  const dashboardHref = user?.role === 'tradesman' ? '/tradesman' : '/client'

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0C0A09]/95 backdrop-blur-md border-b border-white/5 shadow-xl shadow-black/20' : 'bg-[#0C0A09]'}`}>
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-md bg-amber-600 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 7C2 4.24 4.24 2 7 2C8.1 2 9.12 2.36 9.93 2.97L3.97 8.93C3.36 8.12 3 7.1 3 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M12 7C12 9.76 9.76 12 7 12C5.9 12 4.88 11.64 4.07 11.03L10.03 5.07C10.64 5.88 11 6.9 11 8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-display font-bold text-white text-lg tracking-tight">Brio</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-8">
          <Link href="/founders" className="text-sm text-stone-400 hover:text-white transition-colors duration-200 tracking-wide">
            About
          </Link>
          <Link href="/signup/tradesman" className="text-sm text-stone-400 hover:text-white transition-colors duration-200 tracking-wide">
            For Plumbers
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href={dashboardHref}
                className="text-sm text-stone-300 hover:text-white transition-colors duration-200"
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm text-stone-500 hover:text-stone-300 transition-colors duration-200"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm text-stone-400 hover:text-white transition-colors duration-200"
              >
                Sign in
              </Link>
              <Link
                href="/client/new-request"
                className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200"
              >
                Get a diagnosis
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="sm:hidden p-2 text-stone-400 hover:text-white transition-colors"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden border-t border-white/5 bg-[#0C0A09] px-5 py-5 space-y-4">
          <Link href="/founders" className="block text-sm text-stone-400 hover:text-white transition-colors" onClick={() => setOpen(false)}>About</Link>
          <Link href="/signup/tradesman" className="block text-sm text-stone-400 hover:text-white transition-colors" onClick={() => setOpen(false)}>For Plumbers</Link>
          {user ? (
            <>
              <Link href={dashboardHref} className="block text-sm text-stone-300" onClick={() => setOpen(false)}>Dashboard</Link>
              <button onClick={handleSignOut} className="block text-sm text-stone-500">Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-sm text-stone-400 hover:text-white transition-colors" onClick={() => setOpen(false)}>Sign in</Link>
              <Link href="/client/new-request" onClick={() => setOpen(false)} className="block bg-amber-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg text-center">
                Get a free diagnosis
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
