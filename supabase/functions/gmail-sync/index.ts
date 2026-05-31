// Supabase Edge Function — Gmail Sync
// Triggered by pg_cron every 2 minutes via pg_net HTTP call.
// Reads gmail_sync_state, fetches new messages via Gmail History API,
// matches senders to CRM clients, and writes activity_logs or unmatched_emails.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

interface SyncState {
  id: string
  team_member_id: string
  access_token: string
  refresh_token: string | null
  token_expires_at: string | null
  history_id: string | null
  last_synced_at: string | null
  gmail_email: string | null
  team_members: { org_id: string }
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) return null
  const data = await res.json() as { access_token: string; expires_in: number }
  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString()
  return data.access_token
}

async function getValidToken(state: SyncState): Promise<string | null> {
  const isExpired = state.token_expires_at
    ? new Date(state.token_expires_at) < new Date(Date.now() + 60_000)
    : true

  if (!isExpired) return state.access_token
  if (!state.refresh_token) return null

  const newToken = await refreshAccessToken(state.refresh_token)
  if (!newToken) return null

  await supabase
    .from('gmail_sync_state')
    .update({
      access_token: newToken,
      token_expires_at: new Date(Date.now() + 3600_000).toISOString(),
    })
    .eq('id', state.id)

  return newToken
}

interface GmailMessage {
  id: string
  threadId: string
  payload?: {
    headers?: { name: string; value: string }[]
    body?: { data?: string }
    parts?: { mimeType: string; body?: { data?: string } }[]
  }
  internalDate?: string
}

function extractHeader(msg: GmailMessage, name: string): string | null {
  return msg.payload?.headers?.find(h => h.name.toLowerCase() === name.toLowerCase())?.value ?? null
}

function decodeBody(msg: GmailMessage): string {
  const parts = msg.payload?.parts ?? []
  const textPart = parts.find(p => p.mimeType === 'text/plain')
  const rawData = textPart?.body?.data ?? msg.payload?.body?.data ?? null
  if (!rawData) return ''
  try {
    return atob(rawData.replace(/-/g, '+').replace(/_/g, '/'))
  } catch {
    return ''
  }
}

async function syncAccount(state: SyncState): Promise<void> {
  const token = await getValidToken(state)
  if (!token) {
    console.log(`[gmail-sync] No valid token for team_member ${state.team_member_id}`)
    return
  }

  const orgId = state.team_members.org_id

  // First sync: get current historyId from profile, save it, exit
  if (!state.history_id) {
    const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!profileRes.ok) return
    const profile = await profileRes.json() as { historyId: string }
    await supabase.from('gmail_sync_state').update({
      history_id: profile.historyId,
      last_synced_at: new Date().toISOString(),
    }).eq('id', state.id)
    return
  }

  // Fetch history since last sync
  const historyUrl = new URL('https://gmail.googleapis.com/gmail/v1/users/me/history')
  historyUrl.searchParams.set('startHistoryId', state.history_id)
  historyUrl.searchParams.set('historyTypes', 'messageAdded')
  historyUrl.searchParams.set('maxResults', '50')

  const historyRes = await fetch(historyUrl.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!historyRes.ok) return
  const historyData = await historyRes.json() as {
    history?: { messagesAdded?: { message: { id: string } }[] }[]
    historyId?: string
  }

  const newHistoryId = historyData.historyId ?? state.history_id
  const messageIds = (historyData.history ?? [])
    .flatMap(h => h.messagesAdded ?? [])
    .map(m => m.message.id)

  // Fetch full message details for each new message
  for (const msgId of messageIds) {
    const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}?format=full`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!msgRes.ok) continue
    const msg = await msgRes.json() as GmailMessage

    const from = extractHeader(msg, 'From') ?? ''
    const subject = extractHeader(msg, 'Subject')
    const body = decodeBody(msg).slice(0, 2000)
    const occurredAt = msg.internalDate
      ? new Date(parseInt(msg.internalDate)).toISOString()
      : new Date().toISOString()

    // Extract email address from "Name <email>" format
    const emailMatch = from.match(/<([^>]+)>/) ?? from.match(/([^\s]+@[^\s]+)/)
    const senderEmail = emailMatch?.[1]?.toLowerCase() ?? null

    if (!senderEmail) continue

    // Check if sender matches a CRM client in this org
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('org_id', orgId)
      .ilike('email', senderEmail)
      .single()

    if (client) {
      await supabase.from('activity_logs').insert({
        org_id: orgId,
        team_member_id: state.team_member_id,
        client_id: client.id,
        type: 'email',
        source: 'gmail',
        subject,
        body,
        occurred_at: occurredAt,
      })
    } else {
      // Check for duplicates by gmail_message_id
      const { data: existing } = await supabase
        .from('unmatched_emails')
        .select('id')
        .eq('gmail_message_id', msgId)
        .single()

      if (!existing) {
        await supabase.from('unmatched_emails').insert({
          org_id: orgId,
          team_member_id: state.team_member_id,
          gmail_message_id: msgId,
          subject,
          body,
          sender: senderEmail,
          occurred_at: occurredAt,
          reviewed: false,
        })
      }
    }
  }

  // Update sync state
  await supabase.from('gmail_sync_state').update({
    history_id: newHistoryId,
    last_synced_at: new Date().toISOString(),
  }).eq('id', state.id)
}

Deno.serve(async () => {
  try {
    const { data: states, error } = await supabase
      .from('gmail_sync_state')
      .select('*, team_members(org_id)')
      .not('access_token', 'is', null)

    if (error) throw error

    await Promise.allSettled((states as SyncState[]).map(syncAccount))

    return new Response(JSON.stringify({ ok: true, synced: states?.length ?? 0 }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[gmail-sync] Fatal error:', err)
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
