# B1 - Document Ingestion API (Backend)

## Prerequisites
- Node.js 18+
- npm
- PostgreSQL database

## Environment Setup
1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` in `.env`.

Example:
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
```

## Install
```bash
npm install
```

## Prepare Prisma Client and DB
```bash
npm run prisma:generate
npm run prisma:push
```

## Run API
```bash
npm start
```
Server runs on `http://localhost:3000`.

## Endpoints
- `GET /` service info
- `GET /health` health check
- `POST /ingest` upload PDF (form-data field name: `pdf`)

## Quick Test (PowerShell)
```powershell
curl.exe -i http://localhost:3000/
```
