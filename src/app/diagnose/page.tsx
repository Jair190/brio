'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import {
  ChevronRight,
  Loader2,
  CheckCircle,
  Wrench,
  AlertTriangle,
  ShoppingCart,
  LogIn,
} from 'lucide-react'
import { runGuestTriage } from '@/lib/ai/guest-actions'
import type { AiTriageResult } from '@/types/database'
import type { TriageOutput } from '@/lib/ai/triage'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Nav */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
            <Wrench className="h-5 w-5 text-blue-600" />
            Brio
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 transition-colors duration-150">Sign in</Link>
            <Link href="/signup">
              <Button size="sm" variant="outline" className="transition-all duration-200">Create account</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Free Plumbing Diagnosis</h1>
          <p className="text-slate-700 mt-2">
            Describe your issue and get expert AI guidance — no account required.
          </p>
        </div>

        {!result ? (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">What&apos;s the problem?</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="description">Describe your issue</Label>
                  <Textarea
                    id="description"
                    placeholder="e.g. My kitchen sink is leaking under the cabinet and there's water pooling on the floor…"
                    rows={4}
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">{errors.description.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label>How urgent is this?</Label>
                  <Select
                    defaultValue="medium"
                    onValueChange={(val) => val && setValue('urgency', val as FormValues['urgency'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(URGENCY_LABELS).map(([val, label]) => (
                        <SelectItem key={val} value={val}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {submitError && (
                  <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">{submitError}</p>
                )}

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-200" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing your issue…
                    </>
                  ) : (
                    <>
                      Get free diagnosis <ChevronRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-slate-500">
                  No account needed. Results are instant.
                </p>
              </form>
            </CardContent>
          </Card>
        ) : (
          <TriageResult output={result} />
        )}
      </main>
    </div>
  )
}

function TriageResult({ output }: { output: TriageOutput }) {
  const { triage, estimated_cost_min, estimated_cost_max } = output
  const isDiy = triage.recommended_action === 'diy'

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`flex items-center gap-3 p-4 rounded-xl ${isDiy ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
        <div className={`rounded-full p-2 ${isDiy ? 'bg-green-100' : 'bg-blue-100'}`}>
          {isDiy
            ? <CheckCircle className="h-6 w-6 text-green-600" />
            : <Wrench className="h-6 w-6 text-blue-600" />
          }
        </div>
        <div>
          <p className={`font-semibold ${isDiy ? 'text-green-800' : 'text-blue-800'}`}>
            {isDiy ? 'You can fix this yourself' : 'A licensed plumber is recommended'}
          </p>
          <p className={`text-xs mt-0.5 capitalize ${isDiy ? 'text-green-600' : 'text-blue-600'}`}>
            Complexity: {triage.estimated_complexity}
          </p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="pt-5 space-y-4">
          {/* Diagnosis */}
          <div className="space-y-1 border-l-4 border-blue-200 pl-3">
            <p className="text-xs font-semibold text-slate-500 uppercase">Diagnosis</p>
            <p className="text-sm text-slate-700">{triage.diagnosis}</p>
          </div>

          {/* Cost estimate (pro only) */}
          {!isDiy && estimated_cost_min != null && estimated_cost_max != null && (
            <div className="bg-slate-50 rounded-md p-3">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Estimated Cost (Bay Area)</p>
              <p className="text-2xl font-bold text-slate-900">${estimated_cost_min} – ${estimated_cost_max}</p>
              <p className="text-xs text-slate-500 mt-0.5">Labor + parts. Final price set by your plumber.</p>
            </div>
          )}

          {/* DIY steps */}
          {isDiy && triage.diy_steps && triage.diy_steps.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase">Steps</p>
              <ol className="space-y-2">
                {triage.diy_steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-slate-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Parts needed */}
          {isDiy && triage.parts_needed && triage.parts_needed.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                <ShoppingCart className="h-3 w-3" /> Parts you&apos;ll need
              </p>
              <ul className="space-y-1">
                {triage.parts_needed.map((part, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                    {part}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {triage.warnings && triage.warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 space-y-1 shadow-sm">
              <p className="text-xs font-semibold text-amber-700 uppercase flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Heads up
              </p>
              <ul className="space-y-1">
                {triage.warnings.map((w, i) => (
                  <li key={i} className="text-sm text-amber-800">{w}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CTAs */}
      {isDiy ? (
        <div className="space-y-3">
          <div className="bg-slate-50 border rounded-xl p-6 text-center space-y-3 shadow-sm">
            <p className="text-sm text-slate-600">
              Want to save this diagnosis or get a professional opinion?
            </p>
            <Link href="/signup/client">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-200">
                <LogIn className="h-4 w-4 mr-2" /> Create a free account
              </Button>
            </Link>
            <Link href="/" className="block text-xs text-slate-500 hover:text-slate-600 transition-colors duration-150">
              No thanks, I&apos;m good
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-blue-600 rounded-xl p-5 text-white text-center space-y-3 shadow-md">
          <Wrench className="h-8 w-8 mx-auto text-blue-200" />
          <p className="font-semibold text-lg">Ready to book a licensed plumber?</p>
          <p className="text-sm text-blue-100">
            Create a free account to get matched with vetted plumbers in your area — usually within the hour.
          </p>
          <Link href="/signup/client">
            <Button className="w-full bg-white text-blue-700 hover:bg-blue-50 mt-1 transition-all duration-200">
              Book a plumber — it&apos;s free to start
            </Button>
          </Link>
          <Link href="/login" className="block text-xs text-blue-300 hover:text-white mt-1 transition-colors duration-150">
            Already have an account? Sign in
          </Link>
        </div>
      )}

      <button
        onClick={() => window.location.reload()}
        className="w-full text-center text-sm text-slate-500 hover:text-slate-600 py-2 transition-colors duration-150"
      >
        Diagnose a different issue
      </button>
    </div>
  )
}
