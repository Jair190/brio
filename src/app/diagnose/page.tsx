'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import {
  ChevronRight,
  Loader2,
  Wrench,
  AlertTriangle,
  ShoppingCart,
  RotateCcw,
} from 'lucide-react'
import { runGuestTriage } from '@/lib/ai/guest-actions'
import type { TriageOutput } from '@/lib/ai/triage'
import Navbar from '@/components/layout/Navbar'

const schema = z.object({
  description: z.string().min(20, 'Please describe your issue in a bit more detail'),
  urgency: z.enum(['low', 'medium', 'high', 'emergency']),
})

type FormValues = z.infer<typeof schema>

const URGENCY_LABELS: Record<string, string> = {
  low: 'Not urgent — whenever is fine',
  medium: 'Soon — within a few days',
  high: 'Urgent — within 24 hours',
  emergency: 'Emergency — right now',
}

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-stone-500 text-sm focus:outline-none focus:border-amber-600/60 transition-all duration-200"

export default function DiagnosePage() {
  const [result, setResult] = useState<TriageOutput | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { urgency: 'medium' },
  })

  function onSubmit(values: FormValues) {
    setSubmitError(null)
    startTransition(async () => {
      try {
        const output = await runGuestTriage(values.description, values.urgency)
        setResult(output)
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      }
    })
  }

  return (
    <div className="min-h-screen relative" style={{ background: '#0C0A09' }}>
      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundSize: '200px 200px' }}
      />

      {/* Copper glow */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-20"
        style={{ background: 'radial-gradient(ellipse at center top, #C26D21 0%, transparent 70%)' }}
      />

      <Navbar />

      <main className="relative max-w-xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-[0.2em] text-amber-600 uppercase mb-3">Free AI Diagnosis</p>
          <h1 className="font-display text-3xl font-bold text-white">What&apos;s going wrong?</h1>
          <p className="text-stone-400 mt-2 text-sm">
            Describe your plumbing issue — get expert guidance instantly, no account needed.
          </p>
        </div>

        {!result ? (
          <div className="rounded-2xl p-6 space-y-5" style={{ background: '#1A1714', border: '1px solid rgba(255,255,255,0.08)' }}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-stone-400 mb-1.5">
                  Describe your issue <span className="text-amber-600">*</span>
                </label>
                <textarea
                  placeholder="e.g. My kitchen sink is leaking under the cabinet and there's water pooling on the floor…"
                  rows={4}
                  className={inputCls + ' resize-none'}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-xs text-red-400 mt-1.5">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-400 mb-1.5">How urgent is this?</label>
                <select
                  defaultValue="medium"
                  onChange={e => setValue('urgency', e.target.value as FormValues['urgency'])}
                  className={inputCls + ' cursor-pointer appearance-none'}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23737373' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center' }}
                >
                  {Object.entries(URGENCY_LABELS).map(([val, label]) => (
                    <option key={val} value={val} style={{ background: '#1C1A17', color: '#fff' }}>{label}</option>
                  ))}
                </select>
              </div>

              {submitError && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{submitError}</p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-all duration-200"
              >
                {isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing your issue…</>
                ) : (
                  <>Get free diagnosis <ChevronRight className="h-4 w-4" /></>
                )}
              </button>

              <p className="text-center text-xs text-stone-600">No account needed. Results are instant.</p>
            </form>
          </div>
        ) : (
          <TriageResult output={result} onReset={() => setResult(null)} />
        )}
      </main>
    </div>
  )
}

function TriageResult({ output, onReset }: { output: TriageOutput; onReset: () => void }) {
  const { triage, estimated_cost_min, estimated_cost_max } = output
  const isDiy = triage.recommended_action === 'diy'

  const cardCls = "rounded-2xl p-5 space-y-4"
  const cardStyle = { background: '#1A1714', border: '1px solid rgba(255,255,255,0.08)' }

  return (
    <div className="space-y-4">
      {/* Recommendation banner */}
      <div
        className="rounded-2xl p-4 flex items-start gap-3"
        style={isDiy
          ? { background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }
          : { background: 'rgba(217,119,6,0.10)', border: '1px solid rgba(217,119,6,0.25)' }
        }
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={isDiy ? { background: 'rgba(34,197,94,0.15)' } : { background: 'rgba(217,119,6,0.15)' }}
        >
          {isDiy
            ? <ShoppingCart className="h-4 w-4 text-green-400" />
            : <Wrench className="h-4 w-4 text-amber-400" />
          }
        </div>
        <div>
          <p className={`text-sm font-semibold ${isDiy ? 'text-green-300' : 'text-amber-300'}`}>
            {isDiy ? 'You may be able to fix this yourself' : 'A licensed plumber is recommended'}
          </p>
          <p className={`text-xs mt-0.5 capitalize ${isDiy ? 'text-green-500' : 'text-amber-600'}`}>
            Complexity: {triage.estimated_complexity}
          </p>
        </div>
      </div>

      {/* Diagnosis */}
      <div className={cardCls} style={cardStyle}>
        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-stone-500 mb-2">AI Diagnosis</p>
          <p className="text-sm text-stone-300 leading-relaxed">{triage.diagnosis}</p>
        </div>

        {/* Cost estimate */}
        {!isDiy && estimated_cost_min != null && estimated_cost_max != null && (
          <div className="pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] font-semibold tracking-widest uppercase text-stone-500 mb-1">Estimated Cost (Bay Area)</p>
            <p className="text-2xl font-bold text-white">${estimated_cost_min}–${estimated_cost_max}</p>
            <p className="text-xs text-stone-600 mt-0.5">Labor + parts. Final price set by your plumber.</p>
          </div>
        )}
      </div>

      {/* DIY steps */}
      {isDiy && triage.diy_steps && triage.diy_steps.length > 0 && (
        <div className={cardCls} style={cardStyle}>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-stone-500">Steps to fix it</p>
          <ol className="space-y-3">
            {triage.diy_steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-stone-300">
                <span className="shrink-0 w-5 h-5 rounded-full bg-amber-600/20 border border-amber-600/30 text-amber-400 text-xs font-semibold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Parts needed */}
      {isDiy && triage.parts_needed && triage.parts_needed.length > 0 && (
        <div className={cardCls} style={cardStyle}>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-stone-500 flex items-center gap-1.5">
            <ShoppingCart className="h-3 w-3" /> Parts you&apos;ll need
          </p>
          <ul className="space-y-2">
            {triage.parts_needed.map((part, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm text-stone-300">
                <span className="h-1 w-1 rounded-full bg-amber-600 shrink-0" />
                {part}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {triage.warnings && triage.warnings.length > 0 && (
        <div className="rounded-2xl p-4 space-y-2" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-red-400 flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3" /> Heads up
          </p>
          <ul className="space-y-1.5">
            {triage.warnings.map((w, i) => (
              <li key={i} className="text-sm text-red-300">{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA */}
      {isDiy ? (
        <div className="rounded-2xl p-5 text-center space-y-3" style={{ background: '#1A1714', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-sm text-stone-400">Want to save this or get a second opinion from a pro?</p>
          <Link
            href="/signup/client"
            className="flex items-center justify-center gap-2 w-full bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-all duration-200"
          >
            Create a free account
          </Link>
          <Link href="/" className="block text-xs text-stone-600 hover:text-stone-400 transition-colors duration-150">
            No thanks, I&apos;m good
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl p-5 text-center space-y-3" style={{ background: 'rgba(217,119,6,0.10)', border: '1px solid rgba(217,119,6,0.25)' }}>
          <Wrench className="h-6 w-6 mx-auto text-amber-500" />
          <p className="font-display font-bold text-white">Ready to book a licensed plumber?</p>
          <p className="text-sm text-stone-400">
            Create a free account to get matched with vetted Bay Area plumbers — usually within the hour.
          </p>
          <Link
            href="/signup/client"
            className="flex items-center justify-center gap-2 w-full bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-all duration-200"
          >
            Book a plumber — it&apos;s free to start
          </Link>
          <Link href="/login" className="block text-xs text-stone-600 hover:text-stone-400 transition-colors duration-150">
            Already have an account? Sign in
          </Link>
        </div>
      )}

      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-2 text-sm text-stone-600 hover:text-stone-400 py-2 transition-colors duration-150"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Diagnose a different issue
      </button>
    </div>
  )
}
