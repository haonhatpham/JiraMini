# JiraMini

Monorepo cho project JiraMini, gom frontend va backend trong cung mot repository.

## Cau truc

```text
.
+-- fe/   # React + Vite frontend
+-- be/   # Node.js + Express backend
```

## Cai dat

```powershell
npm run install:all
```

Hoac cai rieng tung phan:

```powershell
npm run install:fe
npm run install:be
```

## Chay development

Frontend:

```powershell
npm run dev:fe
```

Backend:

```powershell
npm run dev:be
```

Mac dinh frontend chay o port `3000`, backend chay o port `3001`.

## Build

```powershell
npm run build:fe
npm run build:be
```

## Deploy miễn phí đề xuất

1. Frontend (miễn phí):
   - Deploy `fe/dist` lên Vercel hoặc Netlify.
   - Hai dịch vụ này có thể tự động lấy nguồn từ GitHub và build React/Vite.

2. Backend (miễn phí):
   - Deploy `be` lên Railway hoặc Render Free.
   - Railway dễ dùng cho Node/Express và hỗ trợ biến môi trường.

3. Cấu hình môi trường cho backend:
   - `NODE_ENV=production`
   - `PORT=3001` hoặc port do host cấp
   - `DATABASE_URL=...`
   - `JWT_SECRET=...` (ít nhất 32 ký tự)
   - `JWT_ISSUER=...`
   - `JWT_AUDIENCE=...`
   - `JWT_EXPIRES_IN=1h`
   - `CORS_ALLOWED_ORIGINS=https://your-frontend-url.com`
   - `CORS_CREDENTIALS=true`

4. Thực tế CORS:
   - Backend giờ dùng `CORS_ALLOWED_ORIGINS` thay vì `localhost` cố định.
   - Khi frontend deploy lên Vercel/Netlify, bạn phải đặt `CORS_ALLOWED_ORIGINS` thành URL frontend do dịch vụ cấp.

5. Quy trình deploy nhanh:
   - Tại root: `npm run install:all`
   - Build frontend: `npm run build:fe`
   - Build backend: `npm run build:be`
   - Deploy frontend bằng Vercel/Netlify.
   - Deploy backend bằng Railway/Render và set env vars.

## Frontend environment trước khi deploy

Trước khi deploy hoặc build frontend, bạn cần cấu hình `VITE_API_BASE_URL` để trỏ đến backend đã deploy:

- Tạo file `fe/.env` hoặc `fe/.env.production` khi chạy cục bộ.
- Hoặc cấu hình biến môi trường trong Vercel/Netlify.

Ví dụ `fe/.env.production`:

```env
VITE_API_BASE_URL=https://your-backend-domain.com/v1/api
VITE_API_TIMEOUT_MS=10000
```

Nếu bạn deploy frontend lên Vercel/Netlify, không cần commit file `.env`; chỉ set biến môi trường trong dashboard với key `VITE_API_BASE_URL`.

## Backend environment trước khi deploy

Backend cần file `be/.env` trong môi trường deploy hoặc biến môi trường trên host:

- `NODE_ENV=production`
- `PORT=3001` hoặc port host cấp
- `DATABASE_URL=...`
- `JWT_SECRET=...` (ít nhất 32 ký tự)
- `JWT_ISSUER=...`
- `JWT_AUDIENCE=...`
- `JWT_EXPIRES_IN=1h`
- `CORS_ALLOWED_ORIGINS=https://your-frontend-url.com`
- `CORS_CREDENTIALS=true`

> `be/.env.example` là mẫu, không dùng trực tiếp khi chạy sản phẩm. Bạn phải copy sang `be/.env` hoặc set biến môi trường tương đương.

## Lưu ý CORS

Backend hiện tại đã sửa để dùng `CORS_ALLOWED_ORIGINS` trong production.

- Nếu frontend deploy lên Vercel/Netlify, đặt `CORS_ALLOWED_ORIGINS` thành URL frontend thực tế.
- Ví dụ: `CORS_ALLOWED_ORIGINS=https://my-jiramini-app.vercel.app`

## Triển khai miễn phí phù hợp

- Frontend: Vercel hoặc Netlify (miễn phí, build Vite tự động từ GitHub)
- Backend: Railway hoặc Render Free (miễn phí cho Node.js/Express)

## Tóm tắt bước deploy

1. `npm run install:all`
2. Copy `be/.env.example` thành `be/.env` và điền giá trị production.
3. Nếu muốn build frontend cục bộ, tạo `fe/.env.production` hoặc set `VITE_API_BASE_URL`.
4. `npm run build:fe`
5. `npm run build:be`
6. Deploy frontend lên Vercel/Netlify.
7. Deploy backend lên Railway/Render và set các env vars.
8. Cập nhật `CORS_ALLOWED_ORIGINS` thành URL frontend.

## Lint va format check

```powershell
npm run lint:fe
npm run lint:be
npm run prettier:fe
npm run prettier:be
```
