'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isDevMode } from '@/lib/dev-mode'

export async function claimJob(jobId: string): Promise<{ error?: string }> {
  if (isDevMode()) {
    revalidatePath('/tradesman')
    return {}
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const db = supabase as unknown as {
    from: (t: string) => {
      update: (r: object) => { eq: (c: string, v: string) => { eq: (c: string, v: string) => Promise<{ error: { message: string } | null }> } }
    }
  }

  const { error } = await db
    .from('jobs')
    .update({ status: 'matched', tradesman_id: user.id })
    .eq('id', jobId)
    .eq('status', 'triaged')

  if (error) return { error: error.message }

  revalidatePath('/tradesman')
  return {}
}
