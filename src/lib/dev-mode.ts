export function isDevMode() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return !url.startsWith('http')
}

export function devUser(role: 'client' | 'tradesman' = 'client') {
  return {
    id: 'dev-user-id',
    email: 'test@gmail.com',
    user_metadata: {
      full_name: role === 'tradesman' ? 'Test Plumber' : 'Test User',
      role,
    },
  }
}

export const DEV_USER = devUser('client')
