'use client'

import { useState } from 'react'
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useCRMJobs, useUpdateJobStage, useCreateCRMJob } from '@/hooks/useCRMJobs'
import { useCRMClients } from '@/hooks/useCRMClients'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, DollarSign, Calendar, X, GripVertical } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { JOB_STAGES, type JobStage, type CRMJob } from '@/types/crm'
import { JobDrawer } from '@/components/crm/JobDrawer'

function DraggableJobCard({
  job,
  onOpen,
}: {
  job: CRMJob
  onOpen: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: job.id,
    data: { job, stage: job.stage },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, background: '#1A1714', border: '1px solid rgba(255,255,255,0.08)' }}
      className="rounded-lg p-3 hover:border-amber-600/30 transition-colors group cursor-pointer"
    >
      <div className="flex items-start gap-1.5">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 text-stone-700 hover:text-stone-500 cursor-grab active:cursor-grabbing shrink-0 touch-none"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0" onClick={onOpen}>
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm font-medium text-white leading-snug line-clamp-2 hover:text-amber-400 transition-colors">
              {job.title}
            </p>
            {job.marketplace_job_id && (
              <span className="text-[10px] bg-amber-900/20 text-amber-400 border border-amber-700/20 rounded px-1.5 py-0.5 shrink-0 font-medium">
                Brio
              </span>
            )}
          </div>

          {job.clients && (
            <p className="text-xs text-stone-500 mb-2">{job.clients.name}</p>
          )}

          <div className="flex flex-wrap gap-2 text-xs text-stone-600">
            {job.quote_amount && (
              <span className="flex items-center gap-0.5 text-green-400">
                <DollarSign className="h-3 w-3" />{job.quote_amount.toLocaleString()}
              </span>
            )}
            {job.scheduled_at && (
              <span className="flex items-center gap-0.5 text-stone-500">
                <Calendar className="h-3 w-3" />
                {format(parseISO(job.scheduled_at), 'MMM d')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DroppableColumn({
  stage,
  label,
  color,
  jobs,
  onOpenJob,
}: {
  stage: JobStage
  label: string
  color: string
  jobs: CRMJob[]
  onOpenJob: (job: CRMJob) => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
    data: { stage },
  })

  return (
    <div className="flex-1 min-w-[220px] max-w-[280px] flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
        <span className="text-xs font-semibold text-stone-400 uppercase tracking-wide">{label}</span>
        <span className="ml-auto text-xs text-stone-600">{jobs.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 min-h-[100px] rounded-xl transition-all space-y-2 p-1.5"
        style={isOver
          ? { background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.25)' }
          : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }
        }
      >
        {jobs.map(job => (
          <DraggableJobCard key={job.id} job={job} onOpen={() => onOpenJob(job)} />
        ))}
        {jobs.length === 0 && (
          <div
            className="h-16 flex items-center justify-center rounded-lg border-dashed border transition-colors"
            style={isOver
              ? { borderColor: 'rgba(217,119,6,0.4)', background: 'rgba(217,119,6,0.05)' }
              : { borderColor: 'rgba(255,255,255,0.1)' }
            }
          >
            <p className="text-xs text-stone-600">{isOver ? 'Drop here' : 'No jobs'}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function AddJobModal({ onClose }: { onClose: () => void }) {
  const createJob = useCreateCRMJob()
  const { data: clients = [] } = useCRMClients()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    try {
      await createJob.mutateAsync({
        title: fd.get('title') as string,
        client_id: (fd.get('client_id') as string) || null,
        stage: (fd.get('stage') as JobStage) || 'lead',
        quote_amount: fd.get('quote_amount') ? Number(fd.get('quote_amount')) : null,
        notes: (fd.get('notes') as string) || null,
      })
      onClose()
    } catch {
      setError('Failed to create job')
    }
  }

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-stone-500 text-sm focus:outline-none focus:border-amber-600/50 transition-all duration-200"
  const labelCls = "block text-xs font-medium text-stone-400 mb-1.5"

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md rounded-2xl" style={{ background: '#1C1A17', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 className="font-display font-bold text-white">New job</h2>
          <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelCls}>Job title <span className="text-amber-600">*</span></label>
            <input name="title" required placeholder="Water heater replacement" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Client</label>
            <Select name="client_id">
              <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl h-10 text-sm">
                <SelectValue placeholder="Select client…" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Stage</label>
              <Select name="stage" defaultValue="lead">
                <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_STAGES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className={labelCls}>Quote ($)</label>
              <input name="quote_amount" type="number" min={0} step={0.01} placeholder="0.00" className={inputCls} />
            </div>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-stone-400 border border-white/10 hover:bg-white/5 transition-all duration-200">
              Cancel
            </button>
            <button type="submit" disabled={createJob.isPending} className="flex-1 py-2.5 rounded-xl text-sm text-white font-medium bg-amber-600 hover:bg-amber-500 disabled:opacity-60 transition-all duration-200">
              {createJob.isPending ? 'Creating…' : 'Create job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function PipelinePage() {
  const { data: jobs = [], isLoading } = useCRMJobs()
  const updateStage = useUpdateJobStage()
  const [showAdd, setShowAdd] = useState(false)
  const [activeJob, setActiveJob] = useState<CRMJob | null>(null)
  const [draggingJob, setDraggingJob] = useState<CRMJob | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  function handleDragStart(event: DragStartEvent) {
    setDraggingJob(event.active.data.current?.job ?? null)
  }

  function handleDragEnd(event: DragEndEvent) {
    setDraggingJob(null)
    const { active, over } = event
    if (!over) return
    const newStage = over.data.current?.stage as JobStage
    const job = active.data.current?.job as CRMJob
    if (!newStage || !job || newStage === job.stage) return
    updateStage.mutate({ jobId: job.id, stage: newStage })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Pipeline</h1>
          <p className="text-stone-400 text-sm mt-1">{jobs.length} total jobs</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200"
        >
          <Plus className="h-4 w-4" /> Add job
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-stone-500 text-sm">Loading…</div>
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 items-start">
            {JOB_STAGES.map(({ value, label, color }) => (
              <DroppableColumn
                key={value}
                stage={value}
                label={label}
                color={color}
                jobs={jobs.filter(j => j.stage === value)}
                onOpenJob={setActiveJob}
              />
            ))}
          </div>

          <DragOverlay>
            {draggingJob && (
              <div
                className="rounded-lg p-3 w-[250px] rotate-2 opacity-95"
                style={{ background: '#1A1714', border: '2px solid rgba(217,119,6,0.6)' }}
              >
                <p className="text-sm font-medium text-white truncate">{draggingJob.title}</p>
                {draggingJob.clients && (
                  <p className="text-xs text-stone-500 mt-0.5">{draggingJob.clients.name}</p>
                )}
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {showAdd && <AddJobModal onClose={() => setShowAdd(false)} />}
      {activeJob && <JobDrawer job={activeJob} onClose={() => setActiveJob(null)} />}
    </div>
  )
}
