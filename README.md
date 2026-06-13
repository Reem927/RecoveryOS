# RecoveryOS

A clinical-grade physical therapy management platform that combines AI-powered assessments, voice interaction, and computer vision to streamline practitioner workflows and improve patient outcomes.

---

## Features

- **Patient Management** — onboard clients, track demographics, and manage active caseloads
- **AI Assessments** — automated leg/movement scan analysis with structured reporting
- **Sona Voice AI** — ElevenLabs-powered voice assistant for hands-free session guidance
- **Recovery Insights** — Claude-powered summaries and trend analysis across patient sessions
- **Computer Vision** — real-time pose/movement detection for objective functional scoring
- **3D Human Model** — interactive Three.js anatomical reference linked to scan data
- **Follow-up Engine** — automated session follow-ups and practitioner notifications via email and Telegram
- **Client Portal** — invite-based patient login flow with secure token authentication
- **Onboarding Flow** — multi-step practitioner and clinic registration

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui, Radix UI |
| Database | Supabase (PostgreSQL + Row-Level Security) |
| Auth | Clerk |
| AI — Language | Anthropic Claude (`claude-sonnet-4-6`) |
| AI — Voice | ElevenLabs |
| AI — Embeddings | Voyage AI |
| AI — Vision | Computer vision pipeline (see `lib/vision-fusion.ts`) |
| 3D | Three.js, React Three Fiber, Drei |
| Charts | Recharts |
| Email | Resend |
| Messaging | Telegram Bot API |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project
- Clerk application
- API keys for Anthropic, ElevenLabs, Voyage AI, and Resend

### Installation

```bash
git clone https://github.com/your-org/RecoveryOS.git
cd RecoveryOS
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

All required variables are documented in `.env.example`.

### Database

Run the migration files in `supabase/migrations/` (in chronological order) against your Supabase project using the Supabase CLI or dashboard SQL editor.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
  api/              # Route handlers (assessments, clients, sona, invites, …)
  dashboard/        # Practitioner dashboard
  client/           # Patient-facing portal (login, join, home)
  onboarding/       # Practitioner & clinic registration
  patients/         # Patient detail pages
  scan/             # Live assessment scan view
components/
  hydrawav3/        # Core clinical UI components
  ui/               # shadcn/ui base components
lib/
  supabase/         # Typed Supabase clients (server, client, admin)
  auth/             # Clerk-based session helpers
  leg-assessment-engine.ts
  vision-fusion.ts
  sonaVoice.ts
```

---

## Team

| Name | Role |
|---|---|
| **Reem** | Full Stack Engineer — Database & AI |
| **Brandon** | Backend Engineer — ElevenLabs AI Integration |
| **Aryan** | Frontend Engineer |
| **Ruthvik** | Backend Engineer — Computer Vision |
| **Krishna** | Frontend Engineer |
