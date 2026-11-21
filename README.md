# ResumeAI — CV Builder

Ứng dụng tạo CV trực tuyến với AI hỗ trợ viết nội dung, tích hợp thanh toán Stripe và xuất PDF.

---

## Tính năng nổi bật

- **Block-based editor** — kéo thả, sắp xếp lại các block tự do
- **Templates có sẵn** — Simple, Professional, Creative, Harvard...
- **AI writing assistant** — viết lại summary và mô tả kinh nghiệm với dropdown lựa chọn (Google Gemini Flash)
- **Subscription & Credits** — tích hợp Stripe cho gói PRO/PREMIUM, gói credit lẻ, Stripe Webhooks (Thin Payload & Snapshot)
- **Admin Dashboard** — theo dõi doanh thu, quản lý người dùng, chỉnh credit thủ công, xem audit log
- **Auto-save** — tự động lưu xuống PostgreSQL sau 1.5s debounce
- **Undo / Redo** — lịch sử 50 bước
- **PDF export** — in A4 qua `window.print()` với CSS print
- **Authentication** — đăng nhập email/mật khẩu + Google OAuth (NextAuth v5)
- **Đặt lại mật khẩu** — OTP 6 chữ số qua email Resend (hết hạn sau 15 phút)
- **Dark mode** — hỗ trợ đầy đủ theme sáng/tối
- **Modern UI** — Vanilla CSS + biến CSS, glassmorphism, responsive, `lucide-react`

---

## Tech Stack

| Hạng mục | Công nghệ |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Database** | PostgreSQL (Supabase) + Prisma ORM |
| **Auth** | NextAuth.js v5 |
| **Payments** | Stripe |
| **State** | Zustand (undo/redo + autosave) |
| **Drag & Drop** | @dnd-kit |
| **Validation** | Zod |
| **AI** | Vercel AI SDK + Google Gemini Flash |
| **Email** | Resend |
| **PDF** | `@react-pdf/renderer` + CSS print |

---

## Cài đặt & Chạy dự án

```bash
# 1. Cài dependencies
npm install

# 2. Tạo file .env.local (xem mục Environment Variables bên dưới)

# 3. Đồng bộ schema database
npx prisma db push

# 4. Khởi động dev server
npm run dev
```

Truy cập: [http://localhost:3000](http://localhost:3000)

### Format code

```bash
npm run format        # Format mã nguồn và cấu hình bằng Prettier
npm run format:check  # Kiểm tra định dạng, không sửa file
```

Workspace `CV BUILDER` dùng extension **Prettier - Code formatter**
(`esbenp.prettier-vscode`) cho JavaScript, TypeScript và TSX, đồng thời format khi lưu.
Trong VS Code trên Windows, nhấn **Alt + Shift + F** để format file đang mở.
File `.tsx` cần ở chế độ ngôn ngữ **TypeScript React**; formatter có thể báo lỗi
nếu file có cú pháp không hợp lệ.

---

## Environment Variables

Tạo file `.env.local` ở thư mục gốc với nội dung sau:

```env
# ── Database (Supabase PostgreSQL) ──────────────────────────────
# Pooler (transaction mode) — dùng cho runtime
DATABASE_URL="postgresql://..."

# Pooler (session mode) — dùng cho migrations
DIRECT_URL="postgresql://..."

# ── Authentication (NextAuth v5) ─────────────────────────────────
AUTH_SECRET="..."          # Tạo bằng: npx auth secret
AUTH_URL="http://localhost:3000/api/auth"
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."

# ── Email (Resend) ────────────────────────────────────────────────
RESEND_API_KEY="..."

# ── AI (Google Gemini) ────────────────────────────────────────────
GOOGLE_GENERATIVE_AI_API_KEY="..."

# ── Stripe ────────────────────────────────────────────────────────
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Stripe Price IDs (lấy từ Stripe Dashboard)
STRIPE_PRO_PRICE_MONTHLY="price_..."
STRIPE_PRO_PRICE_YEARLY="price_..."
STRIPE_PREMIUM_PRICE_MONTHLY="price_..."
STRIPE_PREMIUM_PRICE_YEARLY="price_..."
```

> **Lưu ý:** File `.env.local` chứa thông tin bí mật — **không** commit lên Git.

---

## Cấu trúc dự án

```
cv-builder/
├── app/
│   ├── admin/        → Admin Dashboard (doanh thu, người dùng, audit log)
│   ├── api/          → API Routes (Auth, AI, Stripe Webhooks, CV)
│   ├── auth/         → Trang đăng nhập / đăng ký / đặt lại mật khẩu
│   ├── billing/      → Quản lý gói đăng ký của người dùng
│   ├── dashboard/    → Dashboard cá nhân (danh sách CV)
│   ├── editor/       → Trình chỉnh sửa CV (block editor)
│   ├── payment/      → Xử lý kết quả thanh toán (success/cancel)
│   └── pricing/      → Trang giá các gói dịch vụ
├── components/       → UI components (editor, dashboard, landing, shared)
├── lib/
│   ├── actions/      → Server Actions (CRUD CV, đặt lại mật khẩu, admin)
│   ├── services/     → Business logic (webhook, mail service)
│   ├── schemas/      → Zod schemas — định nghĩa cấu trúc CV
│   ├── stores/       → Zustand store (state, undo/redo, autosave)
│   └── blocks/       → Block factory & định nghĩa template
├── prisma/           → Schema database
├── public/           → Assets tĩnh
├── auth.ts           → Cấu hình NextAuth
└── next.config.ts    → Cấu hình Next.js
```

---

## Scripts

```bash
npm run dev      # Khởi động dev server (http://localhost:3000)
npm run build    # Build production
npm run start    # Chạy production server
npm run lint     # Kiểm tra lỗi ESLint
```

---

## Stripe Webhooks (local)

Để test Stripe webhook trên máy local, cài [Stripe CLI](https://stripe.com/docs/stripe-cli) rồi chạy:

```bash
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

Sao chép `whsec_...` được in ra vào `STRIPE_WEBHOOK_SECRET` trong `.env.local`.
