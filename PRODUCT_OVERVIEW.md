# Brio — Product Overview

**For:** CEO / Leadership  
**Last updated:** June 2026  
**Status:** Private Beta (Bay Area)

---

## What Is Brio?

Brio is a two-sided marketplace connecting Bay Area homeowners with licensed plumbers. It sits between the chaos of calling random contractors and the complexity of enterprise field-service software. The core loop is simple:

1. A homeowner describes their plumbing problem.
2. AI diagnoses it instantly — severity, likely cause, cost estimate, DIY vs. pro.
3. If they need a pro, they're matched with a vetted local plumber.
4. The plumber manages the job inside a built-in CRM.

Both sides get a complete product experience — not just a lead-gen form.

---

## The Two Users

### Clients (Homeowners)
Bay Area homeowners who have a plumbing problem and want clarity before calling anyone. They care about: knowing what's wrong, knowing roughly what it costs, and trusting who shows up.

### Tradesmen (Plumbers)
Licensed plumbing businesses and solo operators in the Bay Area. They care about: getting quality leads without wasting time, and managing their existing customers without juggling spreadsheets or sticky notes.

---

## Site Structure — Every Page

### Public (No Login Required)

| Page | URL | Purpose |
|------|-----|---------|
| Landing page | `/` | Marketing. Explains the value prop, drives to free diagnosis or founders page. |
| Free diagnosis | `/diagnose` | AI triage tool. Anyone can describe their issue and get a diagnosis instantly. No account needed. The main top-of-funnel entry point. |
| Founders | `/founders` | Team page. |
| Sign up (choose role) | `/signup` | Splits into client or tradesman signup. |
| Client signup | `/signup/client` | Email + password registration for homeowners. |
| Tradesman signup | `/signup/tradesman` | Email + password registration for plumbers. |
| Login | `/login` | Shared login. Redirects to the right dashboard based on role. |
| Forgot password | `/forgot-password` | Password reset request. |
| Update password | `/update-password` | Set a new password (reached via email link). |

---

### Client Dashboard (Logged-in Homeowners)

After login, clients land at `/client`. All pages use a light stone/white theme.

| Page | URL | Purpose |
|------|-----|---------|
| My requests | `/client` | Overview of all submitted jobs — active and past. |
| Active requests | `/client/active` | Jobs currently in progress. |
| Past requests | `/client/history` | Completed or canceled jobs. |
| Job detail | `/client/job/[id]` | Full detail for a specific job: description, AI diagnosis, status, cost estimate. |
| New request | `/client/new-request` | Full job submission form (address, description, urgency, photos). |

#### Client Job Status Flow
```
pending_triage → triaged → matched → confirmed → in_progress → completed
                                                              ↘ canceled
```
- **pending_triage** — just submitted, AI is analyzing
- **triaged** — AI has diagnosed it; either DIY recommended or pro needed
- **matched** — a plumber has claimed the job
- **confirmed** — plumber confirmed the appointment
- **in_progress** — job is underway
- **completed / canceled** — final states

---

### Tradesman CRM (Logged-in Plumbers)

After login, plumbers land at `/tradesman`. Dark charcoal theme with amber accents. Includes a full sidebar on desktop and a bottom navigation bar on mobile.

| Page | URL | Purpose |
|------|-----|---------|
| Overview | `/tradesman` | Dashboard: open job count, today's jobs, overdue tasks, monthly revenue. |
| Clients | `/tradesman/clients` | Full client list with search, tag filtering, and add-client modal. |
| Client detail | `/tradesman/clients/[id]` | Individual client profile: contact info, job history, notes, tags. |
| Pipeline | `/tradesman/pipeline` | Kanban board of all CRM jobs by stage (Lead → Quoted → Scheduled → In Progress → Invoiced → Paid). |
| Calendar | `/tradesman/calendar` | Scheduled jobs in a date view. |
| Tasks | `/tradesman/tasks` | To-do list tied to clients and jobs, with priority and due dates. |
| Activity | `/tradesman/activity` | Log of all client interactions — calls, texts, emails, site visits, notes. |
| Marketplace | `/tradesman/marketplace` | Incoming jobs from the client side. Plumbers can browse and claim leads. |
| Settings | `/tradesman/settings` | Organization profile, team members, job types, client tags, billing. |

#### CRM Job Pipeline Stages
```
Lead → Quoted → Scheduled → In Progress → Invoiced → Paid
```

---

### Onboarding Flow (New Tradesman Only)

| Page | URL | Purpose |
|------|-----|---------|
| Tradesman onboarding | `/tradesman/onboarding` | After signup, new plumbers either create a new organization (company) or join an existing one with an invite code. |

---

## How the Marketplace Bridge Works

The marketplace is the connection point between the two sides:

1. A client submits a job request.
2. The job appears in `/tradesman/marketplace` for all plumbers in the area.
3. A plumber clicks "Claim Job" — the job is assigned to them and a client record is automatically created in their CRM.
4. From that point forward, the plumber manages it through the pipeline.

This means a plumber's CRM can be populated two ways:
- **Manually** — they add their existing clients directly in the Clients tab.
- **From the marketplace** — a claimed lead auto-creates a client and a job in their CRM.

---

## AI Triage — How It Works

The free diagnosis at `/diagnose` (and within the client signup flow) runs a structured AI analysis of the homeowner's description. It returns:

- **Diagnosis** — what is likely causing the problem
- **Recommended action** — DIY or hire a professional
- **Complexity** — simple / moderate / complex
- **Estimated cost** — dollar range based on Bay Area labor + parts
- **DIY steps** — step-by-step instructions if self-repair is viable
- **Parts needed** — shopping list
- **Warnings** — anything dangerous or requiring permits

The AI result is stored in the database alongside the job, so the assigned plumber can see it too.

---

## Design System

The product uses a proprietary design language called **Copper & Craft**. There are three distinct visual contexts:

### 1. Public / Auth Pages (Dark — `#0C0A09`)
Landing page, login, signup, `/diagnose`. Deep near-black background, a copper radial glow at the top, a subtle grain texture overlay, and amber (`#D97706`) as the primary accent. Typography: Fraunces (display headings) + DM Sans (body).

### 2. Client Dashboard (Light — `#FAF9F6`)
All logged-in client pages. Off-white background, white cards with a light stone border (`#e7e5e4`), dark text (`stone-900`). Clean and approachable.

### 3. Tradesman CRM (Dark — `#0F0D0B`)
All logged-in plumber pages. Three layers of darkness:
- Page background: `#0F0D0B`
- Sidebar: `#141210`
- Cards and modals: `#1A1714` / `#1C1A17`

Amber accent throughout. Translucent white borders (`rgba(255,255,255,0.06)`). All inputs use a frosted-glass style with `bg-white/5`.

---

## Technology Stack

| Layer | Technology | What It Does |
|-------|-----------|--------------|
| Frontend framework | **Next.js 16** (App Router) | Serves all pages. Server components for fast loads, client components for interactive UI. |
| Database + Auth | **Supabase** | PostgreSQL database, user authentication, row-level security, file storage. |
| Hosting | **Vercel** | Automatic deployments on every push to GitHub `main`. |
| AI | **OpenAI / Anthropic** (via server actions) | Runs the plumbing diagnosis triage. |
| Real-time data | **TanStack Query v5** | Client-side data fetching and caching for the CRM. |
| Payments | **Stripe** (schema ready) | Plumber subscriptions and job payments (schema built, not yet wired to UI). |
| Email | **Supabase Auth** (+ Resend planned) | Sends confirmation and password reset emails. |
| Gmail sync | **Supabase Edge Functions** (in progress) | Will pull plumber Gmail threads into the Activity log automatically. |

---

## Database — Key Data Models

### Marketplace / Client Side
- **profiles** — every user (client or plumber), their role, email, name
- **jobs** — every plumbing request submitted by a client, including AI triage result
- **tradesman_profiles** — plumber-specific data: license, service radius, subscription tier
- **job_applications** — when a plumber applies to a marketplace job

### CRM / Plumber Side
- **organizations** — each plumbing company (e.g. "Golden Gate Plumbing")
- **team_members** — individual plumbers belonging to an organization
- **clients** — the plumber's client records (homeowners they've worked with)
- **client_tags** — custom labels plumbers can create (e.g. "VIP", "Rental")
- **crm_jobs** — jobs inside the plumber's pipeline (distinct from marketplace jobs)
- **tasks** — to-do items tied to clients/jobs
- **activity_log** — record of every client interaction

---

## Authentication & Access Control

- **Email + password** via Supabase Auth
- Email confirmation required to activate account (link goes to `/auth/callback`)
- **Role-based routing** — after login, clients go to `/client`, plumbers go to `/tradesman`
- **Row-Level Security (RLS)** — database enforces that plumbers can only see their own organization's data; clients can only see their own jobs
- **Multi-tenant** — each plumbing company is its own organization; team members share a single org

---

## Deployment Pipeline

```
Developer pushes to GitHub main
         ↓
Vercel detects the push
         ↓
Vercel builds and deploys automatically (< 2 minutes)
         ↓
Live at production URL
```

No manual deployment steps required. Every push to `main` is live within minutes.

---

## What's Built vs. What's Coming

### Built ✓
- Landing page + marketing
- Free AI diagnosis (no login required)
- Client signup, login, job submission
- Client dashboard with job status tracking
- Tradesman signup + onboarding (create or join org)
- Full tradesman CRM: clients, pipeline, calendar, tasks, activity, settings
- Marketplace lead feed + job claiming
- Password reset flow
- Mobile-responsive (client dashboard + CRM)

### In Progress / Planned
- **Gmail sync** — auto-pull email threads into the Activity log
- **Stripe payments** — subscription tiers for plumbers; client job payments
- **Plumber verification** — license check and manual review step
- **Notifications** — SMS/email when a job is claimed or status changes
- **Reviews** — post-job rating system (schema exists)
- **Geographic matching** — match jobs to plumbers by service radius
- **Analytics** — admin dashboard for internal metrics

---

## How to Access the Product

| Environment | URL | Notes |
|-------------|-----|-------|
| Production | Vercel deployment URL | Real Supabase database |
| Local dev | `localhost:3000` | Dev mode via `/beta` — no login required, use role switcher |

In local development, navigate to `/beta` to switch between the client and tradesman experiences without needing to log in.
