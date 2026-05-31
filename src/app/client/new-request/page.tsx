'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import {
  Loader2,
  CheckCircle,
  AlertTriangle,
  ShoppingCart,
  ArrowRight,
  ChevronLeft,
} from 'lucide-react'
import { createJobWithTriage } from '@/lib/jobs/actions'
import type { AiTriageResult } from '@/types/database'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const step1Schema = z.object({
  description: z.string().min(20, 'Please give us a bit more detail'),
  urgency: z.enum(['low', 'medium', 'high', 'emergency']),
})

const step2Schema = z.object({
  address: z.string().min(5, 'Enter your street address'),
  city: z.string().min(2, 'Enter your city'),
  zip: z.string().length(5, 'Enter a valid 5-digit ZIP code'),
})

type Step1Values = z.infer<typeof step1Schema>
type Step2Values = z.infer<typeof step2Schema>

const URGENCY_LABELS: Record<string, string> = {
  low: 'Not urgent — whenever is fine',
  medium: 'Soon — within a few days',
  high: 'Urgent — within 24 hours',
  emergency: 'Emergency — right now',
}

type TriageState = {
  triage: AiTriageResult
  estimated_cost_min?: number
  estimated_cost_max?: number
}

const STEP_HEADINGS = [
  { title: "What's the issue?", sub: 'Describe your plumbing problem and our AI will diagnose it instantly.' },
  { title: 'Where is this?', sub: "We'll use your location to find licensed plumbers nearby." },
  { title: 'Ready to analyze.', sub: "Review your details and we'll run the diagnosis." },
]

export default function NewRequestPage() {
  const [step, setStep] = useState(1)
  const [step1Data, setStep1Data] = useState<Step1Values | null>(null)
  const [step2Data, setStep2Data] = useState<Step2Values | null>(null)
  const [triageState, setTriageState] = useState<TriageState | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form1 = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: { urgency: 'medium' },
  })

  const form2 = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: { city: 'San Jose', zip: '' },
  })

  function handleStep1(values: Step1Values) { setStep1Data(values); setStep(2) }
  function handleStep2(values: Step2Values) { setStep2Data(values); setStep(3) }

  function handleSubmit() {
    if (!step1Data || !step2Data) return
    setSubmitError(null)
    startTransition(async () => {
      try {
        const result = await createJobWithTriage({
          description: step1Data.description,
          urgency: step1Data.urgency,
          address: step2Data.address,
          city: step2Data.city,
          zip: step2Data.zip,
        })
        setTriageState({ triage: result.triage, estimated_cost_min: result.estimated_cost_min, estimated_cost_max: result.estimated_cost_max })
        setStep(4)
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      }
    })
  }

  if (step === 4 && triageState) {
    return <TriageResult {...triageState} />
  }

  const heading = STEP_HEADINGS[step - 1]

  return (
    <div className="min-h-screen grain flex flex-col" style={{ background: '#0C0A09' }}>
      <div className="bg-grid absolute inset-0 pointer-events-none" />
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #C26D21 0%, transparent 70%)' }}
      />

      {/* Header */}
      <header className="relative z-10 px-8 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-amber-600 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 7C2 4.24 4.24 2 7 2C8.1 2 9.12 2.36 9.93 2.97L3.97 8.93C3.36 8.12 3 7.1 3 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M12 7C12 9.76 9.76 12 7 12C5.9 12 4.88 11.64 4.07 11.03L10.03 5.07C10.64 5.88 11 6.9 11 8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-display font-bold text-white text-lg tracking-tight">Brio</span>
        </Link>
        <Link href="/client" className="text-sm text-stone-500 hover:text-stone-300 transition-colors duration-200">
          My requests
        </Link>
      </header>

      {/* Main */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">

        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-300 transition-colors duration-200 mb-8 self-start max-w-xl w-full mx-auto"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
        )}

        {/* Heading */}
        <div className="w-full max-w-xl mx-auto mb-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-amber-600 w-8' : 'bg-white/10 w-4'}`} />
            ))}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight">
            {heading.title}
          </h1>
          <p className="text-stone-400 mt-4 text-lg leading-relaxed max-w-md mx-auto">
            {heading.sub}
          </p>
        </div>

        {/* Form card */}
        <div className="w-full max-w-xl mx-auto rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>

          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={form1.handleSubmit(handleStep1)}>
              <div className="p-8 space-y-5">
                <textarea
                  autoFocus
                  placeholder="e.g. My kitchen sink is leaking under the cabinet and there's water pooling on the floor…"
                  rows={6}
                  className="w-full resize-none text-base leading-relaxed bg-white/5 border border-white/10 text-white placeholder:text-stone-500 rounded-xl px-5 py-4 focus:outline-none focus:border-amber-600/50 transition-all duration-200"
                  {...form1.register('description')}
                />
                {form1.formState.errors.description && (
                  <p className="text-sm text-amber-400">{form1.formState.errors.description.message}</p>
                )}

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">How urgent?</p>
                  <Select
                    defaultValue="medium"
                    onValueChange={(val) => val && form1.setValue('urgency', val as Step1Values['urgency'])}
                  >
                    <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white rounded-xl text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(URGENCY_LABELS).map(([val, label]) => (
                        <SelectItem key={val} value={val} className="text-sm">{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="px-8 pb-8">
                <button
                  type="submit"
                  className="w-full h-14 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-base transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Get my free diagnosis <ArrowRight className="h-5 w-5" />
                </button>
                <div className="flex items-center justify-center gap-6 mt-5">
                  {['Free', 'AI-powered', 'No commitment'].map((label) => (
                    <div key={label} className="flex items-center gap-1.5 text-xs text-stone-400">
                      <CheckCircle className="h-3 w-3 text-amber-600/70" />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={form2.handleSubmit(handleStep2)}>
              <div className="p-8 space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest">Street address</label>
                  <input
                    placeholder="123 Main St"
                    className="w-full h-12 bg-white/5 border border-white/10 text-white placeholder:text-stone-500 rounded-xl px-4 text-base focus:outline-none focus:border-amber-600/50 transition-all duration-200"
                    {...form2.register('address')}
                  />
                  {form2.formState.errors.address && (
                    <p className="text-sm text-amber-400">{form2.formState.errors.address.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest">City</label>
                    <input
                      className="w-full h-12 bg-white/5 border border-white/10 text-white rounded-xl px-4 text-base focus:outline-none focus:border-amber-600/50 transition-all duration-200"
                      {...form2.register('city')}
                    />
                    {form2.formState.errors.city && (
                      <p className="text-sm text-amber-400">{form2.formState.errors.city.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest">ZIP code</label>
                    <input
                      className="w-full h-12 bg-white/5 border border-white/10 text-white rounded-xl px-4 text-base focus:outline-none focus:border-amber-600/50 transition-all duration-200"
                      {...form2.register('zip')}
                    />
                    {form2.formState.errors.zip && (
                      <p className="text-sm text-amber-400">{form2.formState.errors.zip.message}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="px-8 pb-8">
                <button
                  type="submit"
                  className="w-full h-14 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-base transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </form>
          )}

          {/* Step 3 */}
          {step === 3 && step1Data && step2Data && (
            <div>
              <div className="p-8 space-y-4">
                <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">Your issue</p>
                  <p className="text-sm text-stone-200 leading-relaxed">{step1Data.description}</p>
                  <p className="text-xs text-stone-500 mt-3">{URGENCY_LABELS[step1Data.urgency]}</p>
                </div>
                <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">Location</p>
                  <p className="text-sm text-stone-200">{step2Data.address}, {step2Data.city}, CA {step2Data.zip}</p>
                </div>
                {submitError && (
                  <div className="bg-red-950/40 border border-red-900/40 rounded-xl px-4 py-3">
                    <p className="text-sm text-red-400">{submitError}</p>
                  </div>
                )}
              </div>
              <div className="px-8 pb-8">
                <button
                  className="w-full h-14 bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white font-semibold rounded-xl text-base transition-all duration-200 flex items-center justify-center gap-2"
                  onClick={handleSubmit}
                  disabled={isPending}
                >
                  {isPending
                    ? <><Loader2 className="h-5 w-5 animate-spin" />Analyzing your issue…</>
                    : <>Run AI diagnosis <ArrowRight className="h-5 w-5" /></>
                  }
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      <footer className="relative z-10 py-6 text-center">
        <p className="text-xs text-stone-500">Brio · Bay Area · Private Beta</p>
      </footer>
    </div>
  )
}

function TriageResult({ triage, estimated_cost_min, estimated_cost_max }: TriageState) {
  const isDiy = triage.recommended_action === 'diy'

  return (
    <div className="min-h-screen grain flex flex-col" style={{ background: '#0C0A09' }}>
      <div className="bg-grid absolute inset-0 pointer-events-none" />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #C26D21 0%, transparent 70%)' }}
      />

      <header className="relative z-10 px-8 py-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-amber-600 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 7C2 4.24 4.24 2 7 2C8.1 2 9.12 2.36 9.93 2.97L3.97 8.93C3.36 8.12 3 7.1 3 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M12 7C12 9.76 9.76 12 7 12C5.9 12 4.88 11.64 4.07 11.03L10.03 5.07C10.64 5.88 11 6.9 11 8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-display font-bold text-white text-lg tracking-tight">Brio</span>
        </Link>
      </header>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-start px-6 py-8">
        <div className="w-full max-w-xl mx-auto space-y-5">

          {/* Verdict */}
          <div className="text-center mb-6">
            <div className={`inline-flex items-center gap-3 rounded-2xl px-6 py-4 ${isDiy ? 'bg-green-900/20 border border-green-700/30' : 'bg-amber-900/20 border border-amber-700/30'}`}>
              <div className={`rounded-xl p-2.5 ${isDiy ? 'bg-green-800/30' : 'bg-amber-800/30'}`}>
                {isDiy
                  ? <CheckCircle className="h-6 w-6 text-green-400" />
                  : <svg width="24" height="24" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 7C2 4.24 4.24 2 7 2C8.1 2 9.12 2.36 9.93 2.97L3.97 8.93C3.36 8.12 3 7.1 3 6" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M12 7C12 9.76 9.76 12 7 12C5.9 12 4.88 11.64 4.07 11.03L10.03 5.07C10.64 5.88 11 6.9 11 8" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                }
              </div>
              <div className="text-left">
                <p className={`font-display font-bold text-lg ${isDiy ? 'text-green-300' : 'text-amber-300'}`}>
                  {isDiy ? 'You can fix this yourself' : 'You need a licensed plumber'}
                </p>
                <p className={`text-sm capitalize ${isDiy ? 'text-green-500' : 'text-amber-600'}`}>
                  Complexity: {triage.estimated_complexity}
                </p>
              </div>
            </div>
          </div>

          {/* Details card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-7 space-y-6">

              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">Diagnosis</p>
                <p className="text-stone-700 leading-relaxed">{triage.diagnosis}</p>
              </div>

              {!isDiy && estimated_cost_min != null && estimated_cost_max != null && (
                <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-widest mb-1">Estimated cost · Bay Area</p>
                  <p className="font-display text-4xl font-bold text-stone-900 mt-1">${estimated_cost_min} – ${estimated_cost_max}</p>
                  <p className="text-xs text-stone-400 mt-1.5">Labor + parts. Final price set by your plumber.</p>
                </div>
              )}

              {isDiy && triage.diy_steps && triage.diy_steps.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">How to fix it</p>
                  <ol className="space-y-3">
                    {triage.diy_steps.map((s, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="flex-shrink-0 h-6 w-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                        <span className="text-stone-700 leading-relaxed text-sm">{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {isDiy && triage.parts_needed && triage.parts_needed.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <ShoppingCart className="h-3.5 w-3.5" /> Parts needed
                  </p>
                  <ul className="space-y-2">
                    {triage.parts_needed.map((part, i) => (
                      <li key={i} className="text-sm text-stone-700 flex items-center gap-2.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                        {part}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {triage.warnings && triage.warnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" /> Heads up
                  </p>
                  <ul className="space-y-1.5">
                    {triage.warnings.map((w, i) => (
                      <li key={i} className="text-sm text-amber-800 leading-relaxed">{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="px-7 pb-7 space-y-3">
              <Link
                href="/client"
                className="w-full h-12 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                View my requests <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="w-full text-center text-sm text-stone-400 hover:text-stone-600 transition-colors duration-200 py-1"
              >
                Diagnose another issue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
