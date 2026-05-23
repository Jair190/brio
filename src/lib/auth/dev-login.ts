'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function devLogin() {
  const cookieStore = await cookies()
  cookieStore.set('dev_session', '1', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })
  redirect('/client')
}
