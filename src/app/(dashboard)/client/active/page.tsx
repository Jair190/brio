import Link from 'next/link'
import { Clock, ArrowRight, Loader2, CheckCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
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

export default async function ActiveJobsPage() {
  let jobs: Job[] = []

  if (!isDevMode()) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('client_id', user!.id)
      .not('status', 'in', '(completed,canceled)')
      .order('created_at', { ascending: false }) as unknown as { data: Job[] | null }
    jobs = data ?? []
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-stone-900">Active Requests</h1>
        <p className="text-stone-400 mt-1 text-sm">Jobs currently in progress or awaiting a plumber.</p>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <p className="font-semibold text-stone-700 text-sm mb-1">No active requests</p>
          <p className="text-xs text-stone-400 mb-5 max-w-xs mx-auto">Submit a request and we&apos;ll match you with a trusted Bay Area plumber.</p>
          <Link
            href="/client/new-request"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
          >
            Submit a request <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #e7e5e4' }}>
          {jobs.map((job, i) => (
            <Link
              key={job.id}
              href={`/client/job/${job.id}`}
              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-stone-50 transition-colors duration-150"
              style={i > 0 ? { borderTop: '1px solid #f5f5f4' } : {}}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-stone-900 truncate">{job.title}</p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {job.city && <>{job.city} · </>}
                  {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                </p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${STATUS_COLORS[job.status]}`}>
                {job.status === 'pending_triage' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Clock className="h-3 w-3" />}
                {STATUS_LABELS[job.status]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
