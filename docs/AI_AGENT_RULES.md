# AI AGENT RULES

Tài liệu này là bộ quy tắc **BẮT BUỘC** dành cho tất cả AI Coding Agents làm việc trên repository này.

**MỤC TIÊU:**
- Hiểu architecture trước khi code.
- Không tự ý phá vỡ architecture hiện tại.
- Không tạo code trùng lặp.
- Không tạo abstraction không cần thiết.
- Không thay đổi database một cách nguy hiểm.
- Không bypass authentication/authorization.
- Không làm thay đổi behavior hiện tại ngoài phạm vi yêu cầu.
- Luôn kiểm tra impact trước khi sửa code.
- Luôn validate kết quả sau khi sửa.
- Giữ codebase maintainable và consistent.
- Ưu tiên sử dụng architecture và patterns đã tồn tại.
- Không over-engineering.

---

## 1. SOURCE OF TRUTH

AI Agent phải coi các nguồn sau là source of truth theo thứ tự:
1. Existing source code
2. Database schema
3. Tests
4. `/docs/ARCHITECTURE.md`
5. Existing project configuration
6. User requirements

Nếu documentation mâu thuẫn với source code:
- Source code là implementation hiện tại.
- AI Agent phải xác định sự khác biệt.
- Không được giả định documentation đúng.
- Nếu thay đổi architecture, phải cập nhật documentation.

AI Agent không được tự tạo implementation dựa trên assumption khi source code đã có pattern tương tự.

## 2. READ BEFORE MODIFY

TRƯỚC KHI sửa bất kỳ file nào:
1. Đọc `/docs/ARCHITECTURE.md` nếu file tồn tại.
2. Xác định module liên quan.
3. Đọc các file liên quan.
4. Đọc types/interfaces.
5. Đọc schema/validation.
6. Đọc state management.
7. Đọc server logic nếu có.
8. Đọc database schema nếu feature liên quan database.
9. Tìm các nơi đang sử dụng code cần thay đổi.
10. Xác định impact.

**KHÔNG** được sửa code ngay sau khi chỉ nhìn thấy một file.

## 3. UNDERSTAND THE EXISTING PATTERN FIRST

Trước khi tạo component, hook, store, service, utility, server action, API, schema, database model... hãy tìm implementation tương tự trong repository.

Nếu đã có pattern tương tự:
- Reuse pattern.
- Follow existing naming.
- Follow existing folder structure.
- Follow existing error handling.
- Follow existing validation.
- Follow existing state management.

Không tạo pattern mới nếu pattern hiện tại đã đáp ứng yêu cầu.

## 4. MINIMAL CHANGE PRINCIPLE

Khi implement một requirement: Chỉ thay đổi những gì cần thiết.

Không tự ý:
- refactor unrelated code
- rename unrelated files
- format toàn bộ project
- thay đổi architecture
- thay đổi dependency
- thay đổi database
- thay đổi UI không liên quan
- thay đổi API contract không cần thiết

**Nguyên tắc:** "Smallest safe change that correctly solves the problem."

## 5. DO NOT OVER-ENGINEER

Không tạo abstraction chỉ vì "clean architecture".

Không tạo service layer, repository layer, factory, adapter, provider, event bus, dependency injection, microservice... nếu project hiện tại không cần. Architecture phải phù hợp với complexity thực tế.

**Ưu tiên:** Simple → Clear → Maintainable → Extensible
**Thay vì:** Complex → Abstract → Over-engineered

## 6. NO DUPLICATE LOGIC

Trước khi tạo function/component/hook/utility mới:
Search repository để xem logic tương tự đã tồn tại chưa.

Nếu tồn tại:
- Reuse
- Extend
- Refactor carefully nếu thực sự cần

Không tạo hai implementation cho cùng một responsibility.

## 7. TYPESCRIPT RULES

Nếu project sử dụng TypeScript:
- Không sử dụng `any` nếu không cần thiết.
- Ưu tiên type chính xác.
- Không sử dụng type assertion để che lỗi.
- Không dùng `as any` để bypass TypeScript.
- Không disable TypeScript errors chỉ để code compile.
- Reuse existing types.
- Không tạo duplicate interfaces.
- Đặt types ở location phù hợp với architecture hiện tại.

**Không được giải quyết lỗi TypeScript bằng cách che lỗi:**
- `as any`
- `// @ts-ignore`
- `// @ts-nocheck`
*(trừ khi có lý do kỹ thuật rõ ràng và được yêu cầu).*

## 8. REACT RULES

- Không tạo unnecessary re-render.
- Không sử dụng `useEffect` nếu derived state có thể xử lý trực tiếp.
- Không tạo state cho dữ liệu có thể derive.
- Không đặt business logic phức tạp trong JSX.
- Tách component khi thực sự cần.
- Không tạo component abstraction chỉ vì component dài.
- Respect Server Component / Client Component boundary.
- Không thêm `"use client"` nếu không cần.
- Không chuyển toàn bộ tree thành Client Component.

## 9. NEXT.JS RULES

- Respect App Router architecture.
- Server Components là default.
- Chỉ dùng Client Components khi cần browser state/event/effect.
- Không đưa database access vào Client Component.
- Không expose server-only secrets.
- Không đưa private environment variables vào client.
- Server Actions phải validate input.
- API routes phải validate input.
- Authentication và authorization phải được thực hiện phía server.
- Không bypass existing middleware.
- Follow existing Next.js conventions.

## 10. STATE MANAGEMENT RULES

- Không tạo global state nếu local state đủ.
- Không duplicate cùng một state ở nhiều store.
- Không mutate state trực tiếp nếu architecture yêu cầu immutable updates.
- Follow existing store pattern.
- Không bypass store bằng cách tạo một state system khác.
- Actions phải có responsibility rõ ràng.
- Không đưa server-only logic vào client store.
- Không lưu sensitive information vào client state.

**Đối với CV Builder:**
Document state phải được coi là domain state quan trọng. Không được thay đổi document structure mà không kiểm tra:
- Block types, Schemas, Templates, Renderer, Editor, Persistence, Database, Export.

## 11. DATABASE RULES

Database là phần **CRITICAL**. TRƯỚC KHI thay đổi database:
1. Đọc `prisma/schema.prisma`.
2. Kiểm tra tất cả relations.
3. Search toàn repository các model đang được sử dụng.
4. Kiểm tra migration strategy.
5. Kiểm tra backward compatibility.
6. Kiểm tra existing data.

Không tự ý: rename database field, delete column, change relation, change primary key, change enum, change JSON structure nếu chưa đánh giá impact.

Nếu thay đổi database, phải document: Why, What changes, Impact, Migration requirement, Backward compatibility.

## 12. PRISMA RULES

- Không bypass Prisma bằng raw SQL nếu không cần.
- Reuse existing Prisma client.
- Không tạo nhiều PrismaClient instance.
- Không expose Prisma Client ra client.
- Không query database trong React Client Component.
- Validate user input trước database operation.
- Kiểm tra authorization trước mutation.
- Tránh N+1 queries.
- Không select toàn bộ fields nếu chỉ cần một phần dữ liệu.
- Respect existing transaction strategy.

## 13. AUTHENTICATION RULES

Authentication phải được xử lý server-side.
AI Agent không được:
- bypass authentication
- trust userId từ client
- trust role từ client
- trust ownership từ client
- expose session secrets, password, API keys

Không được coi `userId` từ request body là bằng chứng người dùng sở hữu resource. Phải lấy identity từ authenticated session/context.

## 14. AUTHORIZATION RULES

Authentication != Authorization. Mọi resource user-owned phải kiểm tra ownership.

Flow chuẩn: `User -> Authenticated -> Get current userId -> Find resource -> Verify ownership -> Perform mutation`

Đặc biệt với: CV, Template, User data, Saved documents, Private resources.
Không được chỉ kiểm tra `if (userId)` mà phải kiểm tra resource ownership thực tế trong DB.

## 15. VALIDATION RULES

Tất cả input từ user phải được coi là untrusted. Validate tại server boundary.
Nếu project sử dụng Zod:
- Reuse existing schemas.
- Không duplicate schema nếu có thể reuse.
- Client validation không thay thế server validation.
- Không trust client-side validation.

Flow ưu tiên: `Client -> Server -> Validation -> Authorization -> Database`

## 16. SECURITY RULES

AI Agent phải ưu tiên security.
Không:
- expose secrets, log passwords, log tokens, expose API keys
- bypass authorization, trust client ownership
- render unsafe HTML mà không kiểm soát
- disable security checks để fix bug

Nếu phát hiện security issue:
1. Không che giấu.
2. Xác định scope.
3. Fix nếu nằm trong task.
4. Nếu ngoài scope, report rõ trong final response.

## 17. ENVIRONMENT VARIABLES

Không hardcode: passwords, API keys, database URLs, tokens, secrets.
Không commit `.env` secrets.
Không đưa server-only environment variables vào client.
Trước khi thêm environment variable: Search existing variables, Kiểm tra naming convention, Kiểm tra server/client usage.

## 18. API RULES

Trước khi tạo API:
1. Kiểm tra API hiện tại.
2. Kiểm tra Server Actions.
3. Kiểm tra xem API mới có thực sự cần thiết không.

Không tạo API chỉ vì "backend nên có API". Nếu project đang sử dụng Server Actions cho use case tương ứng, ưu tiên follow existing pattern.
Mọi API phải: Validate input, Authenticate, Authorize, Handle errors, Return predictable responses.

## 19. SERVER ACTION RULES

Server Actions phải:
- Validate input.
- Authenticate user.
- Authorize resource.
- Handle errors.
- Avoid exposing sensitive information.
- Keep business logic understandable.

Không trust data từ client. Không trả về database objects chứa sensitive fields nếu không cần.

## 20. ERROR HANDLING

Không dùng `try/catch` chỉ để log rồi ignore error. Không swallow errors. Không trả về generic success nếu operation thất bại.
Errors phải: predictable, meaningful, safe, không expose internal secrets.
Client không nên nhận: database connection string, stack trace production, secret, internal credentials.

## 21. LOGGING

Không log: password, access token, refresh token, API key, session secret, sensitive personal data.
Logs phải hữu ích cho debugging. Không spam console trong production code.

## 22. FILE STRUCTURE

Follow existing project structure. Không tạo folder mới nếu folder hiện tại đã có responsibility tương ứng. Trước khi tạo file: Search existing directories. Naming phải nhất quán với project.

## 23. COMPONENT DESIGN

Component nên có một responsibility rõ ràng.
Không tạo huge component chứa (UI + business logic + database logic + validation + state management + API calls) trong cùng một file nếu architecture hiện tại đã có separation.
Nhưng cũng không over-split thành hàng chục component nhỏ vô nghĩa.

## 24. UI / UX RULES

Khi sửa UI:
- Không phá responsive behavior.
- Không thay đổi business logic nếu task chỉ yêu cầu UI.
- Reuse existing design system, components, spacing/token/color system.
- Không thêm random colors, không tạo duplicate UI components.
- Preserve accessibility, keyboard interaction, loading/error states, mobile layout.
- Nếu có design system hiện tại: Follow it.

## 25. ACCESSIBILITY

UI phải đảm bảo: semantic HTML, keyboard accessibility, focus states, aria-label khi cần.
Buttons phải là button, links phải là link.
Không dùng `div` làm interactive element nếu không cần.

## 26. PERFORMANCE RULES

Không optimize prematurely. Nhưng tránh:
- unnecessary re-render, API calls, database queries, N+1 queries.
- repeated expensive calculations, huge client bundles, unnecessary client components.

Đối với CV Editor, đặc biệt chú ý: document size, block count, Zustand subscriptions, autosave, editor re-render, PDF rendering.

## 27. DEPENDENCY RULES

Trước khi cài dependency mới:
1. Search package.json.
2. Kiểm tra project đã có package tương tự chưa.
3. Kiểm tra native implementation có đủ không.
4. Đánh giá bundle size, maintenance, security.
5. Chỉ thêm dependency nếu thực sự cần.

Không thêm dependency chỉ để giải quyết vấn đề nhỏ có thể xử lý bằng code hiện tại.

## 28. NO UNRELATED REFACTOR

Nếu task là: "Fix button"
Không được tự ý: refactor store, refactor database, rename components, thay đổi architecture.
Nếu phát hiện code smell unrelated: Report it. Không tự tiện sửa.

## 29. BACKWARD COMPATIBILITY

Đối với CV Builder: Existing CV data phải được ưu tiên bảo toàn.
Trước khi thay đổi: Block schema, Document schema, Template schema, JSON structure, hãy kiểm tra documents cũ.
Không làm existing documents không thể render nếu không có migration strategy.

## 30. DATA MIGRATION

Nếu thay đổi data structure, phải xem xét: `Old format -> Migration -> New format`.
Không chỉ sửa TypeScript type và giả định database đã thay đổi.
Nếu migration cần thiết: Document migration requirement.

## 31. TESTING

Sau khi thay đổi code, chạy các validation phù hợp: TypeScript, Lint, Unit tests, Integration tests, Build.
Nếu project có test suite: Không bỏ qua test liên quan.
Nếu không có test: Ít nhất kiểm tra type errors, lint errors, build errors.
Không tự ý xóa hoặc disable test để làm pipeline pass.

## 32. BUILD VALIDATION

Sau khi hoàn thành implementation, phải kiểm tra project có build được không.
Nếu build fail: Xác định root cause, fix nếu liên quan đến task. Không che lỗi bằng disable checks.
Không kết thúc task khi biết project đang broken nếu lỗi do thay đổi của mình.

## 33. REGRESSION CHECK

Sau khi sửa code, kiểm tra các functionality liên quan.
- Ví dụ sửa Block: Check Create, Render, Edit, Delete, Save, Load, Undo, Redo, Export.
- Nếu sửa Authentication: Check Login, Session, Logout, Protected routes, Resource ownership.
- Nếu sửa Database: Check tất cả consumers của model.

## 34. ARCHITECTURE CONSISTENCY

Mọi thay đổi phải giữ consistency với: folder structure, naming, state management, validation, error handling, database access, authentication, authorization, UI architecture.
Nếu requirement bắt buộc phá architecture hiện tại, phải: Explain why, Identify affected modules, Propose migration approach, Implement only if user requested, Update `/docs/ARCHITECTURE.md`.

## 35. DOCUMENTATION RULES

Nếu thay đổi architecture đáng kể (New architectural layer, New database model, Major state change, New authentication mechanism, v.v.), update `/docs/ARCHITECTURE.md`.
Không cần update architecture document cho: typo fix, minor CSS, small UI change, trivial bug fix.

## 36. ARCHITECTURE BEFORE IMPLEMENTATION

Đối với feature lớn, không code ngay. Trước tiên xác định: Requirement, Existing architecture, Affected modules, Data flow, State changes, Database changes, API/server changes, Security implications, Testing strategy, Migration requirement. Sau đó mới implement.

## 37. ASK BEFORE DANGEROUS CHANGES

Nếu task có khả năng gây mất dữ liệu hoặc phá architecture nghiêm trọng (delete database field, destructive migration, delete existing data, change document schema incompatibly, v.v.), KHÔNG tự ý thực hiện. Nếu user chưa yêu cầu rõ: Explain risk and ask for confirmation.

## 38. NO ASSUMPTIONS

Không assume: API tồn tại, database field tồn tại, user có quyền, component tồn tại, environment variable tồn tại, function có behavior cụ thể.
Nếu cần thông tin: Inspect repository. Nếu vẫn không xác định: State uncertainty explicitly.

## 39. SEARCH BEFORE CREATE

Trước khi tạo bất kỳ function, component, hook, utility, type, schema, store, server action... hãy search repository. Mục tiêu: Avoid duplication.

## 40. PRESERVE EXISTING BEHAVIOR

Nếu user yêu cầu một thay đổi cụ thể, chỉ thay đổi behavior được yêu cầu. Không được vô tình thay đổi existing API, UI behavior, shortcuts, data format, authentication, permissions, export behavior trừ khi requirement yêu cầu.

## 41. FINAL RESPONSE RULES

Sau khi hoàn thành task, final response phải ngắn gọn và rõ ràng theo format:
- **Summary**: What was changed, Why it was changed
- **Files Changed**: List of files
- **Validation**: TypeScript/Lint/Tests/Build pass or fail
- **Architecture Impact**: None or Explain architectural changes
- **Risks**: None or List risks
- **Notes**: Những điều developer cần biết.

Không nói "Everything is perfect." Nếu có lỗi chưa giải quyết, phải nói rõ.

## 42. GOLDEN RULE

Luôn tuân thủ nguyên tắc:
`READ -> UNDERSTAND -> SEARCH -> PLAN -> IMPLEMENT -> VALIDATE -> REVIEW -> DOCUMENT`

Không: `GUESS -> CODE -> BREAK -> PATCH`

## 43. PRIORITY ORDER

Khi các yêu cầu conflict, ưu tiên:
1. Security
2. Data integrity
3. User requirement
4. Existing architecture
5. Correctness
6. Maintainability
7. Performance
8. Code elegance

Không hy sinh security hoặc data integrity để có implementation nhanh hơn.

## 44. AI AGENT BEHAVIOR

AI Agent phải behave như một senior engineer.
- **Không**: rush implementation, guess, over-engineer, duplicate code, ignore existing patterns, ignore errors, hide problems, modify unrelated files, silently change architecture.
- **Phải**: inspect, reason, reuse, implement minimally, validate, report clearly.

## 45. PROJECT-SPECIFIC RULE

Đây là CV Builder. Đặc biệt cẩn thận với:
- CV Document, Block, Column, Template, Editor State, Zustand Store, Autosave, Undo / Redo, Prisma, PostgreSQL, PDF Export, Authentication, User ownership.
Bất kỳ thay đổi nào liên quan đến CV Document phải kiểm tra toàn bộ chain. Không được sửa một layer mà không kiểm tra các layer phụ thuộc.

---

## FINAL INSTRUCTION

Hãy coi file `/docs/AI_AGENT_RULES.md` này là một contract bắt buộc.

- Nếu một task không yêu cầu thay đổi architecture: **DO NOT change architecture**.
- Nếu có thể giải quyết bằng existing pattern: **USE existing pattern**.
- Nếu có thể giải quyết bằng một thay đổi nhỏ: **DO NOT perform a large refactor**.
- Nếu không chắc: **INSPECT THE CODE**.
- Nếu vẫn không chắc: **REPORT THE UNCERTAINTY**.
- Nếu thay đổi có risk: **EXPLAIN THE RISK**.
- Nếu làm hỏng behavior: **FIX IT BEFORE FINISHING**.
- Nếu architecture thay đổi: **UPDATE THE ARCHITECTURE DOCUMENT**.

**PRIMARY PRINCIPLE:**
*"Understand the system before changing the system."*
