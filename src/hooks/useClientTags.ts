'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { isDevMode } from '@/lib/dev-mode'
import { queryKeys } from '@/lib/queryKeys'
import type { ClientTag } from '@/types/crm'
import { useOrg } from './useOrg'

const MOCK_TAGS: ClientTag[] = [
  { id: 'tag-1', org_id: 'dev-org-id', name: 'VIP', color: '#F59E0B', created_at: new Date().toISOString() },
  { id: 'tag-2', org_id: 'dev-org-id', name: 'Repeat customer', color: '#10B981', created_at: new Date().toISOString() },
  { id: 'tag-3', org_id: 'dev-org-id', name: 'Commercial', color: '#6366F1', created_at: new Date().toISOString() },
]

export function useClientTags() {
  const { orgId } = useOrg()

  return useQuery({
    queryKey: queryKeys.clientTags(orgId ?? ''),
    enabled: !!orgId,
    queryFn: async (): Promise<ClientTag[]> => {
      if (isDevMode()) return MOCK_TAGS
      const supabase = createClient()
      const { data } = await (supabase as any)
        .from('client_tags')
        .select('*')
        .eq('org_id', orgId!)
        .order('name') as { data: ClientTag[] | null }
      return data ?? []
    },
  })
}

export function useCreateClientTag() {
  const queryClient = useQueryClient()
  const { orgId } = useOrg()

  return useMutation({
    mutationFn: async (input: { name: string; color: string }) => {
      if (isDevMode()) return
      const supabase = createClient()
      const { error } = await (supabase as any)
        .from('client_tags')
        .insert({ ...input, org_id: orgId! }) as { error: { message: string } | null }
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client-tags'] }),
  })
}

export function useDeleteClientTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      if (isDevMode()) return
      const supabase = createClient()
      const { error } = await (supabase as any)
        .from('client_tags').delete().eq('id', id) as { error: { message: string } | null }
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client-tags'] }),
  })
}
