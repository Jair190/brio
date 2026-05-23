'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Wrench, User, HardHat, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center gap-2 font-bold text-white text-xl mb-10">
        <Wrench className="h-5 w-5 text-blue-400" />
        Brio
      </Link>

      <div className="w-full max-w-sm space-y-4">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-white">Development Access</h1>
          <p className="text-slate-400 text-sm mt-1">Choose a side to preview, then enter the access code.</p>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole('client')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${
              role === 'client'
                ? 'border-blue-500 bg-blue-600/20 text-white shadow-md ring-2 ring-blue-500/50'
                : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500 hover:text-slate-300'
            }`}
          >
            <User className="h-7 w-7" />
            <span className="text-sm font-medium">Client</span>
            <span className="text-xs opacity-60">Describe your issue and get AI triage</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('tradesman')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${
              role === 'tradesman'
                ? 'border-blue-500 bg-blue-600/20 text-white shadow-md ring-2 ring-blue-500/50'
                : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500 hover:text-slate-300'
            }`}
          >
            <HardHat className="h-7 w-7" />
            <span className="text-sm font-medium">Contractor</span>
            <span className="text-xs opacity-60">View and manage job leads</span>
          </button>
        </div>

        {/* Password form */}
        <form onSubmit={handleSubmit} className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-slate-300 text-sm">Access code</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter access code"
              autoFocus
              className="bg-slate-900/80 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/30 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
            disabled={isPending || !role}
          >
            {isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Entering…</>
            ) : (
              <>Enter {role ? (role === 'client' ? 'Client' : 'Contractor') : ''} view <ArrowRight className="h-4 w-4 ml-2" /></>
            )}
          </Button>

          {!role && (
            <p className="text-center text-xs text-slate-500">Select a view above first</p>
          )}
        </form>
      </div>

      <p className="text-slate-600 text-xs mt-8">Bay Area · Private Beta · 2025</p>
    </div>
  )
}
