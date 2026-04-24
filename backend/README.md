# Backend (Express + PostgreSQL)

## Setup

1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run database schema and seed (using your Supabase PostgreSQL connection string):
   ```bash
   npm run db:schema
   npm run db:seed
   ```
4. Start server:
   ```bash
   npm run dev
   ```

## Environment Variables

- `PORT` (default `5000`)
- `DATABASE_URL` (Supabase Postgres connection string)
- `JWT_SECRET`
- `CORS_ORIGIN` (frontend URL, e.g. Vercel domain)

## API Overview

- Auth:
  - `POST /api/auth/signup` (normal user)
  - `POST /api/auth/login`
  - `GET /api/auth/me`
  - `PUT /api/auth/update-password`
- Admin:
  - `GET /api/admin/dashboard`
  - `POST /api/admin/users`
  - `POST /api/admin/stores`
  - `GET /api/admin/users`
  - `GET /api/admin/users/:id`
  - `GET /api/admin/stores`
- User Stores:
  - `GET /api/stores`
  - `PUT /api/stores/:id/rating`
- Owner:
  - `GET /api/owner/dashboard`

## Deployment on Render

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Add env vars from `.env.example`.
- Set `CORS_ORIGIN` to your Vercel frontend URL.
