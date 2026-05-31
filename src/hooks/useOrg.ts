'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { isDevMode } from '@/lib/dev-mode'
import { queryKeys } from '@/lib/queryKeys'
import type { TeamMember, Organization } from '@/types/crm'

type OrgData = TeamMember & { organizations: Organization }

const DEV_ORG_DATA: OrgData = {
  id: 'dev-member-id',
  org_id: 'dev-org-id',
  user_id: 'dev-user-id',
  name: 'Test Plumber',
  email: 'test@gmail.com',
  role: 'owner',
  created_at: new Date().toISOString(),
  organizations: {
    id: 'dev-org-id',
    name: 'Test Plumbing Co.',
    phone: '(415) 555-0100',
    email: 'hello@testplumbing.com',
    address: '123 Market St, San Francisco, CA',
    created_at: new Date().toISOString(),
  },
}

export function useOrg() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.org(),
    queryFn: async (): Promise<OrgData | null> => {
      if (isDevMode()) return DEV_ORG_DATA

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data } = await (supabase as any)
        .from('team_members')
        .select('*, organizations(*)')
        .eq('user_id', user.id)
        .single() as { data: OrgData | null }

      return data
    },
    staleTime: 5 * 60 * 1000,
  })

  return {
    orgId: data?.org_id ?? null,
    teamMemberId: data?.id ?? null,
    member: data ?? null,
    org: data?.organizations ?? null,
    isLoading,
    error,
    hasOrg: !!data,
  }
}
