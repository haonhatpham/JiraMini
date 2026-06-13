# FRONTEND — Mini Jira System

Kiến trúc và quy ước của package `fe`. Mô tả này phản ánh **đúng code hiện tại**.

## 1. Tech Stack

- **Framework:** React 19 + Vite
- **Language:** TypeScript (strict)
- **State:** Zustand (auth state) + state cục bộ trong component/hook
- **Data fetching:** Axios (`ApiClient`) + custom hook `useFetch` (không dùng TanStack Query)
- **Styling:** CSS Modules (`*.module.css`)
- **Forms:** React Hook Form + Zod (`@hookform/resolvers`)
- **Drag & Drop:** `@dnd-kit/react`
- **Routing:** React Router v7 (`BrowserRouter` + `Routes`)
- **Validation contract:** `@jiramini/shared` (Zod schema/type dùng chung với BE)

---

## 2. Folder Structure (thực tế)

```text
fe/src/
├── main.tsx                 # Entry point
├── App.tsx                  # BrowserRouter + Routes + ErrorBoundary + Toaster
│
├── api/
│   ├── api.ts               # ApiClient (class bọc Axios) + chuẩn hoá lỗi (ApiError)
│   ├── useFetch.ts          # Hook fetch dữ liệu: loading/error/data + abort + refetch
│   └── constant.ts
│
├── components/              # UI dùng chung (presentational)
│   ├── Button/ IconButton/ TextInput/ TextArea/
│   ├── Container/ FullScreenLoader/ ConfirmDialog/
│   ├── ErrorBoundary/       # ErrorBoundary + ErrorFallback
│   └── Toaster/
│
├── hook/                    # Hook dùng chung
│   ├── useDebouncedValue.ts
│   ├── useKeyboardShortcut.ts
│   └── useFocusTrap.ts
│
├── layout/                  # AppLayout, sidebar, header, footer, 404
├── constants/               # route.ts, error.ts (ErrorCode)
├── utils/                   # notify.ts
├── mocks/                   # data mock (task.data.ts)
│
└── features/
    ├── auth/                # auth.service, auth.store (Zustand), ProtectedRoute, pages/{Login,Register}
    ├── board/               # Trang Kanban: pages/BoardPage, components/*, utils/*, filters/, types, constants
    ├── tasks/               # task.service, types, schemas/, components/{TaskCard,TaskForm,TaskModal,TaskDetailModal}
    ├── users/               # user.service
    └── home/                # HomePage
```

> Lưu ý: cấu trúc dùng `components/` + `api/` + `hook/` (số ít) + `layout/` ở cấp `src`, **không** có thư mục `app/` hay `shared/` riêng.

---

## 3. Data Fetching — không dùng TanStack Query

Toàn bộ server state đi qua hai lớp:

### `api/api.ts` — `ApiClient` (Axios)
- `baseURL` từ `VITE_API_BASE_URL` (mặc định `http://localhost:3001/v1/api`).
- **Request interceptor:** tự gắn `Authorization: Bearer <token>` từ localStorage.
- **Response interceptor:** chuẩn hoá lỗi về kiểu `ApiError { status, code, message, details }`; tự xoá token khi 401 do `TOKEN_EXPIRED`/`INVALID_TOKEN`.
- Export singleton `api` với `get/post/put/patch/delete<T>()` trả thẳng `response.data`.

### `api/useFetch.ts` — hook fetch
```ts
const { data, loading, error, refetch, abort } = useFetch(
  ['board-tasks', filters.search],          // queryKey → tự refetch khi đổi
  (signal) => taskService.list(params, signal),
  { onSuccess, onError, onStart }
)
```
- Tự huỷ request cũ qua `AbortController` khi key đổi/unmount.
- Service luôn nhận `signal` để truyền vào Axios.

**Quy ước:** gọi API **chỉ** trong `*.service.ts` của feature (`task.service.ts`, `auth.service.ts`, `user.service.ts`); component/hook gọi service, không gọi `api` trực tiếp.

---

## 4. State Management

| Loại state | Nơi lưu | Ví dụ |
|------------|---------|-------|
| Auth (token, user) | Zustand `features/auth/auth.store.ts` | `accessToken`, `user`, `isAuthenticated` |
| Server data | `useFetch` (cục bộ trong page/hook) | danh sách task của board |
| Filter chia sẻ được qua URL | `useSearchParams` | `?search=&priority=&assigneeId=` |
| UI cục bộ | `useState`/`useRef` trong component | modal mở, form dirty |

`auth.store` đồng bộ token với `ApiClient` (localStorage) và giải mã JWT để suy ra user khi reload.

---

## 5. Routing

Routing khai báo inline trong [App.tsx](../fe/src/App.tsx) (không dùng `createBrowserRouter`):

```tsx
<BrowserRouter>
  <Routes>
    <Route path="/login"    element={isAuthenticated ? <Navigate to="/"/> : <LoginPage .../>} />
    <Route path="/register" element={isAuthenticated ? <Navigate to="/"/> : <RegisterPage .../>} />
    <Route path="/" element={<ProtectedRoute />}>   {/* chặn nếu chưa đăng nhập */}
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
      </Route>
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
</BrowserRouter>
```

`ProtectedRoute` (`features/auth/ProtectedRoute.tsx`) đọc `useAuthStore` và redirect `/login` khi chưa xác thực.

---

## 6. Feature: `board` (Kanban + kéo–thả)

Feature phức tạp nhất, tách logic ra `utils/` để page mỏng:

```text
features/board/
├── pages/BoardPage.tsx              # Orchestrator: filter, load, modal, keyboard shortcut
├── components/                      # BoardHeader, BoardFiltersBar, BoardColumnsSection,
│                                    # BoardColumn, BoardTaskColumns, BoardTaskModals, ...
├── filters/taskFilters.ts           # parse/serialize filter <-> URL searchParams
└── utils/
    ├── boardDataRequests.ts         # gọi API tải dữ liệu board
    ├── boardTasks.ts                # normalizeTaskPositions, createAssigneeOptions
    ├── boardColumnState.ts          # đếm số task theo cột
    ├── boardTaskMovement.ts         # tính vị trí khi kéo–thả
    ├── boardDragPersistence.ts      # cập nhật optimistic + gọi API updateStatus
    └── boardError.ts, boardDropTarget.ts, ...
```

**Optimistic update khi kéo–thả:** cập nhật state ngay (`setBoardTasks` + `normalizeTaskPositions`), gọi API ngầm; lỗi → khôi phục state cũ và `notify.error`. Logic nằm ở `utils/boardDragPersistence.ts` + `boardTaskMovement.ts` (không phải `onMutate` của TanStack Query).

---

## 7. Quy ước (nên theo)

- Gọi API **chỉ** trong `*.service.ts`; component/hook không gọi `api` trực tiếp.
- Component trình bày nhận data qua props; logic fetch/biến đổi nằm ở hook/utils.
- Mọi prop phải có type — không `any` (strict mode).
- Style bằng CSS Modules co-located (`Component/styles.module.css` hoặc `Component.module.css`).
- Type/contract với backend lấy từ `@jiramini/shared` — không tự định nghĩa lại Task/Auth DTO.

## 8. Anti-patterns (tránh)
- ❌ Gọi `api`/Axios trực tiếp trong component.
- ❌ Đặt business logic trong component (đẩy sang hook/utils).
- ❌ Inline style — dùng CSS Modules.
- ❌ `any`.

## 9. Testing
Hiện **chưa có** test tự động trong `fe/`. Kế hoạch: Vitest + React Testing Library, ưu tiên test các util thuần trong `features/board/utils/` (movement, positions) và hook `useFetch`.
