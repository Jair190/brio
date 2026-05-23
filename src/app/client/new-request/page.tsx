'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import {
  Loader2,
  CheckCircle,
  Wrench,
  AlertTriangle,
  ShoppingCart,
  ArrowRight,
  ChevronLeft,
} from 'lucide-react'
import { createJobWithTriage } from '@/lib/jobs/actions'
import type { AiTriageResult } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  { title: 'Ready to analyze.', sub: 'Review your details and we\'ll run the diagnosis.' },
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
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Radial gradients */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_#1d4ed8_0%,_transparent_55%)] opacity-40 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#1e3a5f_0%,_transparent_60%)] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-8 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-white tracking-tight text-lg">
          <Wrench className="h-5 w-5 text-blue-400" />
          Brio
        </Link>
        <Link href="/client" className="text-sm text-slate-500 hover:text-slate-300 transition-colors duration-200">
          My requests
        </Link>
      </header>

      {/* Main */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">

        {/* Step nav */}
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors duration-200 mb-8 self-start max-w-xl w-full mx-auto"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
        )}

        {/* Heading */}
        <div className="w-full max-w-xl mx-auto mb-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-5">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-blue-500 w-8' : 'bg-slate-700 w-4'}`} />
            ))}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight">
            {heading.title}
          </h1>
          <p className="text-slate-400 mt-4 text-lg leading-relaxed max-w-md mx-auto">
            {heading.sub}
          </p>
        </div>

        {/* Form card */}
        <div className="w-full max-w-xl mx-auto bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">

          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={form1.handleSubmit(handleStep1)}>
              <div className="p-8 space-y-5">
                <Textarea
                  autoFocus
                  placeholder="e.g. My kitchen sink is leaking under the cabinet and there's water pooling on the floor…"
                  rows={6}
                  className="resize-none text-base leading-relaxed bg-slate-800/60 border-slate-700/60 text-white placeholder:text-slate-500 rounded-xl w-full focus-visible:ring-blue-500/30 focus-visible:border-blue-500/60"
                  {...form1.register('description')}
                />
                {form1.formState.errors.description && (
                  <p className="text-sm text-red-400">{form1.formState.errors.description.message}</p>
                )}

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">How urgent?</Label>
                  <Select
                    defaultValue="medium"
                    onValueChange={(val) => val && form1.setValue('urgency', val as Step1Values['urgency'])}
                  >
                    <SelectTrigger className="h-12 bg-slate-800/60 border-slate-700/60 text-white rounded-xl text-sm">
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
                <Button type="submit" size="lg" className="w-full h-14 bg-blue-600 hover:bg-blue-700 rounded-xl text-base font-semibold transition-all duration-200">
                  Get my free diagnosis <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <div className="flex items-center justify-center gap-6 mt-5">
                  {[{ label: 'Free' }, { label: 'AI-powered' }, { label: 'No account needed' }].map(({ label }) => (
                    <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
                      <CheckCircle className="h-3 w-3 text-green-500/70" />
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
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Street address</Label>
                  <Input
                    placeholder="123 Main St"
                    className="h-12 bg-slate-800/60 border-slate-700/60 text-white placeholder:text-slate-500 rounded-xl text-base focus-visible:ring-blue-500/30 focus-visible:border-blue-500/60"
                    {...form2.register('address')}
                  />
                  {form2.formState.errors.address && (
                    <p className="text-sm text-red-400">{form2.formState.errors.address.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">City</Label>
                    <Input className="h-12 bg-slate-800/60 border-slate-700/60 text-white placeholder:text-slate-500 rounded-xl text-base focus-visible:ring-blue-500/30" {...form2.register('city')} />
                    {form2.formState.errors.city && (
                      <p className="text-sm text-red-400">{form2.formState.errors.city.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">ZIP code</Label>
                    <Input className="h-12 bg-slate-800/60 border-slate-700/60 text-white placeholder:text-slate-500 rounded-xl text-base focus-visible:ring-blue-500/30" {...form2.register('zip')} />
                    {form2.formState.errors.zip && (
                      <p className="text-sm text-red-400">{form2.formState.errors.zip.message}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="px-8 pb-8">
                <Button type="submit" size="lg" className="w-full h-14 bg-blue-600 hover:bg-blue-700 rounded-xl text-base font-semibold transition-all duration-200">
                  Continue <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </form>
          )}

          {/* Step 3 */}
          {step === 3 && step1Data && step2Data && (
            <div>
              <div className="p-8 space-y-4">
                <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Your issue</p>
                  <p className="text-sm text-slate-200 leading-relaxed">{step1Data.description}</p>
                  <p className="text-xs text-slate-500 mt-3">{URGENCY_LABELS[step1Data.urgency]}</p>
                </div>
                <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Location</p>
                  <p className="text-sm text-slate-200">{step2Data.address}, {step2Data.city}, CA {step2Data.zip}</p>
                </div>
                {submitError && (
                  <p className="text-sm text-red-500">{submitError}</p>
                )}
              </div>
              <div className="px-8 pb-8">
                <Button
                  size="lg"
                  className="w-full h-14 bg-blue-600 hover:bg-blue-700 rounded-xl text-base font-semibold transition-all duration-200"
                  onClick={handleSubmit}
                  disabled={isPending}
                >
                  {isPending
                    ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Analyzing your issue…</>
                    : <>Run AI diagnosis <ArrowRight className="h-5 w-5 ml-2" /></>
                  }
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>

      <footer className="relative z-10 py-6 text-center">
        <p className="text-xs text-slate-700">Brio · Bay Area · Private Beta</p>
      </footer>
    </div>
  )
}

function TriageResult({ triage, estimated_cost_min, estimated_cost_max }: TriageState) {
  const isDiy = triage.recommended_action === 'diy'

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_#1d4ed8_0%,_transparent_55%)] opacity-40 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#1e3a5f_0%,_transparent_60%)] pointer-events-none" />

      <header className="relative z-10 px-8 py-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-white tracking-tight text-lg">
          <Wrench className="h-5 w-5 text-blue-400" />
          Brio
        </Link>
      </header>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-start px-6 py-8">
        <div className="w-full max-w-xl mx-auto space-y-5">

          {/* Verdict */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center gap-3 rounded-2xl px-6 py-4 ${isDiy ? 'bg-green-500/10 border border-green-500/30' : 'bg-blue-500/10 border border-blue-500/30'}`}>
              <div className={`rounded-full p-2 ${isDiy ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
                {isDiy ? <CheckCircle className="h-6 w-6 text-green-400" /> : <Wrench className="h-6 w-6 text-blue-400" />}
              </div>
              <div className="text-left">
                <p className={`font-bold text-lg ${isDiy ? 'text-green-300' : 'text-blue-300'}`}>
                  {isDiy ? 'You can fix this yourself' : 'You need a licensed plumber'}
                </p>
                <p className={`text-sm capitalize ${isDiy ? 'text-green-500' : 'text-blue-500'}`}>
                  Complexity: {triage.estimated_complexity}
                </p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-7 space-y-6">

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Diagnosis</p>
                <p className="text-slate-700 leading-relaxed">{triage.diagnosis}</p>
              </div>

              {!isDiy && estimated_cost_min != null && estimated_cost_max != null && (
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Estimated cost · Bay Area</p>
                  <p className="text-4xl font-bold text-slate-900 mt-1">${estimated_cost_min} – ${estimated_cost_max}</p>
                  <p className="text-xs text-slate-400 mt-1.5">Labor + parts. Final price set by your plumber.</p>
                </div>
              )}

              {isDiy && triage.diy_steps && triage.diy_steps.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">How to fix it</p>
                  <ol className="space-y-3">
                    {triage.diy_steps.map((s, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                        <span className="text-slate-700 leading-relaxed text-sm">{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {isDiy && triage.parts_needed && triage.parts_needed.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <ShoppingCart className="h-3.5 w-3.5" /> Parts needed
                  </p>
                  <ul className="space-y-2">
                    {triage.parts_needed.map((part, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-center gap-2.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-300 flex-shrink-0" />
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
              <Link href="/client">
                <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-all duration-200">
                  View my requests <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="w-full text-center text-sm text-slate-400 hover:text-slate-600 transition-colors duration-200 py-1"
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
