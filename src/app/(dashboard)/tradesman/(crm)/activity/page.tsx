'use client'

import { useState } from 'react'
import { useActivityLogs, useLogActivity } from '@/hooks/useActivityLogs'
import { useUnmatchedEmails, useMarkEmailReviewed } from '@/hooks/useUnmatchedEmails'
import { useCRMClients } from '@/hooks/useCRMClients'
import { useCRMJobs } from '@/hooks/useCRMJobs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Activity, Phone, MessageSquare, Mail, FileText, MapPin, Plus, X, CheckCircle2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { ActivityType } from '@/types/crm'

const TYPE_ICONS: Record<ActivityType, React.ReactNode> = {
  call:       <Phone className="h-3.5 w-3.5" />,
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

function LogActivityModal({ onClose }: { onClose: () => void }) {
  const logActivity = useLogActivity()
  const { data: clients = [] } = useCRMClients()
  const { data: jobs = [] } = useCRMJobs()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    try {
      await logActivity.mutateAsync({
        type: fd.get('type') as ActivityType,
        body: fd.get('body') as string,
        subject: (fd.get('subject') as string) || null,
        client_id: (fd.get('client_id') as string) || null,
        job_id: (fd.get('job_id') as string) || null,
        occurred_at: new Date().toISOString(),
      })
      onClose()
    } catch {
      setError('Failed to log activity')
    }
  }

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-stone-500 text-sm focus:outline-none focus:border-amber-600/50 transition-all duration-200"
  const labelCls = "block text-xs font-medium text-stone-400 mb-1.5"

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md rounded-2xl" style={{ background: '#1C1A17', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 className="font-display font-bold text-white">Log activity</h2>
          <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Type <span className="text-amber-600">*</span></label>
              <Select name="type" required defaultValue="note">
                <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">📞 Call</SelectItem>
                  <SelectItem value="text">💬 Text</SelectItem>
                  <SelectItem value="email">📧 Email</SelectItem>
                  <SelectItem value="note">📝 Note</SelectItem>
                  <SelectItem value="site_visit">📍 Site visit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className={labelCls}>Client</label>
              <Select name="client_id">
                <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl h-10 text-sm">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Subject</label>
            <input name="subject" placeholder="Re: Appointment confirmation" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Notes <span className="text-amber-600">*</span></label>
            <textarea name="body" required rows={3} placeholder="What happened?" className={inputCls + ' resize-none'} />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-stone-400 border border-white/10 hover:bg-white/5 transition-all duration-200">
              Cancel
            </button>
            <button type="submit" disabled={logActivity.isPending} className="flex-1 py-2.5 rounded-xl text-sm text-white font-medium bg-amber-600 hover:bg-amber-500 disabled:opacity-60 transition-all duration-200">
              {logActivity.isPending ? 'Saving…' : 'Log activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ActivityFeed() {
  const { data: logs = [], isLoading } = useActivityLogs()
  const [showAdd, setShowAdd] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-stone-500">All client &amp; job interactions</p>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-all duration-200"
        >
          <Plus className="h-3.5 w-3.5" /> Log activity
        </button>
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ background: '#1A1714', border: '1px solid rgba(255,255,255,0.06)' }}>
        {isLoading ? (
          <div className="py-12 text-center text-stone-500 text-sm">Loading…</div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center px-6">
            <Activity className="h-10 w-10 mb-3 text-stone-700" />
            <p className="text-sm font-medium text-stone-300">No activity yet</p>
            <p className="text-xs text-stone-500 mt-1">Log calls, texts, emails, and site visits here.</p>
          </div>
        ) : (
          <ul>
            {logs.map((log, i) => (
              <li key={log.id} className="flex gap-3 px-5 py-4"
                style={i > 0 ? { borderTop: '1px solid rgba(255,255,255,0.05)' } : {}}>
                <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${TYPE_COLORS[log.type]}`}>
                  {TYPE_ICONS[log.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {log.clients && (
                      <span className="text-sm font-medium text-white">{log.clients.name}</span>
                    )}
                    {log.subject && (
                      <span className="text-sm text-stone-400">— {log.subject}</span>
                    )}
                    {log.source === 'gmail' && (
                      <span className="text-[10px] bg-purple-900/20 text-purple-400 border border-purple-700/20 rounded px-1.5 py-0.5 font-medium">Gmail</span>
                    )}
                  </div>
                  <p className="text-sm text-stone-400 mt-0.5 line-clamp-3">{log.body}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-stone-600">
                    {log.crm_jobs && <span>{log.crm_jobs.title}</span>}
                    <span>{formatDistanceToNow(new Date(log.occurred_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {showAdd && <LogActivityModal onClose={() => setShowAdd(false)} />}
    </>
  )
}

function UnmatchedEmailsTab() {
  const { data: emails = [], isLoading } = useUnmatchedEmails()
  const markReviewed = useMarkEmailReviewed()

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#1A1714', border: '1px solid rgba(255,255,255,0.06)' }}>
      {isLoading ? (
        <div className="py-12 text-center text-stone-500 text-sm">Loading…</div>
      ) : emails.length === 0 ? (
        <div className="flex flex-col items-center py-14 text-center px-6">
          <CheckCircle2 className="h-10 w-10 mb-3 text-stone-700" />
          <p className="text-sm font-medium text-stone-300">No unmatched emails</p>
          <p className="text-xs text-stone-500 mt-1">All synced emails have been matched to clients.</p>
        </div>
      ) : (
        <ul>
          {emails.map((email, i) => (
            <li key={email.id} className="flex gap-3 px-5 py-4"
              style={i > 0 ? { borderTop: '1px solid rgba(255,255,255,0.05)' } : {}}>
              <div className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-amber-900/20 text-amber-400">
                <Mail className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{email.sender ?? 'Unknown sender'}</p>
                    {email.subject && (
                      <p className="text-sm text-stone-400 mt-0.5">{email.subject}</p>
                    )}
                    {email.body && (
                      <p className="text-sm text-stone-500 mt-1 line-clamp-2">{email.body}</p>
                    )}
                    {email.occurred_at && (
                      <p className="text-xs text-stone-600 mt-1">
                        {formatDistanceToNow(new Date(email.occurred_at), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => markReviewed.mutate(email.id)}
                    disabled={markReviewed.isPending}
                    className="shrink-0 text-xs text-stone-500 hover:text-stone-300 border border-white/10 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-white/5 disabled:opacity-50"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

type Tab = 'feed' | 'unmatched'

export default function ActivityPage() {
  const [tab, setTab] = useState<Tab>('feed')
  const { data: unmatched = [] } = useUnmatchedEmails()

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Activity</h1>
      </div>

      <div className="flex gap-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => setTab('feed')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === 'feed'
              ? 'border-amber-600 text-amber-500'
              : 'border-transparent text-stone-500 hover:text-stone-300'
          }`}
        >
          Activity feed
        </button>
        <button
          onClick={() => setTab('unmatched')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === 'unmatched'
              ? 'border-amber-600 text-amber-500'
              : 'border-transparent text-stone-500 hover:text-stone-300'
          }`}
        >
          Unmatched emails
          {unmatched.length > 0 && (
            <span className="h-4 min-w-4 px-1 text-[10px] font-bold bg-amber-600 text-white rounded-full flex items-center justify-center">
              {unmatched.length}
            </span>
          )}
        </button>
      </div>

      {tab === 'feed' && <ActivityFeed />}
      {tab === 'unmatched' && <UnmatchedEmailsTab />}
    </div>
  )
}
