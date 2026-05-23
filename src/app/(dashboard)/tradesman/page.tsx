import { Inbox, MapPin, Clock, DollarSign } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { isDevMode, devUser } from '@/lib/dev-mode'
import { ClaimButton } from './ClaimButton'

type Job = {
  id: string
  title: string | null
  description: string
  city: string | null
  urgency: string | null
  status: string
  estimated_cost_min: number | null
  estimated_cost_max: number | null
  ai_triage_result: {
    diagnosis: string
    recommended_action: string
    estimated_complexity: string
  } | null
  created_at: string
}

const MOCK_JOBS: Job[] = [
  {
    id: 'mock-1',
    title: 'Kitchen faucet dripping constantly',
    description: 'My kitchen faucet has been dripping for two weeks. It\'s getting worse and I\'m worried about my water bill.',
    city: 'San Francisco',
    urgency: 'soon',
    status: 'triaged',
    estimated_cost_min: 100,
    estimated_cost_max: 200,
    ai_triage_result: {
      diagnosis: 'Worn cartridge or O-ring inside the faucet body.',
      recommended_action: 'professional',
      estimated_complexity: 'simple',
    },
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'mock-2',
    title: 'No hot water — water heater issue',
    description: 'Woke up this morning with no hot water. Water heater is about 8 years old, gas powered.',
    city: 'Oakland',
    urgency: 'urgent',
    status: 'triaged',
    estimated_cost_min: 200,
    estimated_cost_max: 600,
    ai_triage_result: {
      diagnosis: 'Likely thermocouple failure or pilot light issue on gas water heater.',
      recommended_action: 'professional',
      estimated_complexity: 'moderate',
    },
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: 'mock-3',
    title: 'Warm wet spot on living room floor',
    description: 'There\'s a warm wet area spreading on my concrete floor. Started small yesterday, bigger today.',
    city: 'San Jose',
    urgency: 'emergency',
    status: 'triaged',
    estimated_cost_min: 1500,
    estimated_cost_max: 5000,
    ai_triage_result: {
      diagnosis: 'Slab leak — pipe has burst or corroded beneath the foundation.',
      recommended_action: 'professional',
      estimated_complexity: 'complex',
    },
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
]

const urgencyConfig: Record<string, { label: string; className: string }> = {
  emergency: { label: 'Emergency', className: 'bg-red-100 text-red-700 border-red-200' },
  urgent:    { label: 'Urgent',    className: 'bg-orange-100 text-orange-700 border-orange-200' },
  soon:      { label: 'Soon',      className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  flexible:  { label: 'Flexible',  className: 'bg-slate-100 text-slate-600 border-slate-200' },
}

const complexityConfig: Record<string, { label: string; className: string }> = {
  simple:   { label: 'Simple',   className: 'bg-green-100 text-green-700' },
  moderate: { label: 'Moderate', className: 'bg-blue-100 text-blue-700' },
  complex:  { label: 'Complex',  className: 'bg-purple-100 text-purple-700' },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default async function TradesmanDashboardPage() {
  let name = 'there'
  let jobs: Job[] = []

  if (isDevMode()) {
    name = devUser('tradesman').user_metadata.full_name.split(' ')[0]
    jobs = MOCK_JOBS
  } else {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    name = user?.user_metadata?.full_name?.split(' ')[0] ?? 'there'

    const { data } = await supabase
      .from('jobs')
      .select('id, title, description, city, urgency, status, estimated_cost_min, estimated_cost_max, ai_triage_result, created_at')
      .in('status', ['triaged', 'pending_triage'])
      .order('created_at', { ascending: false })
      .limit(50)

    jobs = (data ?? []) as Job[]
  }

  const openLeads = jobs.length
  const emergencyLeads = jobs.filter(j => j.urgency === 'emergency').length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {name}</h1>
          <p className="text-slate-500 mt-1">Here&apos;s what&apos;s in your lead inbox.</p>
        </div>
        <Badge variant="secondary" className="text-xs">Basic Plan</Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold text-slate-900">{openLeads}</p>
            <p className="text-xs text-slate-500 mt-1">Open Leads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold text-red-600">{emergencyLeads}</p>
            <p className="text-xs text-slate-500 mt-1">Emergency</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold text-slate-900">$0</p>
            <p className="text-xs text-slate-500 mt-1">This Month</p>
          </CardContent>
        </Card>
      </div>

      {/* Lead inbox */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            Lead Inbox
            {openLeads > 0 && (
              <span className="ml-auto text-xs font-normal text-slate-500">{openLeads} available</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {jobs.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center text-slate-400 px-6">
              <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <Inbox className="h-6 w-6 opacity-40" />
              </div>
              <p className="text-sm font-medium">No leads right now</p>
              <p className="text-xs mt-1 max-w-xs">New jobs matching your service area will appear here as clients submit requests.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {jobs.map((job) => {
                const urgency = urgencyConfig[job.urgency ?? 'flexible'] ?? urgencyConfig.flexible
                const complexity = complexityConfig[job.ai_triage_result?.estimated_complexity ?? 'simple'] ?? complexityConfig.simple
                const hasCost = job.estimated_cost_min != null && job.estimated_cost_max != null

                return (
                  <li key={job.id} className="p-4 hover:bg-slate-50 transition-colors duration-150">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Title + badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="font-semibold text-slate-900 text-sm">
                            {job.title ?? job.description.slice(0, 60)}
                          </span>
                          <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border font-medium ${urgency.className}`}>
                            {urgency.label}
                          </span>
                          <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium ${complexity.className}`}>
                            {complexity.label}
                          </span>
                        </div>

                        {/* Diagnosis */}
                        {job.ai_triage_result?.diagnosis && (
                          <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                            {job.ai_triage_result.diagnosis}
                          </p>
                        )}

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          {job.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {job.city}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {timeAgo(job.created_at)}
                          </span>
                          {hasCost && (
                            <span className="flex items-center gap-1 text-green-600 font-medium">
                              <DollarSign className="h-3 w-3" />
                              ${job.estimated_cost_min}–${job.estimated_cost_max}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action */}
                      <ClaimButton jobId={job.id} />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
