'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { isDevMode } from '@/lib/dev-mode'
import { queryKeys } from '@/lib/queryKeys'
import type { ActivityLog, ActivityType } from '@/types/crm'
import { useOrg } from './useOrg'

const MOCK_LOGS: ActivityLog[] = [
  {
    id: 'mock-log-1',
    org_id: 'dev-org-id',
    client_id: 'mock-client-1',
    job_id: 'mock-job-1',
    team_member_id: 'dev-member-id',
    type: 'call',
    source: 'manual',
    subject: null,
    body: 'Called to confirm Tuesday 9am appointment. Customer confirmed.',
    occurred_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    clients: { id: 'mock-client-1', name: 'Maria Torres' },
    crm_jobs: { id: 'mock-job-1', title: 'Kitchen faucet replacement' },
    team_members: { id: 'dev-member-id', name: 'Test Plumber' },
  },
  {
    id: 'mock-log-2',
    org_id: 'dev-org-id',
    client_id: 'mock-client-3',
    job_id: 'mock-job-3',
    team_member_id: 'dev-member-id',
    type: 'site_visit',
    source: 'manual',
    subject: null,
    body: 'Initial site visit. Confirmed slab leak under kitchen. Marked area. Will get permit.',
    occurred_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    clients: { id: 'mock-client-3', name: 'Linda Chen' },
    crm_jobs: { id: 'mock-job-3', title: 'Slab leak repair' },
    team_members: { id: 'dev-member-id', name: 'Test Plumber' },
  },
  {
    id: 'mock-log-3',
    org_id: 'dev-org-id',
    client_id: 'mock-client-2',
    job_id: 'mock-job-2',
    team_member_id: null,
    type: 'email',
    source: 'gmail',
    subject: 'Re: Water heater not working',
    body: 'Hi, thank you for reaching out. We can come take a look this week. Does Wednesday afternoon work?',
    occurred_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
    clients: { id: 'mock-client-2', name: 'James Park' },
    crm_jobs: { id: 'mock-job-2', title: 'Water heater diagnosis' },
  },
]

export function useActivityLogs(filters?: { type?: ActivityType; clientId?: string; jobId?: string }) {
  const { orgId } = useOrg()

  return useQuery({
    queryKey: queryKeys.activity(orgId ?? '', filters),
    enabled: !!orgId,
    queryFn: async (): Promise<ActivityLog[]> => {
      if (isDevMode()) {
        let logs = MOCK_LOGS
        if (filters?.type) logs = logs.filter(l => l.type === filters.type)
        if (filters?.clientId) logs = logs.filter(l => l.client_id === filters.clientId)
        if (filters?.jobId) logs = logs.filter(l => l.job_id === filters.jobId)
        return logs
      }

      const supabase = createClient()
      const db = supabase as any
      let query = db
        .from('activity_logs')
        .select('*, clients(id, name), crm_jobs(id, title), team_members(id, name)')
        .eq('org_id', orgId!)
        .order('occurred_at', { ascending: false })

      if (filters?.type) query = query.eq('type', filters.type)
      if (filters?.clientId) query = query.eq('client_id', filters.clientId)
      if (filters?.jobId) query = query.eq('job_id', filters.jobId)

      const { data } = await query
      return ((data as ActivityLog[]) ?? []) as ActivityLog[]
    },
  })
}

export function useLogActivity() {
  const queryClient = useQueryClient()
  const { orgId, teamMemberId } = useOrg()

  return useMutation({
    mutationFn: async (input: Pick<ActivityLog, 'type' | 'body' | 'subject' | 'client_id' | 'job_id' | 'occurred_at'>) => {
      if (isDevMode()) return
      const supabase = createClient()
      const { error } = await (supabase as any).from('activity_logs').insert({
        ...input,
        org_id: orgId!,
        team_member_id: teamMemberId,
        source: 'manual',
      }) as { error: { message: string } | null }
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity'] })
    },
  })
}
