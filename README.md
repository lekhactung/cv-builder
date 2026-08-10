# ResumeAI — CV Builder
## Features

-  **Block-based editor** — drag, drop, and reorder blocks
-  **Built-in templates** — Simple, Professional, Creative, Harvard....
-  **AI writing assistant** — rewrites summaries and experience bullets with interactive dropdown options via Google Gemini 3.5 Flash
-  **Auto-save** — changes debounce to PostgreSQL every 1.5s
-  **Undo / Redo** — 50-step history
-  **PDF export** — browser-native `window.print()` with A4 print CSS
-  **Authentication** — email/password + Google OAuth (NextAuth v5)
-  **Password reset** — 6-digit OTP via Resend email (15-min expiry)
-  **Dark mode** — full dark/light theme support

---

## Tech Stack

| | |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Database** | PostgreSQL (Supabase) + Prisma ORM |
| **Auth** | NextAuth.js v5 |
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
```

Generate `AUTH_SECRET` with: `npx auth secret`

---

## Project Structure

```
app/           → Pages & API routes (Next.js App Router)
components/    → UI components (editor, dashboard, landing page)
lib/
  actions/     → Server Actions (CV CRUD, password reset)
  schemas/     → Zod schemas — source of truth for CV document shape
  stores/      → Zustand editor store (state, undo/redo, autosave)
  blocks/      → Block factory & template definitions
prisma/        → Database schema
auth.ts        → NextAuth configuration
```
