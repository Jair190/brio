'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { isDevMode } from '@/lib/dev-mode'
import { useOrg } from './useOrg'

interface JoinRequest {
  id: string
  org_id: string
  user_id: string
  name: string
  email: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export function useJoinRequests() {
  const { orgId } = useOrg()

  return useQuery({
    queryKey: ['join-requests', orgId ?? ''],
    enabled: !!orgId,
    queryFn: async (): Promise<JoinRequest[]> => {
      if (isDevMode()) return []
      const supabase = createClient()
      const { data } = await (supabase as any)
        .from('join_requests')
        .select('*')
        .eq('org_id', orgId!)
        .eq('status', 'pending')
        .order('created_at', { ascending: false }) as { data: JoinRequest[] | null }
      return data ?? []
    },
  })
}
