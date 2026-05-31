'use client'

import { use } from 'react'
import Link from 'next/link'
import { useCRMClient } from '@/hooks/useCRMClients'
import { useCRMJobs } from '@/hooks/useCRMJobs'
import { useTasks } from '@/hooks/useTasks'
import { useActivityLogs } from '@/hooks/useActivityLogs'
import { Phone, Mail, MapPin, ArrowLeft, Briefcase, CheckSquare, Activity } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { JOB_STAGES } from '@/types/crm'

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: client, isLoading } = useCRMClient(id)
  const { data: jobs = [] } = useCRMJobs()
  const { data: tasks = [] } = useTasks({ status: 'open' })
  const { data: logs = [] } = useActivityLogs({ clientId: id })

  const clientJobs = jobs.filter(j => j.client_id === id)
  const clientTasks = tasks.filter(t => t.client_id === id)

  if (isLoading) {
    return <div className="py-12 text-center text-stone-500 text-sm">Loading…</div>
  }

  if (!client) {
    return (
      <div className="py-12 text-center">
        <p className="text-stone-400">Client not found.</p>
        <Link href="/tradesman/clients" className="text-amber-500 text-sm mt-2 inline-block">← Back to clients</Link>
      </div>
    )
  }

  const cardCls = "rounded-2xl overflow-hidden"
  const cardStyle = { background: '#1A1714', border: '1px solid rgba(255,255,255,0.06)' }
  const sectionHeaderCls = "flex items-center gap-2 px-5 py-4 text-sm font-semibold text-white"
  const sectionHeaderStyle = { borderBottom: '1px solid rgba(255,255,255,0.06)' }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/tradesman/clients" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-300 mb-4 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Clients
        </Link>
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-amber-600/20 border border-amber-600/20 flex items-center justify-center text-amber-400 font-bold text-xl shrink-0">
            {client.name[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold text-white">{client.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-1.5 text-sm text-stone-500">
              {client.phone && (
                <a href={`tel:${client.phone}`} className="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
                  <Phone className="h-3.5 w-3.5" /> {client.phone}
                </a>
              )}
              {client.email && (
                <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
                  <Mail className="h-3.5 w-3.5" /> {client.email}
                </a>
              )}
              {client.service_address && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {client.service_address}
                </span>
              )}
            </div>
          </div>
          <Link href="/tradesman/pipeline">
            <button className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-amber-600 hover:bg-amber-500 px-3.5 py-2 rounded-xl transition-all duration-200">
              <Briefcase className="h-3.5 w-3.5" /> Add job
            </button>
          </Link>
        </div>
      </div>

      {client.notes && (
        <div className={cardCls} style={cardStyle}>
          <p className="px-5 py-4 text-sm text-stone-400">{client.notes}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Jobs */}
        <div className={cardCls} style={cardStyle}>
          <div className={sectionHeaderCls} style={sectionHeaderStyle}>
            <Briefcase className="h-4 w-4 text-stone-500" />
            Jobs
            <span className="ml-auto text-xs font-medium bg-white/8 text-stone-400 px-2 py-0.5 rounded-full">
              {clientJobs.length}
            </span>
          </div>
          <div className="px-5 py-3">
            {clientJobs.length === 0 ? (
              <p className="text-sm text-stone-500 py-4 text-center">No jobs yet</p>
            ) : (
              <ul>
                {clientJobs.map((job, i) => {
                  const stageConfig = JOB_STAGES.find(s => s.value === job.stage)
                  return (
                    <li key={job.id}
                      className="flex items-center justify-between gap-2 py-3"
                      style={i > 0 ? { borderTop: '1px solid rgba(255,255,255,0.05)' } : {}}>
                      <p className="text-sm text-stone-300">{job.title}</p>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white shrink-0"
                        style={{ backgroundColor: stageConfig?.color }}
                      >
                        {stageConfig?.label}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Open Tasks */}
        <div className={cardCls} style={cardStyle}>
          <div className={sectionHeaderCls} style={sectionHeaderStyle}>
            <CheckSquare className="h-4 w-4 text-stone-500" />
            Open tasks
            <span className="ml-auto text-xs font-medium bg-white/8 text-stone-400 px-2 py-0.5 rounded-full">
              {clientTasks.length}
            </span>
          </div>
          <div className="px-5 py-3">
            {clientTasks.length === 0 ? (
              <p className="text-sm text-stone-500 py-4 text-center">No open tasks</p>
            ) : (
              <ul>
                {clientTasks.map((task, i) => (
                  <li key={task.id}
                    className="flex items-center gap-2 py-3 text-sm text-stone-300"
                    style={i > 0 ? { borderTop: '1px solid rgba(255,255,255,0.05)' } : {}}>
                    <CheckSquare className="h-3.5 w-3.5 text-stone-600 shrink-0" />
                    {task.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Activity timeline */}
      <div className={cardCls} style={cardStyle}>
        <div className={sectionHeaderCls} style={sectionHeaderStyle}>
          <Activity className="h-4 w-4 text-stone-500" />
          Activity
          <span className="ml-auto text-xs font-medium bg-white/8 text-stone-400 px-2 py-0.5 rounded-full">
            {logs.length}
          </span>
        </div>
        <div className="px-5">
          {logs.length === 0 ? (
            <p className="text-sm text-stone-500 py-6 text-center">No activity logged yet</p>
          ) : (
            <ul>
              {logs.map((log, i) => (
                <li key={log.id}
                  className="py-4"
                  style={i > 0 ? { borderTop: '1px solid rgba(255,255,255,0.05)' } : {}}>
                  <div className="flex items-center gap-2 mb-1 text-xs text-stone-500">
                    <span className="capitalize font-medium text-stone-400">{log.type.replace('_', ' ')}</span>
                    {log.source === 'gmail' && <span className="text-purple-400">· Gmail</span>}
                    <span>· {formatDistanceToNow(new Date(log.occurred_at), { addSuffix: true })}</span>
                  </div>
                  {log.subject && <p className="text-sm font-medium text-stone-300">{log.subject}</p>}
                  <p className="text-sm text-stone-500 mt-0.5 line-clamp-3">{log.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
