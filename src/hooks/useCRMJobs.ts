'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { isDevMode } from '@/lib/dev-mode'
import { queryKeys } from '@/lib/queryKeys'
import type { CRMJob, JobStage } from '@/types/crm'
import { useOrg } from './useOrg'

const MOCK_JOBS: CRMJob[] = [
  {
    id: 'mock-job-1',
    org_id: 'dev-org-id',
    client_id: 'mock-client-1',
    assigned_to: 'dev-member-id',
    title: 'Kitchen faucet replacement',
    job_type_id: null,
    stage: 'scheduled',
    scheduled_at: new Date(Date.now() + 86400000).toISOString(),
    quote_amount: 350,
    invoice_amount: null,
    notes: 'Moen faucet, customer will buy part ahead of time.',
    marketplace_job_id: null,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    clients: { id: 'mock-client-1', name: 'Maria Torres', phone: '(415) 555-0101', email: 'maria@example.com', service_address: '456 Valencia St, SF' },
  },
  {
    id: 'mock-job-2',
    org_id: 'dev-org-id',
    client_id: 'mock-client-2',
    assigned_to: null,
    title: 'Water heater diagnosis',
    job_type_id: null,
    stage: 'lead',
    scheduled_at: null,
    quote_amount: null,
    invoice_amount: null,
    notes: null,
    marketplace_job_id: 'mock-marketplace-1',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    clients: { id: 'mock-client-2', name: 'James Park', phone: '(510) 555-0202', email: 'james.park@example.com', service_address: '789 Grand Ave, Oakland' },
  },
  {
    id: 'mock-job-3',
    org_id: 'dev-org-id',
    client_id: 'mock-client-3',
    assigned_to: 'dev-member-id',
    title: 'Slab leak repair',
    job_type_id: null,
    stage: 'in_progress',
    scheduled_at: new Date(Date.now() - 86400000).toISOString(),
    quote_amount: 3200,
    invoice_amount: null,
    notes: 'Permit pulled. Jackhammering Tuesday.',
    marketplace_job_id: null,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date().toISOString(),
    clients: { id: 'mock-client-3', name: 'Linda Chen', phone: '(408) 555-0303', email: 'lchen@example.com', service_address: '321 Stevens Creek Blvd, SJ' },
  },
  {
    id: 'mock-job-4',
    org_id: 'dev-org-id',
    client_id: 'mock-client-1',
    assigned_to: 'dev-member-id',
    title: 'Annual backflow test',
    job_type_id: null,
    stage: 'invoiced',
    scheduled_at: null,
    quote_amount: 180,
    invoice_amount: 180,
    notes: null,
    marketplace_job_id: null,
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    updated_at: new Date().toISOString(),
    clients: { id: 'mock-client-1', name: 'Maria Torres', phone: '(415) 555-0101', email: 'maria@example.com', service_address: '456 Valencia St, SF' },
  },
]

export function useCRMJobs(filters?: { stage?: JobStage; assignedTo?: string }) {
  const { orgId } = useOrg()

  return useQuery({
    queryKey: queryKeys.jobs(orgId ?? '', filters),
    enabled: !!orgId,
    queryFn: async (): Promise<CRMJob[]> => {
      if (isDevMode()) {
        let jobs = MOCK_JOBS
        if (filters?.stage) jobs = jobs.filter(j => j.stage === filters.stage)
        return jobs
      }

      const supabase = createClient()
      const db = supabase as any
      let query = db
        .from('crm_jobs')
        .select('*, clients(id, name, phone, email, service_address), job_types(id, name, color), team_members(id, name, email)')
        .eq('org_id', orgId!)
        .order('created_at', { ascending: false })

      if (filters?.stage) query = query.eq('stage', filters.stage)
      if (filters?.assignedTo) query = query.eq('assigned_to', filters.assignedTo)

      const { data } = await query
      return ((data as CRMJob[]) ?? []) as CRMJob[]
    },
  })
}

export function useUpdateJobStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ jobId, stage }: { jobId: string; stage: JobStage }) => {
      if (isDevMode()) return
      const supabase = createClient()
      const { error } = await (supabase as any).from('crm_jobs').update({ stage }).eq('id', jobId) as { error: { message: string } | null }
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-jobs'] })
    },
  })
}

export function useCreateCRMJob() {
  const queryClient = useQueryClient()
  const { orgId } = useOrg()

  return useMutation({
    mutationFn: async (input: Partial<CRMJob> & { title: string }) => {
      if (isDevMode()) return { id: `mock-${Date.now()}`, org_id: 'dev-org-id', stage: 'lead' as JobStage, ...input }
      const supabase = createClient()
      const { data, error } = await (supabase as any)
        .from('crm_jobs')
        .insert({ ...input, org_id: orgId!, stage: input.stage ?? 'lead' })
        .select()
        .single() as { data: CRMJob; error: { message: string } | null }
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-jobs'] })
    },
  })
}

export function useUpdateCRMJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CRMJob> & { id: string }) => {
      if (isDevMode()) return
      const supabase = createClient()
      const { error } = await (supabase as any).from('crm_jobs').update(updates).eq('id', id) as { error: { message: string } | null }
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['crm-job'] })
    },
  })
}
