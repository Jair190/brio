'use client'

import { useState } from 'react'
import { useUpdateCRMJob } from '@/hooks/useCRMJobs'
import { useTasks, useCreateTask, useCompleteTask } from '@/hooks/useTasks'
import { useActivityLogs, useLogActivity } from '@/hooks/useActivityLogs'
import { useJobTypes } from '@/hooks/useJobTypes'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  X, DollarSign, Calendar, Phone, Mail, MapPin,
  CheckCircle2, Circle, Phone as PhoneIcon, MessageSquare, FileText,
  Plus, Briefcase,
} from 'lucide-react'
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { JOB_STAGES, type CRMJob, type JobStage, type ActivityType } from '@/types/crm'

function StageSelect({ jobId, current }: { jobId: string; current: JobStage }) {
  const update = useUpdateCRMJob()
  return (
    <Select
      value={current}
      onValueChange={val => update.mutate({ id: jobId, stage: val as JobStage })}
    >
      <SelectTrigger className="h-7 text-xs w-36 bg-white/5 border-white/10 text-white rounded-lg">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {JOB_STAGES.map(s => (
          <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const TYPE_ICONS: Record<ActivityType, React.ReactNode> = {
  call:       <PhoneIcon className="h-3.5 w-3.5" />,
  text:       <MessageSquare className="h-3.5 w-3.5" />,
  email:      <Mail className="h-3.5 w-3.5" />,
  note:       <FileText className="h-3.5 w-3.5" />,
  site_visit: <MapPin className="h-3.5 w-3.5" />,
}

const TYPE_COLORS: Record<ActivityType, string> = {
  call:       'bg-blue-900/30 text-blue-400',
  text:       'bg-green-900/20 text-green-400',
  email:      'bg-purple-900/20 text-purple-400',
  note:       'bg-white/8 text-stone-400',
  site_visit: 'bg-amber-900/20 text-amber-400',
}

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-stone-500 text-sm focus:outline-none focus:border-amber-600/50 transition-all duration-200"

function QuickLogForm({ jobId, clientId }: { jobId: string; clientId: string | null }) {
  const [open, setOpen] = useState(false)
  const logActivity = useLogActivity()
  const [type, setType] = useState<ActivityType>('note')
  const [body, setBody] = useState('')

  async function submit() {
    if (!body.trim()) return
    await logActivity.mutateAsync({
      type,
      body,
      subject: null,
      client_id: clientId,
      job_id: jobId,
      occurred_at: new Date().toISOString(),
    })
    setBody('')
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" /> Log activity
      </button>
    )
  }

  return (
    <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex gap-2">
        <Select value={type} onValueChange={v => setType(v as ActivityType)}>
          <SelectTrigger className="h-7 text-xs w-28 bg-white/5 border-white/10 text-white rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="note" className="text-xs">Note</SelectItem>
            <SelectItem value="call" className="text-xs">Call</SelectItem>
            <SelectItem value="text" className="text-xs">Text</SelectItem>
            <SelectItem value="email" className="text-xs">Email</SelectItem>
            <SelectItem value="site_visit" className="text-xs">Site visit</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Notes…"
        rows={2}
        className={inputCls + ' resize-none'}
      />
      <div className="flex gap-2">
        <button
          className="h-7 px-3 text-xs rounded-lg text-stone-400 border border-white/10 hover:bg-white/5 transition-all duration-200"
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
        <button
          className="h-7 px-3 text-xs rounded-lg text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-60 transition-all duration-200"
          disabled={logActivity.isPending}
          onClick={submit}
        >
          {logActivity.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

export function JobDrawer({ job, onClose }: { job: CRMJob; onClose: () => void }) {
  const { data: jobTypesData = [] } = useJobTypes()
  const { data: tasks = [] } = useTasks({ jobId: job.id })
  const { data: logs = [] } = useActivityLogs({ jobId: job.id })
  const completeTask = useCompleteTask()
  const updateJob = useUpdateCRMJob()
  const [editNotes, setEditNotes] = useState(false)
  const [notes, setNotes] = useState(job.notes ?? '')

  const stageInfo = JOB_STAGES.find(s => s.value === job.stage)

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative w-full max-w-lg shadow-2xl overflow-y-auto flex flex-col"
        style={{ background: '#1C1A17' }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between gap-3 p-5 sticky top-0 z-10"
          style={{ background: '#141210', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {stageInfo && (
                <span
                  className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: stageInfo.color }}
                >
                  {stageInfo.label}
                </span>
              )}
              {job.marketplace_job_id && (
                <span className="text-[10px] bg-amber-900/20 text-amber-400 border border-amber-700/20 rounded-full px-2 py-0.5 font-semibold">
                  Brio Lead
                </span>
              )}
            </div>
            <h2 className="font-display text-lg font-bold text-white leading-snug">{job.title}</h2>
          </div>
          <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors shrink-0 mt-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 flex-1">
          {/* Stage + Job type row */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500">Stage</span>
              <StageSelect jobId={job.id} current={job.stage} />
            </div>
            {job.job_types && (
              <div className="flex items-center gap-1.5 text-xs text-stone-500">
                <Briefcase className="h-3.5 w-3.5" />
                <span className="font-medium" style={{ color: job.job_types.color }}>
                  {job.job_types.name}
                </span>
              </div>
            )}
          </div>

          {/* Financials */}
          {(job.quote_amount || job.invoice_amount) && (
            <div className="flex gap-4">
              {job.quote_amount && (
                <div className="flex items-center gap-1.5 text-sm">
                  <DollarSign className="h-4 w-4 text-stone-600" />
                  <span className="text-stone-500 text-xs">Quote</span>
                  <span className="font-semibold text-white">${job.quote_amount.toLocaleString()}</span>
                </div>
              )}
              {job.invoice_amount && (
                <div className="flex items-center gap-1.5 text-sm">
                  <DollarSign className="h-4 w-4 text-stone-600" />
                  <span className="text-stone-500 text-xs">Invoice</span>
                  <span className="font-semibold text-white">${job.invoice_amount.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {/* Scheduled */}
          {job.scheduled_at && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-stone-600" />
              <span className="text-stone-400">{format(parseISO(job.scheduled_at), 'EEEE, MMMM d, yyyy — h:mm a')}</span>
            </div>
          )}

          {/* Client */}
          {job.clients && (
            <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Client</p>
              <p className="text-sm font-medium text-white">{job.clients.name}</p>
              <div className="flex flex-wrap gap-3 text-xs text-stone-500">
                {job.clients.phone && (
                  <a href={`tel:${job.clients.phone}`} className="flex items-center gap-1 hover:text-amber-400 transition-colors">
                    <Phone className="h-3.5 w-3.5" />{job.clients.phone}
                  </a>
                )}
                {job.clients.email && (
                  <a href={`mailto:${job.clients.email}`} className="flex items-center gap-1 hover:text-amber-400 transition-colors">
                    <Mail className="h-3.5 w-3.5" />{job.clients.email}
                  </a>
                )}
                {job.clients.service_address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />{job.clients.service_address}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Notes</p>
              {!editNotes && (
                <button
                  onClick={() => setEditNotes(true)}
                  className="text-xs text-amber-500 hover:text-amber-400 transition-colors"
                >
                  Edit
                </button>
              )}
            </div>
            {editNotes ? (
              <div className="space-y-2">
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  className={inputCls + ' resize-none'}
                />
                <div className="flex gap-2">
                  <button
                    className="h-7 px-3 text-xs rounded-lg text-stone-400 border border-white/10 hover:bg-white/5 transition-all duration-200"
                    onClick={() => { setNotes(job.notes ?? ''); setEditNotes(false) }}
                  >
                    Cancel
                  </button>
                  <button
                    className="h-7 px-3 text-xs rounded-lg text-white bg-amber-600 hover:bg-amber-500 transition-all duration-200"
                    onClick={async () => { await updateJob.mutateAsync({ id: job.id, notes }); setEditNotes(false) }}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-stone-400 whitespace-pre-line">
                {job.notes || <span className="text-stone-600 italic">No notes</span>}
              </p>
            )}
          </div>

          {/* Tasks */}
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Tasks</p>
            {tasks.length === 0 ? (
              <p className="text-xs text-stone-600">No tasks linked to this job.</p>
            ) : (
              <ul className="space-y-1.5">
                {tasks.map(task => (
                  <li key={task.id} className="flex items-start gap-2">
                    <button
                      onClick={() => task.status === 'open' && completeTask.mutate(task.id)}
                      className="mt-0.5 text-stone-600 hover:text-green-400 transition-colors shrink-0"
                    >
                      {task.status === 'done' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${task.status === 'done' ? 'line-through text-stone-600' : 'text-stone-300'}`}>
                        {task.title}
                      </p>
                      {task.due_at && (
                        <p className="text-xs text-stone-600">{format(parseISO(task.due_at), 'MMM d')}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Activity */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Activity</p>
            </div>
            <QuickLogForm jobId={job.id} clientId={job.client_id} />
            {logs.length > 0 && (
              <ul className="mt-3 space-y-3">
                {logs.map(log => (
                  <li key={log.id} className="flex gap-2.5">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${TYPE_COLORS[log.type]}`}>
                      {TYPE_ICONS[log.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      {log.subject && <p className="text-xs font-medium text-stone-300">{log.subject}</p>}
                      <p className="text-sm text-stone-500 line-clamp-3">{log.body}</p>
                      <p className="text-xs text-stone-600 mt-0.5">
                        {formatDistanceToNow(new Date(log.occurred_at), { addSuffix: true })}
                        {log.source === 'gmail' && ' · Gmail'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
