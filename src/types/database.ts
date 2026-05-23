export type UserRole = 'client' | 'tradesman'
export type SubscriptionTier = 'basic' | 'pro'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due'
export type JobStatus =
  | 'pending_triage'
  | 'triaged'
  | 'matched'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'canceled'
export type Urgency = 'low' | 'medium' | 'high' | 'emergency'
export type ApplicationStatus = 'pending' | 'accepted' | 'declined'

export interface Profile {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface TradesmanProfile {
  id: string
  user_id: string
  license_number: string | null
  years_experience: number | null
  bio: string | null
  service_radius_miles: number
  is_verified: boolean
  is_available: boolean
  stripe_account_id: string | null
  subscription_tier: SubscriptionTier | null
  subscription_status: SubscriptionStatus | null
  created_at: string
  updated_at: string
}

export interface AiTriageResult {
  diagnosis: string
  recommended_action: 'diy' | 'professional'
  diy_steps?: string[]
  estimated_complexity: 'simple' | 'moderate' | 'complex'
  warnings: string[]
  parts_needed?: string[]
}

export interface Job {
  id: string
  client_id: string
  tradesman_id: string | null
  title: string
  description: string
  address: string
  city: string
  state: string
  zip: string
  latitude: number | null
  longitude: number | null
  ai_triage_result: AiTriageResult | null
  ai_recommended_diy: boolean
  status: JobStatus
  urgency: Urgency
  estimated_cost_min: number | null  // cents
  estimated_cost_max: number | null  // cents
  final_cost: number | null          // cents
  stripe_payment_intent_id: string | null
  created_at: string
  updated_at: string
}

export interface JobApplication {
  id: string
  job_id: string
  tradesman_id: string
  message: string | null
  proposed_price: number | null  // cents
  status: ApplicationStatus
  created_at: string
}

export interface Review {
  id: string
  job_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number  // 1–5
  comment: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  is_read: boolean
  metadata: Record<string, unknown> | null
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string | null
          role: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
        Relationships: []
      }
      tradesman_profiles: {
        Row: TradesmanProfile
        Insert: {
          id?: string
          user_id: string
          license_number?: string | null
          years_experience?: number | null
          bio?: string | null
          service_radius_miles?: number
          is_verified?: boolean
          is_available?: boolean
          stripe_account_id?: string | null
          subscription_tier?: SubscriptionTier | null
          subscription_status?: SubscriptionStatus | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<TradesmanProfile, 'id' | 'created_at'>>
        Relationships: []
      }
      jobs: {
        Row: Job
        Insert: {
          id?: string
          client_id: string
          tradesman_id?: string | null
          title: string
          description: string
          address: string
          city: string
          state?: string
          zip: string
          latitude?: number | null
          longitude?: number | null
          ai_triage_result?: AiTriageResult | null
          ai_recommended_diy?: boolean
          status?: JobStatus
          urgency: Urgency
          estimated_cost_min?: number | null
          estimated_cost_max?: number | null
          final_cost?: number | null
          stripe_payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Job, 'id' | 'created_at'>>
        Relationships: []
      }
      job_applications: {
        Row: JobApplication
        Insert: {
          id?: string
          job_id: string
          tradesman_id: string
          message?: string | null
          proposed_price?: number | null
          status?: ApplicationStatus
          created_at?: string
        }
        Update: Partial<Omit<JobApplication, 'id' | 'created_at'>>
        Relationships: []
      }
      reviews: {
        Row: Review
        Insert: {
          id?: string
          job_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: Partial<Omit<Review, 'id' | 'created_at'>>
        Relationships: []
      }
      notifications: {
        Row: Notification
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          body: string
          is_read?: boolean
          metadata?: Record<string, unknown> | null
          created_at?: string
        }
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>
        Relationships: []
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}
