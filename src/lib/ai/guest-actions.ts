'use server'

import { triagePlumbingIssue, type TriageOutput } from './triage'
import type { Urgency } from '@/types/database'

export async function runGuestTriage(
  description: string,
  urgency: Urgency,
): Promise<TriageOutput> {
  return triagePlumbingIssue(description, urgency)
}
