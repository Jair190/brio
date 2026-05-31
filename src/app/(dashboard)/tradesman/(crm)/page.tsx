'use client'

import { useCRMJobs } from '@/hooks/useCRMJobs'
import { useTasks } from '@/hooks/useTasks'
import { useOrg } from '@/hooks/useOrg'
import { Briefcase, CheckSquare, DollarSign, Calendar, Clock, AlertCircle } from 'lucide-react'
import { formatDistanceToNow, format, isPast } from 'date-fns'
import { JOB_STAGES } from '@/types/crm'

export default function CRMDashboard() {
  const { org } = useOrg()
  const { data: jobs = [] } = useCRMJobs()
  const { data: tasks = [] } = useTasks({ status: 'open' })

  const today = new Date()
  const todayStr = today.toDateString()

  const openJobs = jobs.filter(j => j.stage !== 'paid')
  const todayJobs = jobs.filter(j => j.scheduled_at && new Date(j.scheduled_at).toDateString() === todayStr)
  const overdueTasks = tasks.filter(t => t.due_at && isPast(new Date(t.due_at)))
  const monthRevenue = jobs
    .filter(j => j.stage === 'paid' && j.invoice_amount)
    .reduce((sum, j) => sum + (j.invoice_amount ?? 0), 0)

  const stageCounts = JOB_STAGES.map(s => ({
    ...s,
    count: jobs.filter(j => j.stage === s.value).length,
  }))

  const stats = [
    { label: 'Open Jobs', value: openJobs.length, icon: Briefcase, accent: 'bg-amber-600/15 text-amber-400' },
    { label: "Today's Jobs", value: todayJobs.length, icon: Calendar, accent: 'bg-stone-700/60 text-stone-300' },
    {
      label: 'Overdue Tasks',
      value: overdueTasks.length,
      icon: CheckSquare,
      accent: overdueTasks.length > 0 ? 'bg-red-900/30 text-red-400' : 'bg-stone-700/60 text-stone-300',
      valueColor: overdueTasks.length > 0 ? 'text-red-400' : undefined,
    },
    { label: 'Month Revenue', value: `$${monthRevenue.toLocaleString()}`, icon: DollarSign, accent: 'bg-green-900/20 text-green-400' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-7">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-white">{org?.name ?? 'Dashboard'}</h1>
        <p className="text-stone-500 text-sm mt-1">{format(today, 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, accent, valueColor }) => (
          <div key={label} className="rounded-2xl p-5" style={{ background: '#1A1714', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-start gap-3">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className={`text-2xl font-bold leading-none mb-1 ${valueColor ?? 'text-white'}`}>{value}</p>
                <p className="text-xs text-stone-500 leading-snug">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pipeline breakdown */}
        <div className="rounded-2xl p-6" style={{ background: '#1A1714', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-sm font-semibold text-white mb-5">Jobs by stage</p>
          <div className="space-y-3">
            {stageCounts.map(({ value, label, color, count }) => (
              <div key={value} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-sm text-stone-400 flex-1">{label}</span>
                <span className="text-sm font-semibold text-white w-5 text-right">{count}</span>
                <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: jobs.length > 0 ? `${(count / jobs.length) * 100}%` : '0%',
                      background: color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's schedule */}
        <div className="rounded-2xl p-6" style={{ background: '#1A1714', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-amber-600" /> Today&apos;s schedule
          </p>
          {todayJobs.length === 0 ? (
            <p className="text-sm text-stone-400 py-4 text-center">No jobs scheduled today</p>
          ) : (
            <ul className="space-y-4">
              {todayJobs.map(job => (
                <li key={job.id} className="flex items-start gap-3">
                  <div className="text-xs text-stone-500 w-14 shrink-0 pt-0.5 font-medium">
                    {job.scheduled_at ? format(new Date(job.scheduled_at), 'h:mm a') : '—'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{job.title}</p>
                    {job.clients && <p className="text-xs text-stone-500 mt-0.5">{job.clients.name}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Overdue tasks */}
      {overdueTasks.length > 0 && (
        <div className="rounded-2xl p-6" style={{ background: '#1C1009', border: '1px solid rgba(239,68,68,0.15)' }}>
          <p className="text-sm font-semibold text-red-400 mb-4 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> Overdue tasks ({overdueTasks.length})
          </p>
          <ul className="space-y-0 divide-y divide-red-900/20">
            {overdueTasks.map(task => (
              <li key={task.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">{task.title}</p>
                  {task.clients && <p className="text-xs text-stone-500 mt-0.5">{task.clients.name}</p>}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-red-500 shrink-0">
                  <Clock className="h-3 w-3" />
                  {task.due_at ? formatDistanceToNow(new Date(task.due_at), { addSuffix: true }) : '—'}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
