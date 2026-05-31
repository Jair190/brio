'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { isDevMode } from '@/lib/dev-mode'
import { queryKeys } from '@/lib/queryKeys'
import type { UnmatchedEmail } from '@/types/crm'
import { useOrg } from './useOrg'

const MOCK_UNMATCHED: UnmatchedEmail[] = [
  {
    id: 'um-1',
    org_id: 'dev-org-id',
    team_member_id: 'dev-member-id',
    gmail_message_id: 'gmail-abc123',
    subject: 'Toilet keeps running — need help',
    body: 'Hi there, my toilet has been running constantly for two days. I found your number online. Can you come take a look? My address is 421 Oak St, Palo Alto. — Kevin',
    sender: 'kevin.wu@gmail.com',
    occurred_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    reviewed: false,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'um-2',
    org_id: 'dev-org-id',
    team_member_id: 'dev-member-id',
    gmail_message_id: 'gmail-def456',
    subject: 'Water pressure problem',
    body: 'Hello, we have very low water pressure throughout our house. This started after the weekend. Do you handle this? We are at 789 Pine Ave, Sunnyvale. Thanks, Sandra',
    sender: 'sandra.kim@yahoo.com',
    occurred_at: new Date(Date.now() - 86400000).toISOString(),
    reviewed: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
]

export function useUnmatchedEmails() {
  const { orgId } = useOrg()

  return useQuery({
    queryKey: queryKeys.unmatchedEmails(orgId ?? ''),
    enabled: !!orgId,
    queryFn: async (): Promise<UnmatchedEmail[]> => {
      if (isDevMode()) return MOCK_UNMATCHED
      const supabase = createClient()
      const { data } = await (supabase as any)
        .from('unmatched_emails')
        .select('*')
        .eq('org_id', orgId!)
        .eq('reviewed', false)
        .order('occurred_at', { ascending: false }) as { data: UnmatchedEmail[] | null }
      return data ?? []
    },
  })
}

export function useMarkEmailReviewed() {
  const queryClient = useQueryClient()
  const { orgId } = useOrg()

  return useMutation({
    mutationFn: async (id: string) => {
      if (isDevMode()) return
      const supabase = createClient()
      const { error } = await (supabase as any)
        .from('unmatched_emails')
        .update({ reviewed: true })
        .eq('id', id) as { error: { message: string } | null }
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.unmatchedEmails(orgId ?? '') }),
  })
}
