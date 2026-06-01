import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Clock, CheckCircle, Loader2, AlertTriangle, ShoppingCart, Wrench, MapPin, Calendar } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { createClient } from '@/lib/supabase/server'
import { isDevMode } from '@/lib/dev-mode'
import type { Job } from '@/types/database'

const STATUS_LABELS: Record<Job['status'], string> = {
  pending_triage: 'Analyzing…',
  triaged:        'Finding a plumber…',
  matched:        'Plumber Matched',
  confirmed:      'Confirmed',
  in_progress:    'In Progress',
  completed:      'Completed',
  canceled:       'Canceled',
}

const STATUS_COLORS: Record<Job['status'], string> = {
  pending_triage: 'bg-stone-100 text-stone-500',
  triaged:        'bg-amber-50 text-amber-700',
  matched:        'bg-amber-100 text-amber-800',
  confirmed:      'bg-amber-100 text-amber-800',
  in_progress:    'bg-green-50 text-green-700',
  completed:      'bg-stone-100 text-stone-500',
  canceled:       'bg-red-50 text-red-600',
}

const URGENCY_LABELS: Record<string, string> = {
  low:       'Not urgent',
  medium:    'Soon — within a few days',
  high:      'Urgent — within 24 hours',
  emergency: 'Emergency',
}

const COMPLEXITY_COLORS: Record<string, string> = {
  simple:   'text-green-600',
  moderate: 'text-amber-600',
  complex:  'text-red-600',
}

const DEV_JOB: Job = {
  id: 'dev-job-1',
  client_id: 'dev-user-id',
  tradesman_id: null,
  title: 'Kitchen faucet dripping constantly',
  description: 'The kitchen faucet has been dripping for about two weeks. It gets worse at night. I tried tightening the handle but it didn\'t help.',
  address: '456 Valencia St',
  city: 'San Francisco',
  state: 'CA',
  zip: '94103',
  latitude: null,
  longitude: null,
  ai_triage_result: {
    diagnosis: 'The drip is most likely caused by a worn cartridge or O-ring inside the faucet body.',
    recommended_action: 'professional',
    estimated_complexity: 'simple',
    diy_steps: ['Turn off water supply under the sink', 'Remove the faucet handle', 'Replace the cartridge or O-ring'],
    parts_needed: ['Replacement cartridge', 'O-ring set'],
    warnings: [],
  },
  ai_recommended_diy: false,
  status: 'triaged',
  urgency: 'medium',
  estimated_cost_min: 8000,
  estimated_cost_max: 15000,
  final_cost: null,
  stripe_payment_intent_id: null,
  created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  updated_at: new Date().toISOString(),
}

export default async function ClientJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let job: Job | null = null

  if (isDevMode()) {
    job = { ...DEV_JOB, id }
  } else {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .eq('client_id', user!.id)
      .single() as unknown as { data: Job | null }
    job = data
  }

  if (!job) notFound()

  const triage = job.ai_triage_result
  const costMin = job.estimated_cost_min ? (job.estimated_cost_min / 100).toFixed(0) : null
  const costMax = job.estimated_cost_max ? (job.estimated_cost_max / 100).toFixed(0) : null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back + header */}
      <div>
        <Link href="/client" className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors mb-4">
          <ChevronLeft className="h-3.5 w-3.5" /> Back to requests
        </Link>
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-2xl font-bold text-stone-900 leading-tight">{job.title}</h1>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 mt-1 ${STATUS_COLORS[job.status]}`}>
            {job.status === 'pending_triage' ? <Loader2 className="h-3 w-3 animate-spin" /> : job.status === 'completed' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
            {STATUS_LABELS[job.status]}
          </span>
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-stone-400">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {job.city}, {job.state}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> {format(new Date(job.created_at), 'MMM d, yyyy')}
          </span>
          <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl px-5 py-4" style={{ border: '1px solid #e7e5e4' }}>
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">Your description</p>
        <p className="text-sm text-stone-700 leading-relaxed">{job.description}</p>
        <div className="mt-3 pt-3 flex items-center gap-4 text-xs text-stone-400" style={{ borderTop: '1px solid #f5f5f4' }}>
          <span>Urgency: <span className="text-stone-600 font-medium">{URGENCY_LABELS[job.urgency] ?? job.urgency}</span></span>
          <span>{job.address}, {job.city} {job.zip}</span>
        </div>
      </div>

      {/* AI Triage result */}
      {triage && (
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #e7e5e4' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid #f5f5f4' }}>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">AI Diagnosis</p>
          </div>

          <div className="px-5 py-4 space-y-4">
            {/* Diagnosis */}
            <p className="text-sm text-stone-700 leading-relaxed">{triage.diagnosis}</p>

            {/* DIY vs Pro */}
            <div className={`flex items-start gap-3 rounded-xl p-3.5 ${triage.recommended_action === 'diy' ? 'bg-green-50 border border-green-100' : 'bg-amber-50 border border-amber-100'}`}>
              {triage.recommended_action === 'diy' ? (
                <>
                  <ShoppingCart className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">You may be able to DIY this</p>
                    <p className="text-xs text-green-600 mt-0.5">A professional isn&apos;t strictly required — see steps below.</p>
                  </div>
                </>
              ) : (
                <>
                  <Wrench className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">A licensed plumber is recommended</p>
                    <p className="text-xs text-amber-700 mt-0.5">This job requires professional tools or expertise.</p>
                  </div>
                </>
              )}
            </div>

            {/* Complexity + Cost */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-stone-400 mb-1">Complexity</p>
                <p className={`text-sm font-semibold capitalize ${COMPLEXITY_COLORS[triage.estimated_complexity] ?? 'text-stone-700'}`}>
                  {triage.estimated_complexity}
                </p>
              </div>
              {costMin && costMax && (
                <div>
                  <p className="text-xs text-stone-400 mb-1">Estimated cost</p>
                  <p className="text-sm font-semibold text-stone-900">${costMin}–${costMax}</p>
                </div>
              )}
            </div>

            {/* Steps */}
            {triage.diy_steps && triage.diy_steps.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">Steps</p>
                <ol className="space-y-1.5">
                  {triage.diy_steps.map((step: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-stone-600">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-stone-100 text-stone-500 text-xs font-semibold flex items-center justify-center mt-0.5">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Warnings */}
            {triage.warnings && triage.warnings.length > 0 && (
              <div className="rounded-xl p-3.5 bg-red-50 border border-red-100 space-y-1">
                {triage.warnings.map((w: string, i: number) => (
                  <p key={i} className="flex items-start gap-2 text-xs text-red-700">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" /> {w}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CTA if still looking for plumber */}
      {['triaged', 'matched'].includes(job.status) && (
        <div className="rounded-2xl p-5 text-center" style={{ background: '#FFF9F0', border: '1px solid #FDE68A' }}>
          <p className="text-sm font-semibold text-amber-900 mb-1">We&apos;re finding you a plumber</p>
          <p className="text-xs text-amber-700">You&apos;ll hear from us as soon as we confirm availability in your area.</p>
        </div>
      )}
    </div>
  )
}
