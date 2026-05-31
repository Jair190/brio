'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { isDevMode } from '@/lib/dev-mode'
import { queryKeys } from '@/lib/queryKeys'
import type { Task, TaskStatus } from '@/types/crm'
import { useOrg } from './useOrg'

const MOCK_TASKS: Task[] = [
  {
    id: 'mock-task-1',
    org_id: 'dev-org-id',
    job_id: 'mock-job-1',
    client_id: 'mock-client-1',
    assigned_to: 'dev-member-id',
    title: 'Call Maria to confirm Tuesday appointment',
    due_at: new Date(Date.now() + 3600000 * 2).toISOString(),
    priority: 'high',
    status: 'open',
    created_at: new Date().toISOString(),
    clients: { id: 'mock-client-1', name: 'Maria Torres' },
    crm_jobs: { id: 'mock-job-1', title: 'Kitchen faucet replacement' },
  },
  {
    id: 'mock-task-2',
    org_id: 'dev-org-id',
    job_id: 'mock-job-3',
    client_id: 'mock-client-3',
    assigned_to: 'dev-member-id',
    title: 'Submit permit application to SF DBI',
    due_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    priority: 'high',
    status: 'open',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    clients: { id: 'mock-client-3', name: 'Linda Chen' },
    crm_jobs: { id: 'mock-job-3', title: 'Slab leak repair' },
  },
  {
    id: 'mock-task-3',
    org_id: 'dev-org-id',
    job_id: null,
    client_id: null,
    assigned_to: null,
    title: 'Order PEX pipe stock for next week',
    due_at: new Date(Date.now() + 86400000 * 2).toISOString(),
    priority: 'medium',
    status: 'open',
    created_at: new Date().toISOString(),
  },
]

export function useTasks(filters?: { status?: TaskStatus; assignedTo?: string; jobId?: string }) {
  const { orgId } = useOrg()

  return useQuery({
    queryKey: queryKeys.tasks(orgId ?? '', filters),
    enabled: !!orgId,
    queryFn: async (): Promise<Task[]> => {
      if (isDevMode()) {
        let tasks = MOCK_TASKS
        if (filters?.status) tasks = tasks.filter(t => t.status === filters.status)
        if (filters?.jobId) tasks = tasks.filter(t => t.job_id === filters.jobId)
        return tasks
      }

      const supabase = createClient()
      const db = supabase as any
      let query = db
        .from('tasks')
        .select('*, clients(id, name), crm_jobs(id, title), team_members(id, name)')
        .eq('org_id', orgId!)
        .order('due_at', { ascending: true, nullsFirst: false })

      if (filters?.status) query = query.eq('status', filters.status)
      if (filters?.assignedTo) query = query.eq('assigned_to', filters.assignedTo)
      if (filters?.jobId) query = query.eq('job_id', filters.jobId)

      const { data } = await query
      return ((data as Task[]) ?? []) as Task[]
    },
  })
}

export function useCompleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (taskId: string) => {
      if (isDevMode()) return
      const supabase = createClient()
      const { error } = await (supabase as any).from('tasks').update({ status: 'done' }).eq('id', taskId) as { error: { message: string } | null }
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  const { orgId } = useOrg()

  return useMutation({
    mutationFn: async (input: Omit<Task, 'id' | 'org_id' | 'created_at' | 'status'>) => {
      if (isDevMode()) return
      const supabase = createClient()
      const { error } = await (supabase as any).from('tasks').insert({ ...input, org_id: orgId!, status: 'open' }) as { error: { message: string } | null }
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
