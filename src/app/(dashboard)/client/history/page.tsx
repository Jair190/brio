import Link from 'next/link'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@/lib/supabase/server'
import { isDevMode } from '@/lib/dev-mode'
import type { Job } from '@/types/database'

export default async function JobHistoryPage() {
  let jobs: Job[] = []

  if (!isDevMode()) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('client_id', user!.id)
      .in('status', ['completed', 'canceled'])
      .order('created_at', { ascending: false }) as unknown as { data: Job[] | null }
    jobs = data ?? []
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-stone-900">Past Requests</h1>
        <p className="text-stone-400 mt-1 text-sm">Your completed and cancelled plumbing jobs.</p>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-5 w-5 text-stone-400" />
          </div>
          <p className="font-semibold text-stone-700 text-sm mb-1">No past requests yet</p>
          <p className="text-xs text-stone-400 mb-5 max-w-xs mx-auto">Completed and cancelled jobs will appear here.</p>
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
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${
                job.status === 'completed' ? 'bg-stone-100 text-stone-500' : 'bg-red-50 text-red-600'
              }`}>
                <CheckCircle className="h-3 w-3" />
                {job.status === 'completed' ? 'Completed' : 'Canceled'}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
