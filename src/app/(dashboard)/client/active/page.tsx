import Link from 'next/link'
import { Plus, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { isDevMode } from '@/lib/dev-mode'

const STATUS_LABELS: Record<string, string> = {
  pending_triage: 'Analyzing…',
  triaged: 'Finding a plumber…',
  matched: 'Plumber matched',
  confirmed: 'Confirmed',
  in_progress: 'In progress',
}

export default async function ActiveJobsPage() {
  let jobs: { id: string; title: string; city: string; status: string; created_at: string }[] = []

  if (!isDevMode()) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('jobs')
      .select('id, title, city, status, created_at')
      .eq('client_id', user!.id)
      .not('status', 'in', '(completed,canceled)')
      .order('created_at', { ascending: false })
    jobs = data ?? []
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Active Jobs</h1>
          <p className="text-slate-500 mt-1">Jobs currently in progress or awaiting a plumber.</p>
        </div>
        <Link href="/client/new-request">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" /> New Request
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">In progress</CardTitle>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center text-slate-400">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <Clock className="h-5 w-5 opacity-40" />
              </div>
              <p className="text-sm font-medium text-slate-600">No active jobs</p>
              <p className="text-xs mt-1">Submit a request and we'll find you a plumber.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {jobs.map(job => (
                <li key={job.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{job.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {job.city} · {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {STATUS_LABELS[job.status] ?? job.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
