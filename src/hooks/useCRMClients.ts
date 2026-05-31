'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { isDevMode } from '@/lib/dev-mode'
import { queryKeys } from '@/lib/queryKeys'
import type { CRMClient } from '@/types/crm'
import { useOrg } from './useOrg'

const MOCK_CLIENTS: CRMClient[] = [
  {
    id: 'mock-client-1',
    org_id: 'dev-org-id',
    name: 'Maria Torres',
    phone: '(415) 555-0101',
    email: 'maria@example.com',
    service_address: '456 Valencia St, San Francisco, CA 94103',
    billing_address: null,
    notes: 'Has older copper pipes. Prefers morning appointments.',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'mock-client-2',
    org_id: 'dev-org-id',
    name: 'James Park',
    phone: '(510) 555-0202',
    email: 'james.park@example.com',
    service_address: '789 Grand Ave, Oakland, CA 94610',
    billing_address: null,
    notes: null,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'mock-client-3',
    org_id: 'dev-org-id',
    name: 'Linda Chen',
    phone: '(408) 555-0303',
    email: 'lchen@example.com',
    service_address: '321 Stevens Creek Blvd, San Jose, CA 95128',
    billing_address: null,
    notes: 'Rental property — contact landlord for access.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
]

export function useCRMClients(search?: string) {
  const { orgId } = useOrg()

  return useQuery({
    queryKey: queryKeys.clients(orgId ?? '', search),
    enabled: !!orgId,
    queryFn: async (): Promise<CRMClient[]> => {
      if (isDevMode()) {
        if (!search) return MOCK_CLIENTS
        const q = search.toLowerCase()
        return MOCK_CLIENTS.filter(
          c =>
            c.name.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q) ||
            c.phone?.includes(q),
        )
      }

      const supabase = createClient()
      const db = supabase as any
      let query = db
        .from('clients')
        .select('*')
        .eq('org_id', orgId!)
        .order('created_at', { ascending: false })

      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
      }

      const { data } = await query
      return ((data as CRMClient[]) ?? []) as CRMClient[]
    },
  })
}

export function useCRMClient(id: string) {
  return useQuery({
    queryKey: queryKeys.client(id),
    queryFn: async (): Promise<CRMClient | null> => {
      if (isDevMode()) return MOCK_CLIENTS.find(c => c.id === id) ?? null

      const supabase = createClient()
      const { data } = await (supabase as any).from('clients').select('*').eq('id', id).single() as { data: CRMClient | null }
      return data
    },
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()
  const { orgId } = useOrg()

  return useMutation({
    mutationFn: async (input: Omit<CRMClient, 'id' | 'org_id' | 'created_at'>) => {
      if (isDevMode()) return { id: `mock-${Date.now()}`, org_id: 'dev-org-id', created_at: new Date().toISOString(), ...input } as CRMClient
      const supabase = createClient()
      const { data, error } = await (supabase as any)
        .from('clients')
        .insert({ ...input, org_id: orgId! })
        .select()
        .single() as { data: CRMClient; error: { message: string } | null }
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CRMClient> & { id: string }) => {
      if (isDevMode()) return
      const supabase = createClient()
      const { error } = await (supabase as any).from('clients').update(updates).eq('id', id) as { error: { message: string } | null }
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['client'] })
    },
  })
}
