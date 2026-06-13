# JiraMini — Tài liệu kiến trúc

Hệ thống Mini Jira: bảng Kanban quản lý task với xác thực người dùng. Dự án là **monorepo** gồm 3 package độc lập, dùng chung schema validation qua một package shared.

## Tổng quan monorepo

```text
.
├── fe/        # Frontend  — React 19 + Vite + TypeScript
├── be/        # Backend   — Express 5 + Prisma + PostgreSQL
└── shared/    # @jiramini/shared — Zod schema dùng chung FE ↔ BE
```

| Package | Vai trò | Tech chính |
|---------|---------|-----------|
| `fe` | SPA bảng Kanban, auth, kéo–thả task | React 19, Vite, Zustand, Axios, React Hook Form, dnd-kit, CSS Modules |
| `be` | REST API (`/v1/api`), JWT auth, Swagger | Express 5, Prisma, PostgreSQL, Zod, Pino |
| `shared` | Single source of truth cho Zod schema + type của Auth/Task | Zod |

## Package `shared` (`@jiramini/shared`)

Định nghĩa Zod schema và type cho Auth và Task **một lần**, build ra `dist/` và được cả FE lẫn BE import:

```text
shared/src/
├── auth.schema.ts   # đăng nhập / đăng ký / AuthResponse
├── task.schema.ts   # task priority/status, create/update/list schema + response
└── index.ts         # re-export
```

- BE import để **validate request** và parse response (`be/src/module/*/*.schema.ts`).
- FE import **cùng type/schema** đó (`@jiramini/shared/auth`, `@jiramini/shared/task`) → không lệch contract giữa hai bên.
- Build trước khi build FE/BE: `npm run build:shared` (đã nằm trong `build:all`).

## Tài liệu

| Tài liệu | Nội dung |
|----------|----------|
| [FRONTEND.md](FRONTEND.md) | Kiến trúc & quy ước Frontend |
| [BACKEND.md](BACKEND.md) | Kiến trúc & quy ước Backend |
| [DATABASE.md](DATABASE.md) | Schema database, Prisma, migrations |

## Luồng dữ liệu tổng thể

```text
FE (React) ──HTTP /v1/api──> BE (Express) ──Prisma──> PostgreSQL
   │                              │
   └────── @jiramini/shared (Zod schema + types) ──────┘
```
