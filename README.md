# PharmaCare — Pharmacy Inventory Management System

A production-ready pharmacy inventory system for single-user clinics.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Forms | React Hook Form, Zod |
| Tables | TanStack Table |
| Backend | Supabase (Auth + Database + Storage) |
| Database | PostgreSQL (via Supabase) |
| Deployment | Vercel |

## Features

- Medicine Master with drug form ordering (Tablet → Syrup → Injection → External Use → Herbal)
- FEFO (First Expired, First Out) dispensing with multi-LOT allocation
- Barcode scanning via mobile camera (no app required)
- LOT-level inventory tracking with expiry color coding
- Dashboard with real-time stats
- Reports exportable to Excel
- Supabase Auth (single user login)

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd pharmacy-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your Supabase project URL and anon key from [supabase.com](https://supabase.com).

### 4. Run database migrations

Apply migration files from `supabase/migrations/` in your Supabase SQL editor (in order).

### 5. Create a user in Supabase Auth

Go to Supabase Dashboard → Authentication → Users → Add user.

### 6. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/       # Login page
│   └── (dashboard)/        # Protected pages (auth-gated)
│       ├── dashboard/
│       ├── medicines/
│       ├── receive/
│       ├── dispense/
│       ├── inventory/
│       ├── history/
│       ├── reports/
│       └── scan/
├── components/
│   ├── layout/             # Sidebar, Header
│   └── ui/                 # shadcn/ui components
├── hooks/                  # Custom React hooks
├── lib/
│   ├── supabase/           # Supabase clients (browser, server, middleware)
│   └── utils.ts
├── types/                  # TypeScript types & domain logic
└── middleware.ts            # Route-level auth guard
supabase/
└── migrations/             # SQL migration files (apply in order)
```

## Theme

| Token | Hex |
|-------|-----|
| Background | `#F7F6E5` |
| Primary | `#A888B5` |
| Secondary | `#DBC4F0` |
| Text | `#1B211A` |

## Development Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Project Setup | ✅ Complete |
| 2 | Database Schema | ⏳ |
| 3 | Dashboard | ⏳ |
| 4 | Medicine Master | ⏳ |
| 5 | Receive Medicine | ⏳ |
| 6 | Dispense + FEFO | ⏳ |
| 7 | Inventory | ⏳ |
| 8 | Reports | ⏳ |
| 9 | Barcode Scanning | ⏳ |
| 10 | Deployment | ⏳ |
