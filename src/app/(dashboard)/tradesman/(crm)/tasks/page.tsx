'use client'

import { useState } from 'react'
import { useTasks, useCompleteTask, useCreateTask } from '@/hooks/useTasks'
import { useCRMClients } from '@/hooks/useCRMClients'
import { useCRMJobs } from '@/hooks/useCRMJobs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckSquare, Square, Clock, Plus, X, AlertCircle } from 'lucide-react'
import { formatDistanceToNow, isPast } from 'date-fns'
import type { TaskPriority } from '@/types/crm'

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; dot: string; badge: string }> = {
  high:   { label: 'High',   dot: 'bg-red-400',    badge: 'bg-red-900/30 text-red-400 border border-red-700/30' },
  medium: { label: 'Medium', dot: 'bg-amber-400',   badge: 'bg-amber-900/20 text-amber-400 border border-amber-700/20' },
  low:    { label: 'Low',    dot: 'bg-stone-500',   badge: 'bg-white/5 text-stone-400 border border-white/8' },
}

function AddTaskModal({ onClose }: { onClose: () => void }) {
  const createTask = useCreateTask()
  const { data: clients = [] } = useCRMClients()
  const { data: jobs = [] } = useCRMJobs()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    try {
      await createTask.mutateAsync({
        title: fd.get('title') as string,
        client_id: (fd.get('client_id') as string) || null,
        job_id: (fd.get('job_id') as string) || null,
        assigned_to: null,
        due_at: (fd.get('due_at') as string) ? new Date(fd.get('due_at') as string).toISOString() : null,
        priority: (fd.get('priority') as TaskPriority) || 'medium',
      })
      onClose()
    } catch {
      setError('Failed to create task')
    }
  }

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-stone-500 text-sm focus:outline-none focus:border-amber-600/50 transition-all duration-200"
  const labelCls = "block text-xs font-medium text-stone-400 mb-1.5"

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md rounded-2xl" style={{ background: '#1C1A17', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 className="font-display font-bold text-white">New task</h2>
          <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelCls}>Task <span className="text-amber-600">*</span></label>
            <input name="title" required placeholder="Call client to confirm…" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Priority</label>
              <Select name="priority" defaultValue="medium">
                <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className={labelCls}>Due date</label>
              <input name="due_at" type="datetime-local" className={inputCls + ' h-10'} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Link to client</label>
            <Select name="client_id">
              <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl h-10 text-sm">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className={labelCls}>Link to job</label>
            <Select name="job_id">
              <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl h-10 text-sm">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                {jobs.map(j => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-stone-400 border border-white/10 hover:bg-white/5 transition-all duration-200">
              Cancel
            </button>
            <button type="submit" disabled={createTask.isPending} className="flex-1 py-2.5 rounded-xl text-sm text-white font-medium bg-amber-600 hover:bg-amber-500 disabled:opacity-60 transition-all duration-200">
              {createTask.isPending ? 'Creating…' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function TasksPage() {
  const { data: tasks = [], isLoading } = useTasks({ status: 'open' })
  const completeTask = useCompleteTask()
  const [showAdd, setShowAdd] = useState(false)

  const overdue = tasks.filter(t => t.due_at && isPast(new Date(t.due_at)))
  const upcoming = tasks.filter(t => !t.due_at || !isPast(new Date(t.due_at)))

  function renderTask(task: typeof tasks[0]) {
    const isOverdue = task.due_at && isPast(new Date(task.due_at))
    const priorityCfg = PRIORITY_CONFIG[task.priority]

    return (
      <li key={task.id} className="flex items-start gap-3 py-3.5">
        <button
          onClick={() => completeTask.mutate(task.id)}
          className="mt-0.5 text-stone-600 hover:text-green-400 transition-colors shrink-0"
        >
          <Square className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">{task.title}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-stone-500">
            {task.clients && <span className="text-stone-400">{task.clients.name}</span>}
            {task.crm_jobs && <span>· {task.crm_jobs.title}</span>}
            {task.due_at && (
              <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-stone-500'}`}>
                {isOverdue && <AlertCircle className="h-3 w-3" />}
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(task.due_at), { addSuffix: true })}
              </span>
            )}
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${priorityCfg.badge}`}>
          {priorityCfg.label}
        </span>
      </li>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Tasks</h1>
          <p className="text-stone-400 text-sm mt-1">{tasks.length} open</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200"
        >
          <Plus className="h-4 w-4" /> Add task
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-stone-500 text-sm">Loading…</div>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl p-14 flex flex-col items-center text-center" style={{ background: '#1A1714', border: '1px solid rgba(255,255,255,0.06)' }}>
          <CheckSquare className="h-10 w-10 mb-3 text-stone-600" />
          <p className="text-sm font-medium text-stone-300">All caught up</p>
          <p className="text-xs text-stone-500 mt-1">No open tasks.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {overdue.length > 0 && (
            <div className="rounded-2xl px-5 py-1" style={{ background: '#1C0F0F', border: '1px solid rgba(239,68,68,0.15)' }}>
              <div className="flex items-center gap-2 py-4" style={{ borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
                <AlertCircle className="h-4 w-4 text-red-400" />
                <p className="text-sm font-semibold text-red-400">Overdue ({overdue.length})</p>
              </div>
              <ul style={{ borderTop: 'none' }}>
                {overdue.map(renderTask)}
              </ul>
            </div>
          )}

          <div className="rounded-2xl px-5 py-1" style={{ background: '#1A1714', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-semibold text-white">Upcoming ({upcoming.length})</p>
            </div>
            {upcoming.length === 0 ? (
              <p className="text-sm text-stone-500 py-6 text-center">No upcoming tasks</p>
            ) : (
              <ul>
                {upcoming.map(renderTask)}
              </ul>
            )}
          </div>
        </div>
      )}

      {showAdd && <AddTaskModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}
