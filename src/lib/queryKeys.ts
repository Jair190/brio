export const queryKeys = {
  org: () => ['org'] as const,
  clients: (orgId: string, search?: string) => ['clients', orgId, search] as const,
  client: (id: string) => ['client', id] as const,
  jobs: (orgId: string, filters?: Record<string, unknown>) => ['crm-jobs', orgId, filters] as const,
  job: (id: string) => ['crm-job', id] as const,
  jobTypes: (orgId: string) => ['job-types', orgId] as const,
  tasks: (orgId: string, filters?: Record<string, unknown>) => ['tasks', orgId, filters] as const,
  activity: (orgId: string, filters?: Record<string, unknown>) => ['activity', orgId, filters] as const,
  unmatchedEmails: (orgId: string) => ['unmatched-emails', orgId] as const,
  teamMembers: (orgId: string) => ['team-members', orgId] as const,
  clientTags: (orgId: string) => ['client-tags', orgId] as const,
  marketplaceLeads: () => ['marketplace-leads'] as const,
}
