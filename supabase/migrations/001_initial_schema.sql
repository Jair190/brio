-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- Tables
-- ==========================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('client', 'tradesman')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tradesman_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  license_number TEXT,
  years_experience INTEGER,
  bio TEXT,
  service_radius_miles INTEGER NOT NULL DEFAULT 25,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  stripe_account_id TEXT,
  -- null until they complete subscription checkout
  subscription_tier TEXT CHECK (subscription_tier IN ('basic', 'pro')),
  subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
  tradesman_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'CA',
  zip TEXT NOT NULL,
  latitude DECIMAL(9, 6),
  longitude DECIMAL(9, 6),
  -- Full AI triage response stored as JSONB (diagnosis, diy_steps, warnings, etc.)
  ai_triage_result JSONB,
  ai_recommended_diy BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending_triage'
    CHECK (status IN ('pending_triage', 'triaged', 'matched', 'confirmed', 'in_progress', 'completed', 'canceled')),
  urgency TEXT NOT NULL DEFAULT 'medium'
    CHECK (urgency IN ('low', 'medium', 'high', 'emergency')),
  estimated_cost_min INTEGER,  -- cents
  estimated_cost_max INTEGER,  -- cents
  final_cost INTEGER,          -- cents, set on job completion
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  tradesman_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT,
  proposed_price INTEGER,  -- cents
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, tradesman_id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL UNIQUE,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reviewee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- Indexes
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_tradesman_id ON jobs(tradesman_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_tradesman_profiles_available ON tradesman_profiles(is_available);

-- ==========================================
-- Auto-update updated_at
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tradesman_profiles_updated_at
  BEFORE UPDATE ON tradesman_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- Auto-create profile + tradesman_profile on signup
-- ==========================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );

  IF NEW.raw_user_meta_data->>'role' = 'tradesman' THEN
    INSERT INTO tradesman_profiles (
      user_id,
      license_number,
      years_experience,
      bio,
      service_radius_miles
    )
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'license_number',
      NULLIF(NEW.raw_user_meta_data->>'years_experience', '')::INTEGER,
      NEW.raw_user_meta_data->>'bio',
      COALESCE(NULLIF(NEW.raw_user_meta_data->>'service_radius_miles', '')::INTEGER, 25)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ==========================================
-- Row Level Security
-- ==========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tradesman_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- tradesman_profiles: public read so clients can see plumber info
CREATE POLICY "Public can view tradesman profiles"
  ON tradesman_profiles FOR SELECT USING (TRUE);
CREATE POLICY "Tradesmen can insert own profile"
  ON tradesman_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Tradesmen can update own profile"
  ON tradesman_profiles FOR UPDATE USING (auth.uid() = user_id);

-- jobs: clients see their own; tradesmen see open/assigned jobs
CREATE POLICY "Clients can view own jobs"
  ON jobs FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Clients can insert jobs"
  ON jobs FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients can update own jobs"
  ON jobs FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "Tradesmen can view available and assigned jobs"
  ON jobs FOR SELECT USING (
    status IN ('triaged', 'matched') OR tradesman_id = auth.uid()
  );

-- job_applications
CREATE POLICY "Tradesmen can view own applications"
  ON job_applications FOR SELECT USING (auth.uid() = tradesman_id);
CREATE POLICY "Tradesmen can insert applications"
  ON job_applications FOR INSERT WITH CHECK (auth.uid() = tradesman_id);
CREATE POLICY "Clients can view applications on their jobs"
  ON job_applications FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs WHERE jobs.id = job_id AND jobs.client_id = auth.uid()
    )
  );
CREATE POLICY "Clients can update application status"
  ON job_applications FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM jobs WHERE jobs.id = job_id AND jobs.client_id = auth.uid()
    )
  );

-- reviews: public read, only parties on a completed job can write
CREATE POLICY "Public can view reviews"
  ON reviews FOR SELECT USING (TRUE);
CREATE POLICY "Job parties can insert reviews"
  ON reviews FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_id
        AND (jobs.client_id = auth.uid() OR jobs.tradesman_id = auth.uid())
        AND jobs.status = 'completed'
    )
  );

-- notifications: users only see and update their own
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE USING (auth.uid() = user_id);
