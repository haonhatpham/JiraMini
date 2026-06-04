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

## Lint va format check

```powershell
npm run lint:fe
npm run lint:be
npm run prettier:fe
npm run prettier:be
```
