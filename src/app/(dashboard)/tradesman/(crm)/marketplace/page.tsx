'use client'

import { useState, useTransition } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { isDevMode } from '@/lib/dev-mode'
import { claimMarketplaceJob } from '@/lib/crm/actions'
import { queryKeys } from '@/lib/queryKeys'
import { MapPin, Clock, DollarSign, Zap, Inbox, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

type MarketplaceLead = {
  id: string
  title: string | null
  description: string
  city: string | null
  urgency: string | null
  estimated_cost_min: number | null
  estimated_cost_max: number | null
  ai_triage_result: {
    diagnosis: string
    estimated_complexity: string
  } | null
  created_at: string
}

const MOCK_LEADS: MarketplaceLead[] = [
  {
    id: 'mp-1',
    title: 'Kitchen faucet dripping constantly',
    description: 'Faucet has been dripping for two weeks.',
    city: 'San Francisco',
    urgency: 'soon',
    estimated_cost_min: 10000,
    estimated_cost_max: 20000,
    ai_triage_result: { diagnosis: 'Worn cartridge or O-ring inside the faucet body.', estimated_complexity: 'simple' },
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'mp-2',
    title: 'No hot water — water heater issue',
    description: 'Woke up with no hot water. Gas water heater, 8 years old.',
    city: 'Oakland',
    urgency: 'urgent',
    estimated_cost_min: 20000,
    estimated_cost_max: 60000,
    ai_triage_result: { diagnosis: 'Likely thermocouple failure or pilot light issue.', estimated_complexity: 'moderate' },
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: 'mp-3',
    title: 'Warm wet spot on living room floor',
    description: 'Warm wet area spreading on concrete floor.',
    city: 'San Jose',
    urgency: 'emergency',
    estimated_cost_min: 150000,
    estimated_cost_max: 500000,
    ai_triage_result: { diagnosis: 'Slab leak — pipe has burst beneath the foundation.', estimated_complexity: 'complex' },
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
]

const URGENCY: Record<string, { label: string; cls: string }> = {
  emergency: { label: 'Emergency', cls: 'bg-red-900/30 text-red-400 border border-red-700/30' },
  urgent:    { label: 'Urgent',    cls: 'bg-orange-900/20 text-orange-400 border border-orange-700/20' },
  soon:      { label: 'Soon',      cls: 'bg-amber-900/20 text-amber-400 border border-amber-700/20' },
  flexible:  { label: 'Flexible',  cls: 'bg-white/5 text-stone-400 border border-white/10' },
}

const COMPLEXITY: Record<string, string> = {
  simple:   'bg-green-900/20 text-green-400 border border-green-700/20',
  moderate: 'bg-blue-900/20 text-blue-400 border border-blue-700/20',
  complex:  'bg-purple-900/20 text-purple-400 border border-purple-700/20',
}

function ClaimButton({ jobId }: { jobId: string }) {
  const [isPending, startTransition] = useTransition()
  const [claimed, setClaimed] = useState(false)
  const queryClient = useQueryClient()

  function handleClaim() {
    startTransition(async () => {
      const result = await claimMarketplaceJob(jobId)
      if (!result?.error) {
        setClaimed(true)
        queryClient.invalidateQueries({ queryKey: queryKeys.marketplaceLeads() })
        queryClient.invalidateQueries({ queryKey: ['crm-jobs'] })
      }
    })
  }

  if (claimed) return (
    <span className="text-xs font-medium px-3 py-1.5 rounded-lg bg-green-900/20 text-green-400 border border-green-700/20">
      Claimed ✓
    </span>
  )

  return (
    <button
      onClick={handleClaim}
      disabled={isPending}
      className="text-sm font-medium px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white transition-all duration-200 flex items-center gap-1.5"
    >
      {isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Claiming…</> : 'Claim job'}
    </button>
  )
}

export default function MarketplacePage() {
  const { data: leads = [], isLoading } = useQuery({
    queryKey: queryKeys.marketplaceLeads(),
    queryFn: async (): Promise<MarketplaceLead[]> => {
      if (isDevMode()) return MOCK_LEADS
      const supabase = createClient()
      const { data } = await supabase
        .from('jobs')
        .select('id, title, description, city, urgency, estimated_cost_min, estimated_cost_max, ai_triage_result, created_at')
        .in('status', ['triaged'])
        .is('tradesman_id', null)
        .order('created_at', { ascending: false })
        .limit(50)
      return (data ?? []) as MarketplaceLead[]
    },
    refetchInterval: 60_000,
  })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Marketplace</h1>
        <p className="text-stone-400 text-sm mt-1">
          Homeowner-posted jobs available to claim. Claimed jobs enter your pipeline as leads.
        </p>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: '#1A1714', border: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Header */}
        <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Inbox className="h-4 w-4 text-amber-600" />
          <p className="text-sm font-semibold text-white">Available leads</p>
          {leads.length > 0 && (
            <span className="ml-auto text-xs text-stone-500">{leads.length} available</span>
          )}
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-stone-500 text-sm">Loading…</div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center px-6">
            <div className="h-14 w-14 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mb-4">
              <Inbox className="h-6 w-6 text-stone-500" />
            </div>
            <p className="text-sm font-medium text-stone-300">No leads right now</p>
            <p className="text-xs text-stone-500 mt-1.5 max-w-xs">New homeowner jobs will appear here as they&apos;re triaged.</p>
          </div>
        ) : (
          <ul>
            {leads.map((lead, i) => {
              const urgency = URGENCY[lead.urgency ?? 'flexible'] ?? URGENCY.flexible
              const complexity = lead.ai_triage_result?.estimated_complexity
              const hasCost = lead.estimated_cost_min != null && lead.estimated_cost_max != null

              return (
                <li key={lead.id} className="px-5 py-4 hover:bg-white/3 transition-colors duration-150"
                  style={i > 0 ? { borderTop: '1px solid rgba(255,255,255,0.05)' } : {}}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-semibold text-white text-sm">
                          {lead.title ?? lead.description.slice(0, 60)}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${urgency.cls}`}>
                          {urgency.label}
                        </span>
                        {complexity && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${COMPLEXITY[complexity] ?? ''}`}>
                            {complexity.charAt(0).toUpperCase() + complexity.slice(1)}
                          </span>
                        )}
                      </div>

                      {lead.ai_triage_result?.diagnosis && (
                        <p className="text-sm text-stone-400 mb-2 line-clamp-2">
                          {lead.ai_triage_result.diagnosis}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                        {lead.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {lead.city}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                        </span>
                        {hasCost && (
                          <span className="flex items-center gap-1 text-green-400 font-medium">
                            <DollarSign className="h-3 w-3" />
                            ${Math.round(lead.estimated_cost_min! / 100)}–${Math.round(lead.estimated_cost_max! / 100)}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-amber-600">
                          <Zap className="h-3 w-3" /> AI triaged
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <ClaimButton jobId={lead.id} />
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
