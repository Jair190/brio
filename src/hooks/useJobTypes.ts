'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { isDevMode } from '@/lib/dev-mode'
import { queryKeys } from '@/lib/queryKeys'
import type { JobType } from '@/types/crm'
import { useOrg } from './useOrg'

const MOCK_JOB_TYPES: JobType[] = [
  { id: 'jt-1', org_id: 'dev-org-id', name: 'Drain Cleaning', color: '#3B82F6', created_at: new Date().toISOString() },
  { id: 'jt-2', org_id: 'dev-org-id', name: 'Water Heater', color: '#F59E0B', created_at: new Date().toISOString() },
  { id: 'jt-3', org_id: 'dev-org-id', name: 'Leak Repair', color: '#EF4444', created_at: new Date().toISOString() },
  { id: 'jt-4', org_id: 'dev-org-id', name: 'Inspection', color: '#10B981', created_at: new Date().toISOString() },
]

export function useJobTypes() {
  const { orgId } = useOrg()

  return useQuery({
    queryKey: queryKeys.jobTypes(orgId ?? ''),
    enabled: !!orgId,
    queryFn: async (): Promise<JobType[]> => {
      if (isDevMode()) return MOCK_JOB_TYPES
      const supabase = createClient()
      const { data } = await (supabase as any)
        .from('job_types')
        .select('*')
        .eq('org_id', orgId!)
        .order('name') as { data: JobType[] | null }
      return data ?? []
    },
  })
}

export function useCreateJobType() {
  const queryClient = useQueryClient()
  const { orgId } = useOrg()

  return useMutation({
    mutationFn: async (input: { name: string; color: string }) => {
      if (isDevMode()) return
      const supabase = createClient()
      const { error } = await (supabase as any)
        .from('job_types')
        .insert({ ...input, org_id: orgId! }) as { error: { message: string } | null }
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['job-types'] }),
  })
}

export function useUpdateJobType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<JobType> & { id: string }) => {
      if (isDevMode()) return
      const supabase = createClient()
      const { error } = await (supabase as any)
        .from('job_types').update(updates).eq('id', id) as { error: { message: string } | null }
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['job-types'] }),
  })
}

export function useDeleteJobType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      if (isDevMode()) return
      const supabase = createClient()
      const { error } = await (supabase as any)
        .from('job_types').delete().eq('id', id) as { error: { message: string } | null }
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['job-types'] }),
  })
}
