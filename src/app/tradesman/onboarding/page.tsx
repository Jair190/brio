'use client'

import { useState } from 'react'
import { Building2, Users, Search, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react'
import { createOrganization, searchOrganizations, requestJoinOrganization } from '@/lib/crm/actions'

type Mode = 'choose' | 'create' | 'join'
type JoinStep = 'search' | 'requested'

interface OrgResult {
  id: string
  name: string
  email: string | null
}

function CreateForm() {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)
    const result = await createOrganization(new FormData(e.currentTarget))
    if (result?.error) {
      setError(result.error)
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="name" className="block text-sm font-medium text-stone-300">
          Company name <span className="text-amber-600">*</span>
        </label>
        <input
          id="name" name="name" required
          placeholder="Bay Area Plumbing Co."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-stone-500 text-sm focus:outline-none focus:border-amber-600/60 transition-all duration-200"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="phone" className="block text-sm font-medium text-stone-300">Business phone</label>
        <input
          id="phone" name="phone" type="tel"
          placeholder="(415) 555-0100"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-stone-500 text-sm focus:outline-none focus:border-amber-600/60 transition-all duration-200"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium text-stone-300">Business email</label>
        <input
          id="email" name="email" type="email"
          placeholder="hello@yourcompany.com"
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
        disabled={pending}
        className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2"
      >
        {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</> : 'Create organization & open CRM'}
      </button>
    </form>
  )
}

function JoinForm() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<OrgResult[]>([])
  const [searching, setSearching] = useState(false)
  const [requestingId, setRequestingId] = useState<string | null>(null)
  const [step, setStep] = useState<JoinStep>('search')
  const [error, setError] = useState<string | null>(null)

  async function handleSearch() {
    if (!query.trim()) return
    setSearching(true)
    setResults([])
    const data = await searchOrganizations(query.trim())
    setResults(data)
    setSearching(false)
  }

  async function handleRequest(orgId: string) {
    setRequestingId(orgId)
    setError(null)
    const result = await requestJoinOrganization(orgId)
    if (result?.error) {
      setError(result.error)
      setRequestingId(null)
    } else {
      setStep('requested')
    }
  }

  if (step === 'requested') {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-green-900/20 border border-green-700/30 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-7 w-7 text-green-400" />
        </div>
        <h3 className="font-display text-xl font-bold text-white">Request sent!</h3>
        <p className="text-stone-400 text-sm leading-relaxed max-w-xs mx-auto">
          The company owner will receive your request. You&apos;ll get access once they approve it. You can close this tab for now.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-stone-300">Search by company name</label>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Bay Area Plumbing Co."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-stone-500 text-sm focus:outline-none focus:border-amber-600/60 transition-all duration-200"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching || !query.trim()}
            className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white px-4 py-3 rounded-xl transition-all duration-200 shrink-0"
          >
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-900/40 rounded-xl px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {results.length > 0 && (
        <ul className="space-y-2">
          {results.map(org => (
            <li
              key={org.id}
              className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div>
                <p className="text-white font-medium text-sm">{org.name}</p>
                {org.email && <p className="text-stone-500 text-xs mt-0.5">{org.email}</p>}
              </div>
              <button
                onClick={() => handleRequest(org.id)}
                disabled={requestingId === org.id}
                className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-medium px-4 py-2 rounded-lg transition-all duration-200 shrink-0 flex items-center gap-1.5"
              >
                {requestingId === org.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Request to join'}
              </button>
            </li>
          ))}
        </ul>
      )}

      {!searching && query && results.length === 0 && (
        <p className="text-stone-500 text-sm text-center py-4">
          No companies found matching &ldquo;{query}&rdquo;. Ask your owner to create the company first, or create it yourself.
        </p>
      )}
    </div>
  )
}

export default function OnboardingPage() {
  const [mode, setMode] = useState<Mode>('choose')

  return (
    <div className="min-h-screen relative grain overflow-hidden flex items-center justify-center p-6" style={{ background: '#0C0A09' }}>
      <div className="bg-grid absolute inset-0" />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(ellipse, #C26D21 0%, transparent 70%)' }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-amber-600 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 7C2 4.24 4.24 2 7 2C8.1 2 9.12 2.36 9.93 2.97L3.97 8.93C3.36 8.12 3 7.1 3 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M12 7C12 9.76 9.76 12 7 12C5.9 12 4.88 11.64 4.07 11.03L10.03 5.07C10.64 5.88 11 6.9 11 8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-display font-bold text-white text-lg tracking-tight">Brio</span>
          </div>
        </div>

        {/* Header text */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome to Brio CRM</h1>
          <p className="text-stone-400 text-sm">
            {mode === 'choose' ? 'Are you setting up a new company or joining an existing one?' :
             mode === 'create' ? 'Create your organization to get started.' :
             'Find your company and request access.'}
          </p>
        </div>

        {/* Mode selector */}
        {mode === 'choose' && (
          <div className="animate-fade-up grid grid-cols-2 gap-4">
            <button
              onClick={() => setMode('create')}
              className="group flex flex-col items-center gap-4 p-7 rounded-2xl text-left transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              onMouseOver={e => (e.currentTarget.style.borderColor = 'rgba(217,119,6,0.4)')}
              onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
            >
              <div className="w-12 h-12 rounded-xl bg-amber-600/15 border border-amber-600/20 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-amber-400" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-white text-sm">Create company</p>
                <p className="text-xs text-stone-500 mt-1">I&apos;m the owner / setting up new</p>
              </div>
            </button>

            <button
              onClick={() => setMode('join')}
              className="group flex flex-col items-center gap-4 p-7 rounded-2xl text-left transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              onMouseOver={e => (e.currentTarget.style.borderColor = 'rgba(217,119,6,0.4)')}
              onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
            >
              <div className="w-12 h-12 rounded-xl bg-stone-700/40 border border-stone-600/30 flex items-center justify-center">
                <Users className="h-6 w-6 text-stone-300" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-white text-sm">Join company</p>
                <p className="text-xs text-stone-500 mt-1">My company is already on Brio</p>
              </div>
            </button>
          </div>
        )}

        {mode !== 'choose' && (
          <div className="animate-fade-up rounded-2xl p-7" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {mode === 'create' ? <CreateForm /> : <JoinForm />}
          </div>
        )}

        {mode !== 'choose' && (
          <button
            onClick={() => setMode('choose')}
            className="mt-5 w-full flex items-center justify-center gap-2 text-sm text-stone-500 hover:text-stone-300 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to options
          </button>
        )}
      </div>
    </div>
  )
}
