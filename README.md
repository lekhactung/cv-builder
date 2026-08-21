# ResumeAI — CV Builder

## Features

- **Block-based editor** — drag, drop, and reorder blocks
- **Built-in templates** — Simple, Professional, Creative, Harvard....
- **AI writing assistant** — rewrites summaries and experience bullets with interactive dropdown options via Google Gemini 3.5 Flash
- **Subscription & Credits** — Stripe integration for PRO/PREMIUM plans, one-off credit packages, Stripe Webhooks (Thin Payload & Snapshot support)
- **Admin Dashboard** — monitor revenue and users, manage roles, manually adjust user credits, and view detailed audit logs
- **Auto-save** — changes debounce to PostgreSQL every 1.5s
- **Undo / Redo** — 50-step history
- **PDF export** — browser-native `window.print()` with A4 print CSS
- **Authentication** — email/password + Google OAuth (NextAuth v5)
- **Password reset** — 6-digit OTP via Resend email (15-min expiry)
- **Modern UI** — Vanilla CSS with custom properties, glassmorphism, responsive design, and `lucide-react` icons
- **Dark mode** — full dark/light theme support

---

## Tech Stack

| | |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Database** | PostgreSQL (Supabase) + Prisma ORM |
| **Auth** | NextAuth.js v5 |
| **Payments** | Stripe |
| **State** | Zustand (undo/redo + autosave) |
| **Drag & Drop** | @dnd-kit |
| **Validation** | Zod |
| **AI** | Vercel AI SDK + Google Gemini 3.5 Flash |
| **Email** | Resend |

---

## Getting Started

```bash
# 1. Clone & install
git clone <repo-url>
cd cv-builder
npm install

# 2. Set up environment variables
# Create .env.local with the variables listed below

# 3. Set up database
npx prisma db push

# 4. Start dev server
npm run dev

# 5. Local Stripe Webhooks
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

### Environment Variables

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

AUTH_SECRET="..."
AUTH_URL="http://localhost:3000"
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."

RESEND_API_KEY="..."
GOOGLE_GENERATIVE_AI_API_KEY="..."

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="..."
STRIPE_SECRET_KEY="..."
STRIPE_WEBHOOK_SECRET="..."
STRIPE_WEBHOOK_SECRET_THIN="..."
```

Generate `AUTH_SECRET` with: `npx auth secret`

---

## Project Structure

```
app/
  admin/       → Admin Dashboard, User Management, Payments, Plans
  api/         → Next.js API Routes (Webhooks, Auth, AI, Stripe)
  dashboard/   → User Dashboard (CVs, Billing)
components/    → UI components (editor, dashboard, landing page)
lib/
  actions/     → Server Actions (CV CRUD, password reset)
  services/    → Business logic (webhook service, mail service)
  schemas/     → Zod schemas — source of truth for CV document shape
  stores/      → Zustand editor store (state, undo/redo, autosave)
  blocks/      → Block factory & template definitions
prisma/        → Database schema
auth.ts        → NextAuth configuration
```
