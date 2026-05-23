import { Briefcase, MapPin, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { isDevMode, devUser } from '@/lib/dev-mode'

const STATUS_LABELS: Record<string, string> = {
  matched: 'Claimed',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
}

export default async function TradesmanJobsPage() {
  let jobs: { id: string; title: string; city: string; status: string; created_at: string; estimated_cost_min: number | null; estimated_cost_max: number | null }[] = []

  if (isDevMode()) {
    jobs = []
  } else {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('jobs')
      .select('id, title, city, status, created_at, estimated_cost_min, estimated_cost_max')
      .eq('tradesman_id', user!.id)
      .order('created_at', { ascending: false })
    jobs = data ?? []
  }

  const active = jobs.filter(j => j.status !== 'completed')
  const completed = jobs.filter(j => j.status === 'completed')

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Jobs</h1>
        <p className="text-slate-500 mt-1">Jobs you&apos;ve claimed and their current status.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active</CardTitle>
        </CardHeader>
        <CardContent>
          {active.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center text-slate-400">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <Briefcase className="h-5 w-5 opacity-40" />
              </div>
              <p className="text-sm font-medium text-slate-600">No active jobs</p>
              <p className="text-xs mt-1">Claim leads from your inbox to see them here.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {active.map(job => (
                <li key={job.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{job.title}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                      {job.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.city}</span>}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
                      {job.estimated_cost_min && job.estimated_cost_max && (
                        <span className="text-green-600 font-medium">${job.estimated_cost_min}–${job.estimated_cost_max}</span>
                      )}
                    </div>
                  </div>
                  <Badge variant="default" className="text-xs shrink-0">
                    {STATUS_LABELS[job.status] ?? job.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {completed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {completed.map(job => (
                <li key={job.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{job.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {job.city} · {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">Completed</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
