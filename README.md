# ResumeAI — CV Builder

Ứng dụng web tạo và quản lý CV bằng tiếng Việt, tích hợp AI hỗ trợ viết nội dung, trình chỉnh sửa kéo thả và thanh toán gói dịch vụ qua Stripe. Người dùng có thể xem trước CV khi chỉnh sửa, lưu vào PostgreSQL và xuất PDF để ứng tuyển.

## Tính năng

- **Trình chỉnh sửa theo block:** thêm, sửa và sắp xếp thông tin cá nhân, nội dung giới thiệu, kinh nghiệm, học vấn, kỹ năng, thẻ và liên kết.
- **Bốn mẫu CV:** Đơn giản, Chuyên nghiệp, Sáng tạo và Harvard; quyền dùng mẫu phụ thuộc gói dịch vụ.
- **Lưu tự động:** lưu sau 1,5 giây ngừng chỉnh sửa; undo/redo với tối đa 50 bước lịch sử.
- **AI viết lại nội dung:** dùng Gemini để đề xuất các phiên bản giới thiệu và mô tả kinh nghiệm. Mỗi yêu cầu hiện tốn 10 credits; có xử lý hoàn credits khi gọi AI thất bại.
- **Xuất PDF:** mở hộp thoại in của trình duyệt với bố cục A4 để lưu thành PDF.
- **Tài khoản:** đăng ký bằng email, đăng nhập bằng mật khẩu hoặc Google, cập nhật hồ sơ và đặt lại mật khẩu bằng mã xác nhận qua email.
- **Gói dịch vụ:** Free, Pro và Premium; thanh toán theo tháng/năm qua Stripe Checkout, quản lý đăng ký qua Billing Portal.
- **Quản trị:** quản lý người dùng, gói dịch vụ, thanh toán, điều chỉnh credits và xem lịch sử giao dịch/audit theo người dùng.
- **Giao diện sáng/tối:** font giao diện được lưu trong dự án, hỗ trợ tiếng Việt.

## Công nghệ

| Thành phần         | Công nghệ                                                            |
| ------------------ | -------------------------------------------------------------------- |
| Framework          | Next.js 16.2.9, App Router, React 19.2.4                             |
| Ngôn ngữ           | TypeScript                                                           |
| Giao diện          | Tailwind CSS 3, CSS variables, Lucide React                          |
| Database           | PostgreSQL, Prisma ORM 7, `@prisma/adapter-pg`                       |
| Xác thực           | NextAuth.js v5 beta, Prisma Adapter, bcryptjs                        |
| Trình chỉnh sửa    | Zustand, dnd-kit, Zod                                                |
| AI                 | Vercel AI SDK, Google Gemini (`gemini-2.5-flash` trong API hiện tại) |
| Thanh toán / Email | Stripe / Resend                                                      |
| Kiểm tra mã nguồn  | ESLint, TypeScript, Prettier                                         |

## Yêu cầu

- Node.js 24.x và npm. Prisma đang dùng cũng hỗ trợ Node.js 20 từ 20.19 hoặc Node.js 22 từ 22.12.
- PostgreSQL có kết nối SSL, chẳng hạn Supabase, phù hợp cấu hình hiện tại trong `lib/prisma.ts`.
- Stripe và Resend API keys. Code hiện khởi tạo hai SDK khi tải module, nên cần khai báo cả khi build.
- Google OAuth credentials để đăng nhập Google; Gemini API key để sử dụng AI.

Các lệnh dưới đây chạy trong thư mục chứa `package.json`. Nếu đang ở thư mục workspace `CV BUILDER`, chuyển vào ứng dụng trước:

```bash
cd cv-builder
```

## Biến môi trường

Tạo file `.env.local` trong thư mục ứng dụng và thay các giá trị mẫu trước khi cài dependencies:

```dotenv
# PostgreSQL: kết nối khi ứng dụng chạy
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"

# Kết nối trực tiếp hoặc session pooler cho Prisma CLI và seed
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"

# Xác thực và URL gốc của website
AUTH_SECRET="REPLACE_WITH_RANDOM_SECRET"
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Đăng nhập Google
AUTH_GOOGLE_ID="REPLACE_WITH_GOOGLE_CLIENT_ID"
AUTH_GOOGLE_SECRET="REPLACE_WITH_GOOGLE_CLIENT_SECRET"

# AI và email
GOOGLE_GENERATIVE_AI_API_KEY="REPLACE_WITH_GEMINI_API_KEY"
RESEND_API_KEY="re_REPLACE_WITH_API_KEY"

# Stripe: dùng bộ khóa test khi phát triển
STRIPE_SECRET_KEY="sk_test_REPLACE_WITH_SECRET_KEY"
STRIPE_WEBHOOK_SECRET="whsec_REPLACE_WITH_SIGNING_SECRET"

# Chỉ cần nếu cấu hình thêm endpoint webhook phụ /thin
STRIPE_WEBHOOK_SECRET_THIN=""

# Stripe Price IDs được ghi vào database khi seed
STRIPE_PRO_PRICE_MONTHLY="price_REPLACE_WITH_PRO_MONTHLY"
STRIPE_PRO_PRICE_YEARLY="price_REPLACE_WITH_PRO_YEARLY"
STRIPE_PREMIUM_PRICE_MONTHLY="price_REPLACE_WITH_PREMIUM_MONTHLY"
STRIPE_PREMIUM_PRICE_YEARLY="price_REPLACE_WITH_PREMIUM_YEARLY"
```

Tạo giá trị ngẫu nhiên cho `AUTH_SECRET`, sau đó sao chép kết quả vào file:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Lưu ý về cấu hình:

- `AUTH_URL` và `NEXT_PUBLIC_APP_URL` là URL gốc, **không thêm `/api/auth`**. Code dùng chúng để ghép URL quay về từ Stripe Checkout và Billing Portal.
- Prisma CLI và seed ưu tiên `DIRECT_URL`; nếu thiếu thì dùng `DATABASE_URL`.
- Tránh đặt cùng một biến với hai giá trị khác nhau trong `.env` và `.env.local`: bộ nạp của Prisma hiện đọc `.env` trước và giữ giá trị đã có.
- `STRIPE_SECRET_KEY` và `RESEND_API_KEY` cần có ở môi trường build theo cách khởi tạo SDK hiện tại. Các khóa dịch vụ phải hợp lệ để sử dụng tính năng tương ứng.
- Không commit `.env` hoặc `.env.local` lên Git.

## Chạy trên máy local

### 1. Cài dependencies

```bash
npm ci
```

Lệnh `postinstall` tự chạy `prisma generate`. Có thể tạo lại Prisma Client bằng `npx prisma generate` khi cần.

### 2. Khởi tạo database và dữ liệu gói

Với database mới, áp dụng các migration có sẵn rồi chạy seed:

```bash
npx prisma migrate deploy
npx prisma db seed
```

Seed tạo/cập nhật các gói Free, Pro, Premium cùng tính năng, quyền dùng template và Stripe Price IDs. Seed còn gán gói Free và credits ban đầu cho các tài khoản hiện có chưa có subscription; không tạo tài khoản admin.

Lệnh seed được cấu hình trong `prisma.config.ts` qua `npx tsx prisma/seed.ts`; lần đầu có thể cần tải `tsx`. Prisma 7 yêu cầu [chạy seed riêng](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/seeding). Chạy lại seed sẽ ghi lại giá và danh sách tính năng/template theo script, nên kiểm tra nội dung trước khi chạy trên database đã tùy chỉnh.

Khi phát triển thay đổi schema, tạo migration mới bằng:

```bash
npx prisma migrate dev --name describe_your_change
```

### 3. Khởi động ứng dụng

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000), đăng ký tài khoản và truy cập dashboard để tạo CV.

### 4. Cấp quyền quản trị khi cần

```bash
npx prisma studio
```

Trong bảng `User`, đổi trường `role` của tài khoản cần quản trị thành `ADMIN`. Đăng xuất và đăng nhập lại để cập nhật session, sau đó mở `/admin`.

## Cấu hình dịch vụ

### Google OAuth

Tạo OAuth client loại Web application, điền `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` và khai báo redirect URI cho môi trường tương ứng:

```text
http://localhost:3000/api/auth/callback/google
https://your-domain.example/api/auth/callback/google
```

### Gemini và credits

API `/api/ai/enhance` dùng `GOOGLE_GENERATIVE_AI_API_KEY`, kiểm tra quyền sử dụng AI và số dư trước khi gọi Gemini. Tài khoản cần ít nhất 10 credits cho mỗi yêu cầu hiện tại.

Luồng đăng ký hiện chưa tự tạo ví và cấp credits. Để thử AI với tài khoản mới, có thể cộng credits qua `/admin/credits`. Seed cũng cấp credits cho tài khoản chưa có subscription, nhưng đồng thời cập nhật cấu hình các gói như mô tả ở trên.

### Resend

Điền `RESEND_API_KEY` để dùng chức năng quên mật khẩu. Mã xác nhận có 6 chữ số và hết hạn sau 15 phút.

Địa chỉ gửi hiện là `CV Builder <onboarding@resend.dev>` trong `lib/actions/reset-password.ts`. Khi triển khai gửi email cho người dùng thực tế, cấu hình domain gửi trên Resend và cập nhật địa chỉ này.

### Stripe

Tạo recurring prices cho Pro và Premium theo tháng/năm, điền bốn Price IDs trước khi seed. API thanh toán đọc Price IDs từ bảng `Plan`; chỉ đổi biến môi trường sẽ chưa cập nhật các bản ghi đã seed. Bật Billing Portal trên Stripe để sử dụng chức năng quản lý đăng ký.

Endpoint chính `/api/webhook/stripe` xử lý các sự kiện:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`
- `invoice.payment_succeeded`

Để thử local, dùng [Stripe CLI và webhook listener](https://docs.stripe.com/webhooks):

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

Chép signing secret `whsec_...` từ CLI vào `STRIPE_WEBHOOK_SECRET` rồi khởi động lại ứng dụng. Thử thanh toán từ giao diện ứng dụng để Checkout Session có metadata gắn với người dùng và bản ghi thanh toán.

Endpoint `/api/webhook/stripe/thin` hiện chỉ xác minh chữ ký và trả xác nhận; chưa cập nhật thanh toán/subscription. Dùng endpoint chính với payload **Snapshot** cho luồng thanh toán đang triển khai.

## Build và deploy

### Production trên local

```bash
npm run build
npm run start
```

Cả `dev` và `build` hiện dùng Webpack theo scripts trong `package.json`.

### Vercel

Theo [cấu hình build của Vercel](https://vercel.com/docs/builds/configure-a-build), chọn thư mục chứa `package.json` làm Root Directory:

| Thiết lập        | Giá trị                                                                                  |
| ---------------- | ---------------------------------------------------------------------------------------- |
| Framework Preset | Next.js                                                                                  |
| Root Directory   | `cv-builder` nếu repository chứa thư mục này; `.` nếu ứng dụng đã là root của repository |
| Node.js Version  | 24.x                                                                                     |
| Install Command  | `npm ci`                                                                                 |
| Build Command    | `npm run build`                                                                          |
| Output Directory | Giữ mặc định của Next.js                                                                 |

1. Thêm các biến môi trường cho deployment, bao gồm `STRIPE_SECRET_KEY` và `RESEND_API_KEY` để build tải được các module liên quan.
2. Đổi `AUTH_URL` và `NEXT_PUBLIC_APP_URL` thành URL HTTPS của website, không thêm `/api/auth`.
3. Áp dụng migration vào database đích bằng `npx prisma migrate deploy` trong môi trường đã cấu hình đúng kết nối. Khởi tạo dữ liệu gói bằng seed sau khi kiểm tra script. Build mặc định không tự chạy hai bước này.
4. Cập nhật Google OAuth redirect URI và đăng ký webhook Stripe tại `https://your-domain.example/api/webhook/stripe`. Dùng signing secret của endpoint production thay cho secret từ CLI.
5. Deploy và kiểm tra đăng nhập, tạo/lưu CV, xuất PDF, AI và thanh toán nếu đã cấu hình các dịch vụ tương ứng.

Be Vietnam Pro, Inter, JetBrains Mono và Mulish được nạp bằng `next/font/local`. Commit đầy đủ `app/fonts/` cùng các giấy phép đi kèm; build không cần tải font từ Google Fonts.

## Lệnh thường dùng

| Lệnh                        | Mục đích                                       |
| --------------------------- | ---------------------------------------------- |
| `npm run dev`               | Chạy development server bằng Webpack.          |
| `npm run build`             | Tạo production build và kiểm tra TypeScript.   |
| `npm run start`             | Chạy ứng dụng đã build.                        |
| `npm run lint`              | Kiểm tra ESLint.                               |
| `npm run format`            | Format mã nguồn và cấu hình bằng Prettier.     |
| `npm run format:check`      | Kiểm tra định dạng mã nguồn và cấu hình.       |
| `npx tsc --noEmit`          | Kiểm tra kiểu dữ liệu mà không build ứng dụng. |
| `npx prisma generate`       | Tạo lại Prisma Client.                         |
| `npx prisma migrate deploy` | Áp dụng migration có sẵn vào database đích.    |
| `npx prisma db seed`        | Chạy script dữ liệu gói dịch vụ.               |
| `npx prisma studio`         | Mở giao diện xem và chỉnh sửa database.        |

## Cấu trúc dự án

```text
cv-builder/
├── app/
│   ├── admin/          # Quản trị người dùng, gói, thanh toán, credits
│   ├── api/            # API xác thực, CV, AI, thanh toán, webhooks
│   ├── auth/           # Đăng nhập, đăng ký, đặt lại mật khẩu
│   ├── billing/        # Quản lý gói đăng ký
│   ├── dashboard/      # Dashboard cá nhân và danh sách CV
│   ├── editor/         # Trang chỉnh sửa CV
│   ├── fonts/          # Font giao diện local và giấy phép
│   ├── payment/        # Trang thanh toán và kết quả
│   ├── pricing/        # Bảng giá
│   └── profile/        # Hồ sơ người dùng
├── components/         # Thành phần giao diện và trình chỉnh sửa
├── lib/
│   ├── actions/        # Server Actions
│   ├── blocks/         # Block mặc định và mẫu CV
│   ├── hooks/          # React hooks
│   ├── pdf/            # Đăng ký template cho luồng react-pdf
│   ├── schemas/        # Zod schemas
│   ├── services/       # Subscription, credits, quyền sử dụng, audit, webhook
│   └── stores/         # Zustand store của trình chỉnh sửa
├── prisma/
│   ├── migrations/     # Lịch sử thay đổi database
│   ├── schema.prisma   # Định nghĩa dữ liệu
│   └── seed.ts         # Khởi tạo gói và dữ liệu liên quan
├── public/             # Tài nguyên tĩnh, font phục vụ PDF
├── auth.ts             # Cấu hình NextAuth
├── proxy.ts            # Xử lý truy cập theo route
├── prisma.config.ts    # Cấu hình Prisma CLI và lệnh seed
└── next.config.ts      # Cấu hình Next.js, alias tương thích PDF
```

## Xử lý lỗi thường gặp

| Hiện tượng                              | Kiểm tra                                                                                                |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Build báo thiếu Stripe/Resend API key   | Khai báo `STRIPE_SECRET_KEY`, `RESEND_API_KEY` ở môi trường build rồi deploy lại.                       |
| Build báo lỗi font                      | Kiểm tra đã commit đủ `app/fonts/` và đường dẫn trong `app/layout.tsx` đúng chữ hoa/thường.             |
| Không kết nối được database             | Kiểm tra URL, mật khẩu đã mã hóa URL, SSL và khả năng truy cập host; Prisma CLI ưu tiên `DIRECT_URL`.   |
| Không có gói dịch vụ hoặc template      | Kiểm tra migration và dữ liệu tạo bởi `prisma/seed.ts`.                                                 |
| AI báo không đủ credits                 | Kiểm tra ví người dùng, quyền của gói và mức phí 10 credits/yêu cầu.                                    |
| Checkout báo chưa cấu hình Price ID     | Kiểm tra Price IDs trong bảng `Plan`, đúng môi trường Stripe test/live.                                 |
| Thanh toán xong nhưng gói chưa cập nhật | Kiểm tra log và lịch sử gửi sự kiện của webhook chính, signing secret và metadata của Checkout Session. |
| URL quay về sau thanh toán bị sai       | Kiểm tra `AUTH_URL`, `NEXT_PUBLIC_APP_URL` đều là URL gốc của website.                                  |
