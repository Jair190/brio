'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { triagePlumbingIssue } from '@/lib/ai/triage'
import { isDevMode } from '@/lib/dev-mode'
import type { AiTriageResult, Urgency } from '@/types/database'

export type CreateJobInput = {
  description: string
  urgency: Urgency
  address: string
  city: string
  zip: string
}

export type CreateJobResult = {
  jobId: string
  triage: AiTriageResult
  estimated_cost_min?: number  // dollars
  estimated_cost_max?: number  // dollars
}

export async function createJobWithTriage(input: CreateJobInput): Promise<CreateJobResult> {
  if (isDevMode()) {
    const { triage, estimated_cost_min, estimated_cost_max } = await triagePlumbingIssue(
      input.description,
      input.urgency,
    )
    return { jobId: 'dev-job-id', triage, estimated_cost_min, estimated_cost_max }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const title = input.description.length > 60
    ? input.description.slice(0, 57) + '…'
    : input.description

  // Supabase v2 TS generics don't fully resolve for insert/update in this project's setup.
  // Using explicit type assertions for these operations; runtime behavior is correct.
  const db = supabase as unknown as {
    from: (table: string) => {
      insert: (row: object) => { select: (cols: string) => { single: () => Promise<{ data: { id: string } | null; error: { message: string } | null }> } }
      update: (row: object) => { eq: (col: string, val: string) => Promise<void> }
    }
  }

  const { data: job, error: insertError } = await db.from('jobs').insert({
    client_id: user.id,
    title,
    description: input.description,
    address: input.address,
    city: input.city,
    state: 'CA',
    zip: input.zip,
    urgency: input.urgency,
    status: 'pending_triage',
    ai_recommended_diy: false,
  }).select('id').single()

  if (insertError || !job) throw new Error(insertError?.message ?? 'Failed to create job')

  const { triage, estimated_cost_min, estimated_cost_max } = await triagePlumbingIssue(
    input.description,
    input.urgency,
  )

  await db.from('jobs').update({
    ai_triage_result: triage,
    ai_recommended_diy: triage.recommended_action === 'diy',
    status: 'triaged',
    ...(estimated_cost_min != null ? { estimated_cost_min: Math.round(estimated_cost_min * 100) } : {}),
    ...(estimated_cost_max != null ? { estimated_cost_max: Math.round(estimated_cost_max * 100) } : {}),
  }).eq('id', job.id)

  revalidatePath('/client')

  return { jobId: job.id, triage, estimated_cost_min, estimated_cost_max }
}
