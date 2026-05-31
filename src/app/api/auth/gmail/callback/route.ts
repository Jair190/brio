import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/tradesman/settings?gmail=error`
    )
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/gmail/callback`

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/tradesman/settings?gmail=error`
    )
  }

  const tokens = await tokenRes.json() as {
    access_token: string
    refresh_token?: string
    expires_in: number
  }

  // Get Gmail user info to identify which account was connected
  const infoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const userInfo = await infoRes.json() as { email: string }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login`
    )
  }

  const { data: member } = await (supabase as any)
    .from('team_members')
    .select('id')
    .eq('user_id', user.id)
    .single() as { data: { id: string } | null }

  if (!member) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/tradesman/settings?gmail=error`
    )
  }

  // Upsert gmail_sync_state
  await (supabase as any).from('gmail_sync_state').upsert({
    team_member_id: member.id,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token ?? null,
    token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    gmail_email: userInfo.email,
    last_synced_at: null,
    history_id: null,
  }, { onConflict: 'team_member_id' })

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/tradesman/settings?gmail=connected`
  )
}
