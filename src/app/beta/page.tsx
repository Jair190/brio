'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { User, HardHat, ArrowRight, Loader2 } from 'lucide-react'
import { submitBetaPassword } from './actions'

type Role = 'client' | 'tradesman'

export default function BetaPage() {
  const [role, setRole] = useState<Role | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!role) return
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('role', role)
    startTransition(async () => {
      const result = await submitBetaPassword(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="min-h-screen grain flex flex-col items-center justify-center px-6" style={{ background: '#0C0A09' }}>
      <div className="bg-grid absolute inset-0" />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(ellipse, #C26D21 0%, transparent 70%)' }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-7 h-7 rounded-md bg-amber-600 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 7C2 4.24 4.24 2 7 2C8.1 2 9.12 2.36 9.93 2.97L3.97 8.93C3.36 8.12 3 7.1 3 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M12 7C12 9.76 9.76 12 7 12C5.9 12 4.88 11.64 4.07 11.03L10.03 5.07C10.64 5.88 11 6.9 11 8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-display font-bold text-white text-lg tracking-tight">Brio</span>
        </Link>

        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-white mb-1.5">Development Access</h1>
          <p className="text-stone-400 text-sm">Choose a view to preview, then enter the access code.</p>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {([
            { value: 'client' as Role, icon: User, label: 'Client', sub: 'Get AI triage & find plumbers' },
            { value: 'tradesman' as Role, icon: HardHat, label: 'Contractor', sub: 'Manage jobs & CRM' },
          ]).map(({ value, icon: Icon, label, sub }) => (
            <button
              key={value}
              type="button"
              onClick={() => setRole(value)}
              className={`flex flex-col items-center gap-2.5 p-5 rounded-xl border-2 transition-all duration-200 ${
                role === value
                  ? 'border-amber-600 bg-amber-600/10 text-white'
                  : 'border-white/8 bg-white/4 text-stone-400 hover:border-white/15 hover:text-stone-200'
              }`}
            >
              <Icon className="h-6 w-6" />
              <div className="text-center">
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-stone-400 mt-0.5 leading-snug">{sub}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Password form */}
        <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-stone-300">Access code</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter access code"
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-stone-500 text-sm focus:outline-none focus:border-amber-600/60 transition-all duration-200"
            />
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-900/40 rounded-xl px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || !role}
            className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2"
          >
            {isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Entering…</>
            ) : (
              <>Enter {role ? (role === 'client' ? 'Client' : 'Contractor') : ''} view <ArrowRight className="h-4 w-4" /></>
            )}
          </button>

          {!role && (
            <p className="text-center text-xs text-stone-400">Select a view above first</p>
          )}
        </form>
      </div>

      <p className="relative z-10 text-stone-500 text-xs mt-10">Bay Area · Private Beta · 2025</p>
    </div>
  )
}
