'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const BETA_PASSWORD = process.env.BETA_PASSWORD ?? 'jajogalo'

export async function submitBetaPassword(formData: FormData) {
  const password = formData.get('password')?.toString() ?? ''
  const role = formData.get('role')?.toString() ?? 'client'

  if (password !== BETA_PASSWORD) {
    return { error: 'Incorrect password. Try again.' }
  }

  const cookieStore = await cookies()
  cookieStore.set('dev_session', role, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })

  redirect(role === 'tradesman' ? '/tradesman' : '/client/new-request')
}
