# Frontend (React + Vite)

## Setup

1. Copy `.env.example` to `.env`.
2. Set `VITE_API_URL` to backend base URL (local or Render).
3. Install and run:
   ```bash
   npm install
   npm run dev
   ```

## Build

```bash
npm run build
npm run preview
```

## Deployment on Vercel

- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variable:
  - `VITE_API_URL` = your Render backend URL
