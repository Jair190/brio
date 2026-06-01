import Link from 'next/link'
import { Clock, CheckCircle, Loader2, ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@/lib/supabase/server'
import { isDevMode, DEV_USER } from '@/lib/dev-mode'
import type { Job } from '@/types/database'

const STATUS_LABELS: Record<Job['status'], string> = {
  pending_triage: 'Analyzing…',
  triaged: 'Finding a plumber…',
  matched: 'Plumber Matched',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  canceled: 'Canceled',
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

function StatusIcon({ status }: { status: Job['status'] }) {
  if (status === 'pending_triage') return <Loader2 className="h-3 w-3 animate-spin" />
  if (status === 'completed') return <CheckCircle className="h-3 w-3" />
  return <Clock className="h-3 w-3" />
}

export default async function ClientDashboardPage() {
  let name = 'there'
  let jobs: Job[] | null = null

  if (isDevMode()) {
    name = DEV_USER.user_metadata.full_name.split(' ')[0]
  } else {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    name = user?.user_metadata?.full_name?.split(' ')[0] ?? 'there'
    const result = await supabase
      .from('jobs')
      .select('*')
      .eq('client_id', user!.id)
      .order('created_at', { ascending: false }) as unknown as { data: Job[] | null }
    jobs = result.data
  }

  const activeJobs = (jobs ?? []).filter(j => !['completed', 'canceled'].includes(j.status))
  const pastJobs = (jobs ?? []).filter(j => ['completed', 'canceled'].includes(j.status))

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-stone-900">Hey, {name} 👋</h1>
        <p className="text-stone-400 mt-1 text-sm">Here are your plumbing requests.</p>
      </div>

      {/* Active jobs */}
      <div>
        <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Active Requests</h2>
        {activeJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-200 p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4">
              <svg width="20" height="20" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 7C2 4.24 4.24 2 7 2C8.1 2 9.12 2.36 9.93 2.97L3.97 8.93C3.36 8.12 3 7.1 3 6" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M12 7C12 9.76 9.76 12 7 12C5.9 12 4.88 11.64 4.07 11.03L10.03 5.07C10.64 5.88 11 6.9 11 8" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="font-semibold text-stone-700 text-sm mb-1">No active requests</p>
            <p className="text-xs text-stone-400 mb-5 max-w-xs mx-auto">Describe your plumbing issue and we&apos;ll match you with a trusted Bay Area plumber.</p>
            <Link
              href="/client/new-request"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
            >
              Submit your first request <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #e7e5e4' }}>
            {activeJobs.map((job, i) => (
              <JobRow key={job.id} job={job} showDivider={i > 0} />
            ))}
          </div>
        )}
      </div>

      {/* Past jobs */}
      {pastJobs.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Past Requests</h2>
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #e7e5e4' }}>
            {pastJobs.map((job, i) => (
              <JobRow key={job.id} job={job} showDivider={i > 0} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function JobRow({ job, showDivider }: { job: Job; showDivider: boolean }) {
  const diy = job.ai_recommended_diy
  return (
    <Link
      href={`/client/job/${job.id}`}
      className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-stone-50 transition-colors duration-150"
      style={showDivider ? { borderTop: '1px solid #f5f5f4' } : {}}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-stone-900 truncate">{job.title}</p>
        <p className="text-xs text-stone-400 mt-0.5">
          {job.city && <>{job.city} · </>}
          {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
          {job.status === 'triaged' && (
            <span className={`ml-1.5 font-medium ${diy ? 'text-green-600' : 'text-amber-600'}`}>
              · {diy ? 'DIY ok' : 'Pro needed'}
            </span>
          )}
        </p>
      </div>
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${STATUS_COLORS[job.status]}`}>
        <StatusIcon status={job.status} />
        {STATUS_LABELS[job.status]}
      </span>
    </Link>
  )
}
