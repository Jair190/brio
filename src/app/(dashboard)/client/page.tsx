import Link from 'next/link'
import { Plus, Wrench, Clock, CheckCircle, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

const STATUS_VARIANT: Record<Job['status'], 'default' | 'secondary' | 'outline' | 'destructive'> = {
  pending_triage: 'secondary',
  triaged: 'default',
  matched: 'default',
  confirmed: 'default',
  in_progress: 'default',
  completed: 'outline',
  canceled: 'destructive',
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hey {name} 👋</h1>
          <p className="text-slate-700 mt-1">What plumbing problem can we help you with today?</p>
        </div>
        <Link href="/client/new-request">
          <Button className="bg-blue-600 hover:bg-blue-700 transition-all duration-200">
            <Plus className="h-4 w-4 mr-2" /> New Request
          </Button>
        </Link>
      </div>

      {/* Active jobs */}
      <Card className="shadow-sm ring-1 ring-slate-100">
        <CardHeader>
          <CardTitle className="text-base">Active Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {activeJobs.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="bg-slate-100 rounded-full p-3 mb-3">
                <Wrench className="h-12 w-12 text-slate-400 opacity-50" />
              </div>
              <p className="text-sm text-slate-600">No requests yet — submit your first one above</p>
              <p className="text-xs text-slate-500 mt-1">We&apos;ll match you with a plumber after triage.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {activeJobs.map(job => <JobRow key={job.id} job={job} />)}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Past jobs */}
      {pastJobs.length > 0 && (
        <Card className="shadow-sm ring-1 ring-slate-100">
          <CardHeader>
            <CardTitle className="text-base">Past Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {pastJobs.map(job => <JobRow key={job.id} job={job} />)}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function JobRow({ job }: { job: Job }) {
  const diy = job.ai_recommended_diy
  return (
    <li className="py-3 flex items-start justify-between gap-3 hover:bg-slate-50 transition-colors rounded-lg px-2 -mx-2">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900 truncate">{job.title}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          {job.city} · {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
          {job.status === 'triaged' && (
            <span className={`ml-2 ${diy ? 'text-green-600' : 'text-blue-600'}`}>
              {diy ? '· DIY recommended' : '· Pro recommended'}
            </span>
          )}
        </p>
      </div>
      <Badge variant={STATUS_VARIANT[job.status]} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full shrink-0">
        <StatusIcon status={job.status} />
        {STATUS_LABELS[job.status]}
      </Badge>
    </li>
  )
}
