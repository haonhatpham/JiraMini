# BACKEND — Mini Jira System

Kiến trúc và quy ước của package `be`. Mô tả này phản ánh **đúng code hiện tại**.

## 1. Tech Stack

- **Language:** TypeScript (strict)
- **Framework:** Express 5
- **Database:** PostgreSQL qua **Prisma ORM**
- **Validation:** Zod (schema dùng chung từ `@jiramini/shared`)
- **Auth:** JWT (access token, ngắn hạn)
- **Logging:** Pino
- **API docs:** Swagger UI tại `/swagger`
- **Security (production):** Helmet, HPP, CORS theo allowlist, compression

---

## 2. Folder Structure (thực tế)

```text
be/src/
├── server.ts                 # Entry: tạo các Route, khởi động App
├── app.ts                    # class App — middleware, routes, swagger, error handler, DB connect
├── env.ts                    # Cấu hình env validate bằng Zod + Object.freeze (fail-fast)
├── swagger.ts                # Tài liệu OpenAPI (zod-openapi)
├── type.d.ts                 # Mở rộng Express.Request (req.user, req.validated)
│
├── core/                     # Hạ tầng dùng chung (không phải "shared/")
│   ├── database/             # prisma.ts (PrismaClient singleton) + connect/disconnect
│   ├── exceptions/           # HttpException + các exception cụ thể + middleware xử lý lỗi
│   ├── http/                 # http-status.ts (HttpStatus), api-response.types.ts
│   ├── interfaces/           # Route interface (path + router)
│   ├── logger/               # Pino logger + logging.middleware
│   └── middleware/           # auth.middleware, validation.middleware
│
└── module/                   # Các feature (KHÔNG đặt tên "features/")
    ├── auth/                 # auth.route, auth.controller, auth.service, auth.schema
    ├── users/                # user.route, user.controller, user.service
    └── tasks/                # task.route, task.controller, task.service, task.schema, task.mapper
```

> Khác với template lý tưởng: thư mục là `module/` (không phải `features/`), hạ tầng nằm trong `core/` (không phải `shared/`), và **không có repository layer** — Prisma gọi trực tiếp trong service.

---

## 3. Phân lớp & trách nhiệm

| Lớp | File | Trách nhiệm | Không làm |
|-----|------|-------------|-----------|
| Route | `*.route.ts` | `class implements Route`, mount path (`${env.APP_PREFIX}/...`), gắn middleware (auth + validate) | Chứa business logic |
| Controller | `*.controller.ts` | Đọc `req` (đã validate), gọi service, set status + `res.json({ data })`, `next(error)` | Gọi Prisma trực tiếp |
| Service | `*.service.ts` | `class` chứa business logic + Prisma queries, ném `HttpException` khi lỗi | Đụng `req`/`res` |
| Mapper | `task.mapper.ts` | Map entity Prisma → response DTO (vd `in_progress` → `in-progress`) | |
| Schema | `*.schema.ts` | Zod schema (request/response) + type suy ra; tái xuất từ `@jiramini/shared` | |

Ví dụ route:
```ts
this.router.post(this.path, authMiddleware, validateRequest(createTaskSchema), this.taskController.createTask);
```

---

## 4. Request Flow

```text
Request
  → App (helmet/cors/compression/json) + logging.middleware
  → Route (mount path)
  → authMiddleware            (verify JWT → gắn req.user; ném Unauthorized/Expired/InvalidToken)
  → validateRequest(schema)   (Zod parse body/params/query → ném ValidationException; gắn req.validated.query)
  → Controller                (gọi service → res.status().json({ data }))
  → Service                   (Prisma + business rules → ném HttpException khi lỗi)
  → Response

Lỗi: throw HttpException → controller next(error)
     → malformedErrorHandler (JSON hỏng) → globalExceptionHandler (format ErrorResponse)
```

---

## 5. Xử lý lỗi — Exception classes

Không dùng `res.error()`/`asyncHandler`. Thay vào đó là cây `HttpException` (`core/exceptions/`):

```ts
throw new NotFoundException('Task not found', 'TASK_NOT_FOUND');
throw new BadRequestException('Assignee does not exist', 'ASSIGNEE_NOT_FOUND');
// ValidationException(message, details[]) — do validateRequest ném ra
```

`globalExceptionHandler` (đăng ký cuối cùng trong `app.ts`) format về:
```jsonc
{ "error": { "code": "TASK_NOT_FOUND", "message": "Task not found", "details": [...] } }
```
- Ở production, exception có `expose = false` chỉ trả message generic (giấu chi tiết nội bộ).
- `handlePrismaError` trong service map lỗi Prisma (`P2025` → NotFound, `P2003` → BadRequest).

**Response format thành công:** controller trả `{ data: ... }`; list trả `{ data: [...], pagination: {...} }` (xem `core/http/api-response.types.ts`).

---

## 6. Cấu hình (`src/env.ts`)

Single source of truth, validate bằng Zod, **fail-fast** (sai env → `process.exit(1)`), kết quả `Object.freeze`:

- `NODE_ENV`, `PORT` (mặc định 3001), `APP_PREFIX` (mặc định `/v1/api`)
- `DATABASE_URL` (validate protocol), pool config
- `JWT_SECRET` (≥32 ký tự), `JWT_ISSUER`, `JWT_AUDIENCE`, `JWT_EXPIRES_IN`
- `CORS_ALLOWED_ORIGINS` (CSV → mảng), `CORS_CREDENTIALS`
- `BCRYPT_SALT_ROUNDS`, rate-limit window/max

`be/.env.example` là mẫu — copy sang `be/.env` (không commit) hoặc set env trên host.

---

## 7. Bootstrap (`app.ts` + `server.ts`)

```ts
// server.ts
const routes = [new AuthRoute(), new TaskRoute(), new UserRoute()];
new App(routes).listen();
```
`class App` lần lượt: middleware → routes → Swagger (`/swagger`) → error handlers → kết nối DB. Ở production bật thêm `hpp()`, `helmet()`, `compression()` và CORS theo `CORS_ALLOWED_ORIGINS`; dev cho phép mọi origin.

---

## 8. Quy ước

- Mỗi module self-contained; **không** import chéo nội bộ giữa các module (vd `tasks` không import file nội bộ của `auth`).
- Business logic + Prisma nằm trong service; controller mỏng.
- Schema/type lấy từ `@jiramini/shared` để khớp contract với FE.
- Không hardcode config — dùng `env`.
- Không `any` (strict mode).

## 9. Testing
Hiện **chưa có** test tự động trong `be/`. Kế hoạch: test ở lớp service (nhánh business logic, vd `updateStatus` reorder/move) với DB test.
