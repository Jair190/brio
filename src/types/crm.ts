export type TeamMemberRole = 'owner' | 'technician'
export type JobStage = 'lead' | 'quoted' | 'scheduled' | 'in_progress' | 'invoiced' | 'paid'
export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskStatus = 'open' | 'done'
export type ActivityType = 'call' | 'text' | 'email' | 'note' | 'site_visit'
export type ActivitySource = 'manual' | 'gmail'

export interface Organization {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  created_at: string
}

export interface TeamMember {
  id: string
  org_id: string
  user_id: string
  name: string
  email: string
  role: TeamMemberRole
  created_at: string
  organizations?: Organization
}

export interface ClientTag {
  id: string
  org_id: string
  name: string
  color: string
  created_at: string
}

export interface CRMClient {
  id: string
  org_id: string
  name: string
  phone: string | null
  email: string | null
  service_address: string | null
  billing_address: string | null
  notes: string | null
  created_at: string
  tags?: ClientTag[]
}

export interface JobType {
  id: string
  org_id: string
  name: string
  color: string
  created_at: string
}

export interface CRMJob {
  id: string
  org_id: string
  client_id: string | null
  assigned_to: string | null
  title: string
  job_type_id: string | null
  stage: JobStage
  scheduled_at: string | null
  quote_amount: number | null
  invoice_amount: number | null
  notes: string | null
  marketplace_job_id: string | null
  created_at: string
  updated_at: string
  clients?: Pick<CRMClient, 'id' | 'name' | 'phone' | 'email' | 'service_address'>
  job_types?: Pick<JobType, 'id' | 'name' | 'color'>
  team_members?: Pick<TeamMember, 'id' | 'name' | 'email'>
}

export interface Task {
  id: string
  org_id: string
  job_id: string | null
  client_id: string | null
  assigned_to: string | null
  title: string
  due_at: string | null
  priority: TaskPriority
  status: TaskStatus
  created_at: string
  clients?: Pick<CRMClient, 'id' | 'name'>
  crm_jobs?: Pick<CRMJob, 'id' | 'title'>
  team_members?: Pick<TeamMember, 'id' | 'name'>
}

export interface ActivityLog {
  id: string
  org_id: string
  client_id: string | null
  job_id: string | null
  team_member_id: string | null
  type: ActivityType
  source: ActivitySource
  subject: string | null
  body: string
  occurred_at: string
  created_at: string
  clients?: Pick<CRMClient, 'id' | 'name'>
  crm_jobs?: Pick<CRMJob, 'id' | 'title'>
  team_members?: Pick<TeamMember, 'id' | 'name'>
}

export interface GmailSyncState {
  id: string
  team_member_id: string
  last_synced_at: string | null
  history_id: string | null
}

export interface UnmatchedEmail {
  id: string
  org_id: string
  team_member_id: string | null
  gmail_message_id: string
  subject: string | null
  body: string | null
  sender: string | null
  occurred_at: string | null
  reviewed: boolean
  created_at: string
}

export const JOB_STAGES: { value: JobStage; label: string; color: string }[] = [
  { value: 'lead',        label: 'Lead',        color: '#6B7280' },
  { value: 'quoted',      label: 'Quoted',      color: '#F59E0B' },
  { value: 'scheduled',   label: 'Scheduled',   color: '#3B82F6' },
  { value: 'in_progress', label: 'In Progress', color: '#8B5CF6' },
  { value: 'invoiced',    label: 'Invoiced',    color: '#F97316' },
  { value: 'paid',        label: 'Paid',        color: '#10B981' },
]
