'use client'

import { useState } from 'react'
import { useCRMJobs } from '@/hooks/useCRMJobs'
import { ChevronLeft, ChevronRight, Calendar, Clock, DollarSign } from 'lucide-react'
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, isToday, parseISO } from 'date-fns'
import type { CRMJob } from '@/types/crm'
import { JOB_STAGES } from '@/types/crm'

function getStageColor(stage: CRMJob['stage']) {
  return JOB_STAGES.find(s => s.value === stage)?.color ?? '#6B7280'
}

function JobCard({ job }: { job: CRMJob }) {
  const color = getStageColor(job.stage)
  return (
    <div
      className="rounded-lg p-2 text-xs mb-1 cursor-pointer hover:opacity-90 transition-opacity"
      style={{ backgroundColor: color + '22', borderLeft: `3px solid ${color}` }}
    >
      <p className="font-medium text-white truncate">{job.title}</p>
      {job.clients && <p className="text-stone-400 truncate">{job.clients.name}</p>}
      <div className="flex items-center gap-2 mt-1 text-stone-500">
        {job.scheduled_at && (
          <span className="flex items-center gap-0.5">
            <Clock className="h-2.5 w-2.5" />
            {format(parseISO(job.scheduled_at), 'h:mma')}
          </span>
        )}
        {job.quote_amount && (
          <span className="flex items-center gap-0.5 text-green-400">
            <DollarSign className="h-2.5 w-2.5" />{job.quote_amount.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  )
}

const btnCls = "h-8 px-3 rounded-lg text-sm text-stone-400 hover:text-white transition-colors duration-150 flex items-center gap-1"
const btnStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }

export default function CalendarPage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const { data: jobs = [], isLoading } = useCRMJobs()

  const scheduledJobs = jobs.filter(j => j.scheduled_at)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  function jobsForDay(day: Date) {
    return scheduledJobs.filter(j => isSameDay(parseISO(j.scheduled_at!), day))
  }

  const unscheduled = jobs.filter(j => !j.scheduled_at && j.stage !== 'paid')

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Calendar</h1>
          <p className="text-stone-400 text-sm mt-1">
            {format(weekStart, 'MMMM d')} – {format(addDays(weekStart, 6), 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button style={btnStyle} className={btnCls} onClick={() => setWeekStart(subWeeks(weekStart, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button style={btnStyle} className={btnCls} onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
            Today
          </button>
          <button style={btnStyle} className={btnCls} onClick={() => setWeekStart(addWeeks(weekStart, 1))}>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Weekly grid */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="py-12 text-center text-stone-500 text-sm">Loading…</div>
          ) : (
            <div className="grid grid-cols-7 gap-2 min-w-[700px]">
              {days.map(day => {
                const dayJobs = jobsForDay(day)
                const today = isToday(day)
                return (
                  <div key={day.toISOString()} className="flex flex-col">
                    {/* Day header */}
                    <div className={`text-center py-2 mb-2 rounded-xl ${today ? 'bg-amber-600' : ''}`}
                      style={!today ? { background: 'rgba(255,255,255,0.05)' } : {}}>
                      <p className={`text-[10px] font-semibold uppercase tracking-wider ${today ? 'text-amber-100' : 'text-stone-500'}`}>
                        {format(day, 'EEE')}
                      </p>
                      <p className={`text-lg font-bold ${today ? 'text-white' : 'text-stone-300'}`}>
                        {format(day, 'd')}
                      </p>
                    </div>

                    {/* Day cell */}
                    <div className="flex-1 min-h-[400px] rounded-xl p-2"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {dayJobs.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-xs text-stone-700">—</p>
                        </div>
                      ) : (
                        dayJobs
                          .sort((a, b) => a.scheduled_at!.localeCompare(b.scheduled_at!))
                          .map(job => <JobCard key={job.id} job={job} />)
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Unscheduled sidebar */}
        <div className="w-56 shrink-0">
          <div className="rounded-2xl p-4 sticky top-0" style={{ background: '#1A1714', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-stone-500" />
              <h3 className="text-sm font-semibold text-white">Unscheduled</h3>
              <span className="ml-auto text-xs font-medium bg-white/8 text-stone-400 px-2 py-0.5 rounded-full">
                {unscheduled.length}
              </span>
            </div>
            {unscheduled.length === 0 ? (
              <p className="text-xs text-stone-500 text-center py-4">All jobs scheduled!</p>
            ) : (
              <div className="space-y-2">
                {unscheduled.map(job => {
                  const color = getStageColor(job.stage)
                  return (
                    <div
                      key={job.id}
                      className="rounded-lg p-2 text-xs cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: color + '22', borderLeft: `3px solid ${color}` }}
                    >
                      <p className="font-medium text-white truncate">{job.title}</p>
                      {job.clients && <p className="text-stone-400 truncate">{job.clients.name}</p>}
                      <p className="text-stone-500 mt-0.5 capitalize">{job.stage.replace('_', ' ')}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
