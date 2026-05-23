'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isDevMode } from '@/lib/dev-mode'

export async function logout() {
  if (isDevMode()) {
    const cookieStore = await cookies()
    cookieStore.delete('dev_session')
    redirect('/')
  }

  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
