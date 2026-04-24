# FullStack Intern Coding Challenge Solution

This workspace contains two **separate** deployable applications:

- `backend/` → Express API + PostgreSQL (Supabase)
- `frontend/` → React (Vite)

## Features Implemented

### Roles

- System Administrator
- Normal User
- Store Owner

### Core Functionality

- Single login system with role-based access.
- Normal user signup.
- Ratings from 1 to 5 with update support.
- Password update for logged-in users/owners.
- Admin dashboard stats:
  - Total users
  - Total stores
  - Total ratings
- Admin management:
  - Add users (ADMIN/USER/OWNER)
  - Add stores (with optional OWNER assignment)
  - Filter/sort users and stores
  - View user details (includes owner average rating)
- User dashboard:
  - Search stores by name/address
  - Sort store list
  - View overall rating + own submitted rating
  - Submit/modify ratings
- Owner dashboard:
  - View average store rating
  - View users who rated their store

### Validations

- User name: required (non-empty), max 60 chars
- Address: max 400 chars
- Password: 8-16 chars, at least 1 uppercase + 1 special char
- Email: standard email format

## Quick Start

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run db:schema
npm run db:seed
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Admin Login Credentials

- Email: `admin@store-ratings.com`
- Password: `Admin@123`

### Notes for Render Free Tier

- Backend may sleep after inactivity and need a cold start.
- Frontend already shows a loading spinner while API calls are pending.
