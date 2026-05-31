-- ============================================================
-- Brio CRM Schema — Plumber (Tradesman) Side
-- Run this SQL in Supabase SQL Editor in order.
-- All tables are created first, then RLS policies are applied
-- at the end to avoid circular dependency issues.
-- ============================================================

-- ── ENUM TYPES ──────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE job_stage AS ENUM ('lead', 'quoted', 'scheduled', 'in_progress', 'invoiced', 'paid');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('open', 'done');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE activity_type AS ENUM ('call', 'text', 'email', 'note', 'site_visit');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE activity_source AS ENUM ('manual', 'gmail');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── TABLES ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'technician')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS client_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6B7280',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  service_address TEXT,
  billing_address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS client_tag_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES client_tags(id) ON DELETE CASCADE,
  UNIQUE(client_id, tag_id)
);

CREATE TABLE IF NOT EXISTS job_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6B7280',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  job_type_id UUID REFERENCES job_types(id) ON DELETE SET NULL,
  stage job_stage NOT NULL DEFAULT 'lead',
  scheduled_at TIMESTAMPTZ,
  quote_amount NUMERIC(10, 2),
  invoice_amount NUMERIC(10, 2),
  notes TEXT,
  marketplace_job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  job_id UUID REFERENCES crm_jobs(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  due_at TIMESTAMPTZ,
  priority task_priority NOT NULL DEFAULT 'medium',
  status task_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  job_id UUID REFERENCES crm_jobs(id) ON DELETE SET NULL,
  team_member_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  type activity_type NOT NULL,
  source activity_source NOT NULL DEFAULT 'manual',
  subject TEXT,
  body TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gmail_sync_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  gmail_email TEXT,
  last_synced_at TIMESTAMPTZ,
  history_id TEXT,
  UNIQUE(team_member_id)
);

CREATE TABLE IF NOT EXISTS unmatched_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_member_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  gmail_message_id TEXT NOT NULL,
  subject TEXT,
  body TEXT,
  sender TEXT,
  occurred_at TIMESTAMPTZ,
  reviewed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── TRIGGERS ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS crm_jobs_updated_at ON crm_jobs;
CREATE TRIGGER crm_jobs_updated_at
  BEFORE UPDATE ON crm_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── MARKETPLACE BRIDGE ────────────────────────────────────────

-- Ensure the existing marketplace jobs table has a tradesman_id column
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS tradesman_id UUID REFERENCES auth.users(id);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────
-- Applied after all tables exist to avoid forward-reference errors.

ALTER TABLE organizations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members           ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_tags            ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients                ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_types              ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_jobs               ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE gmail_sync_state       ENABLE ROW LEVEL SECURITY;
ALTER TABLE unmatched_emails       ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_org_only"               ON organizations;
DROP POLICY IF EXISTS "team_members_org_isolation"  ON team_members;
DROP POLICY IF EXISTS "org_isolation"               ON client_tags;
DROP POLICY IF EXISTS "org_isolation"               ON clients;
DROP POLICY IF EXISTS "org_isolation"               ON client_tag_assignments;
DROP POLICY IF EXISTS "org_isolation"               ON job_types;
DROP POLICY IF EXISTS "org_isolation"               ON crm_jobs;
DROP POLICY IF EXISTS "org_isolation"               ON tasks;
DROP POLICY IF EXISTS "org_isolation"               ON activity_logs;
DROP POLICY IF EXISTS "own_record_only"             ON gmail_sync_state;
DROP POLICY IF EXISTS "org_isolation"               ON unmatched_emails;

CREATE POLICY "own_org_only" ON organizations
  USING (id = (SELECT org_id FROM team_members WHERE user_id = auth.uid()));

CREATE POLICY "team_members_org_isolation" ON team_members
  USING (org_id = (SELECT org_id FROM team_members tm WHERE tm.user_id = auth.uid()));

CREATE POLICY "org_isolation" ON client_tags
  USING (org_id = (SELECT org_id FROM team_members WHERE user_id = auth.uid()));

CREATE POLICY "org_isolation" ON clients
  USING (org_id = (SELECT org_id FROM team_members WHERE user_id = auth.uid()));

CREATE POLICY "org_isolation" ON client_tag_assignments
  USING (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = client_id
      AND c.org_id = (SELECT org_id FROM team_members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "org_isolation" ON job_types
  USING (org_id = (SELECT org_id FROM team_members WHERE user_id = auth.uid()));

CREATE POLICY "org_isolation" ON crm_jobs
  USING (org_id = (SELECT org_id FROM team_members WHERE user_id = auth.uid()));

CREATE POLICY "org_isolation" ON tasks
  USING (org_id = (SELECT org_id FROM team_members WHERE user_id = auth.uid()));

CREATE POLICY "org_isolation" ON activity_logs
  USING (org_id = (SELECT org_id FROM team_members WHERE user_id = auth.uid()));

CREATE POLICY "own_record_only" ON gmail_sync_state
  USING (team_member_id = (SELECT id FROM team_members WHERE user_id = auth.uid()));

CREATE POLICY "org_isolation" ON unmatched_emails
  USING (org_id = (SELECT org_id FROM team_members WHERE user_id = auth.uid()));
