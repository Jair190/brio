import { CheckCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { isDevMode } from '@/lib/dev-mode'

export default async function JobHistoryPage() {
  let jobs: { id: string; title: string; city: string; status: string; created_at: string }[] = []

  if (!isDevMode()) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('jobs')
      .select('id, title, city, status, created_at')
      .eq('client_id', user!.id)
      .in('status', ['completed', 'canceled'])
      .order('created_at', { ascending: false })
    jobs = data ?? []
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Job History</h1>
        <p className="text-slate-500 mt-1">Your completed and cancelled jobs.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Past jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center text-slate-400">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <CheckCircle className="h-5 w-5 opacity-40" />
              </div>
              <p className="text-sm font-medium text-slate-600">No completed jobs yet</p>
              <p className="text-xs mt-1">Finished jobs will appear here.</p>
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
                  <Badge
                    variant={job.status === 'completed' ? 'outline' : 'destructive'}
                    className="text-xs shrink-0 capitalize"
                  >
                    {job.status}
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
