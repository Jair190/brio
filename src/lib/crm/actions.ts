'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isDevMode } from '@/lib/dev-mode'

// ─── Onboarding ────────────────────────────────────────────────

export async function createOrganization(formData: FormData): Promise<{ error?: string }> {
  const name = (formData.get('name') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim() || null
  const email = (formData.get('email') as string)?.trim() || null

  if (!name) return { error: 'Company name is required' }

  // Verify auth with the user client, then use admin client to bypass RLS for initial setup
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient() as any

  const { data: org, error: orgError } = await admin
    .from('organizations')
    .insert({ name, phone, email })
    .select('id')
    .single() as { data: { id: string } | null; error: { message: string } | null }

  if (orgError || !org) return { error: orgError?.message ?? 'Failed to create organization' }

  const { error: memberError } = await admin.from('team_members').insert({
    org_id: org.id,
    user_id: user.id,
    name: user.user_metadata?.full_name ?? user.email ?? 'Owner',
    email: user.email ?? '',
    role: 'owner',
  }) as { error: { message: string } | null }

  if (memberError) return { error: memberError.message }

  redirect('/tradesman')
}

// ─── Join org flow ─────────────────────────────────────────────

export async function searchOrganizations(query: string): Promise<{ id: string; name: string; email: string | null }[]> {
  // New users have no team_member record yet, so RLS blocks the regular client.
  // Use admin client so the search works during onboarding.
  const admin = createAdminClient() as any
  const { data } = await admin
    .from('organizations')
    .select('id, name, email')
    .ilike('name', `%${query}%`)
    .limit(8) as { data: { id: string; name: string; email: string | null }[] | null }
  return data ?? []
}

export async function requestJoinOrganization(orgId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient() as any

  const { data: existing } = await admin
    .from('team_members')
    .select('id')
    .eq('user_id', user.id)
    .single() as { data: { id: string } | null }
  if (existing) return { error: 'You are already a member of a company.' }

  const { error } = await admin.from('join_requests').upsert({
    org_id: orgId,
    user_id: user.id,
    name: user.user_metadata?.full_name ?? user.email ?? 'Unknown',
    email: user.email ?? '',
    status: 'pending',
  }, { onConflict: 'org_id,user_id' }) as { error: { message: string } | null }

  if (error) return { error: error.message }
  return {}
}

export async function approveJoinRequest(requestId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const db = supabase as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: req } = await db
    .from('join_requests')
    .select('*')
    .eq('id', requestId)
    .eq('status', 'pending')
    .single() as { data: { id: string; org_id: string; user_id: string; name: string; email: string } | null }

  if (!req) return { error: 'Request not found or already handled.' }

  // Verify caller is owner of that org
  const { data: member } = await db
    .from('team_members')
    .select('role, org_id')
    .eq('user_id', user.id)
    .eq('org_id', req.org_id)
    .single() as { data: { role: string; org_id: string } | null }

  if (!member || member.role !== 'owner') return { error: 'Only the org owner can approve requests.' }

  const { error: memberErr } = await db.from('team_members').insert({
    org_id: req.org_id,
    user_id: req.user_id,
    name: req.name,
    email: req.email,
    role: 'technician',
  }) as { error: { message: string } | null }

  if (memberErr) return { error: memberErr.message }

  await db.from('join_requests').update({ status: 'approved' }).eq('id', requestId)

  revalidatePath('/tradesman/settings')
  return {}
}

export async function rejectJoinRequest(requestId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const db = supabase as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  await db.from('join_requests').update({ status: 'rejected' }).eq('id', requestId)
  revalidatePath('/tradesman/settings')
  return {}
}

// ─── Marketplace claim ─────────────────────────────────────────

export async function claimMarketplaceJob(jobId: string): Promise<{ error?: string }> {
  if (isDevMode()) {
    revalidatePath('/tradesman/marketplace')
    revalidatePath('/tradesman/pipeline')
    return {}
  }

  const supabase = await createClient()
  const db = supabase as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get team_member and org
  const { data: member } = await db
    .from('team_members')
    .select('id, org_id')
    .eq('user_id', user.id)
    .single() as { data: { id: string; org_id: string } | null }

  if (!member) return { error: 'No CRM organization found. Complete onboarding first.' }

  // Get the marketplace job + client profile
  const { data: marketplaceJob } = await (supabase as any)
    .from('jobs')
    .select('id, title, description, client_id, estimated_cost_max, urgency')
    .eq('id', jobId)
    .eq('status', 'triaged')
    .is('tradesman_id', null)
    .single() as { data: { id: string; title: string | null; description: string; client_id: string; estimated_cost_max: number | null; urgency: string } | null }

  if (!marketplaceJob) return { error: 'Job is no longer available' }

  const { data: homeownerProfile } = await (supabase as any)
    .from('profiles')
    .select('full_name, email, phone')
    .eq('id', marketplaceJob.client_id)
    .single() as { data: { full_name: string | null; email: string | null; phone: string | null } | null }

  // Find or create a CRM client from the homeowner profile
  let crmClientId: string | null = null
  if (homeownerProfile?.email) {
    const { data: existing } = await db
      .from('clients')
      .select('id')
      .eq('org_id', member.org_id)
      .eq('email', homeownerProfile.email)
      .single() as { data: { id: string } | null }

    if (existing) {
      crmClientId = existing.id
    } else {
      const { data: newClient } = await db
        .from('clients')
        .insert({
          org_id: member.org_id,
          name: homeownerProfile.full_name ?? 'Unknown',
          email: homeownerProfile.email,
          phone: homeownerProfile.phone,
        })
        .select('id')
        .single() as { data: { id: string } | null }
      crmClientId = newClient?.id ?? null
    }
  }

  // Create CRM job at lead stage
  await db.from('crm_jobs').insert({
    org_id: member.org_id,
    client_id: crmClientId,
    title: marketplaceJob.title ?? marketplaceJob.description.slice(0, 60),
    stage: 'lead',
    marketplace_job_id: jobId,
    quote_amount: marketplaceJob.estimated_cost_max
      ? marketplaceJob.estimated_cost_max / 100
      : null,
  })

  // Update the marketplace job
  await (supabase as any)
    .from('jobs')
    .update({ status: 'matched', tradesman_id: user.id })
    .eq('id', jobId)

  revalidatePath('/tradesman/marketplace')
  revalidatePath('/tradesman/pipeline')
  revalidatePath('/tradesman')

  return {}
}
