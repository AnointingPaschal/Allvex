# Allvex

Africa's automotive operating system — import, own, and manage your vehicle with confidence.

Full-stack app: Vite + React + React Router + Tailwind CSS on the frontend, Supabase (Postgres + Auth + RLS) as the backend, and a Vercel serverless function proxying AI diagnostics through OpenRouter.

## Stack
- Vite + React 19 + React Router 7 + Tailwind CSS
- Supabase: Auth (email/password), Postgres, Row Level Security
- Vercel Serverless Functions (`/api/chat.js`) for AI chat, keeping the OpenRouter key server-side
- lucide-react icons, react-markdown for chat formatting

## First-time setup

### 1. Create a Supabase project
Go to [supabase.com](https://supabase.com), create a project, then open the **SQL Editor** and run, in order:
1. `supabase/schema.sql` — tables, enums, triggers, and RLS policies
2. `supabase/seed.sql` — catalog data (vehicles, images, accessories, articles, suppliers, inspectors)

### 2. Create demo accounts
Sign up 5 accounts either through the app's `/signup` page or via **Authentication → Users → Add User** in the Supabase dashboard:
- `alex.johnson@allvex.app` — becomes the demo Customer
- `admin@allvex.app` — Administrator
- `supplier@allvex.app` — Supplier
- `inspector@allvex.app` — Inspector
- `support@allvex.app` — Support agent

Each signup auto-creates a `profiles` row (role defaults to `customer`). Then run `supabase/seed_demo_users.sql` in the SQL Editor to promote the other 4 to their real roles and seed some personal demo data (garage vehicles, an active import, a support ticket) for the customer account.

### 3. Environment variables
Copy `.env.example` to `.env` for local dev. In Vercel (Project Settings → Environment Variables), set:
- `VITE_SUPABASE_URL` — from Supabase Project Settings → API
- `VITE_SUPABASE_ANON_KEY` — same page (this key is meant to be public; RLS is what secures your data, not key secrecy)
- `OPENROUTER_API_KEY` — **no `VITE_` prefix** — this one must stay server-side only, read by `/api/chat.js`

### 4. Develop
```
npm install
npm run dev
```

### 5. Deploy
Push to GitHub, import into Vercel. Framework preset **Vite** is auto-detected. `vercel.json` handles SPA routing so client-side routes like `/admin` don't 404.

## What's real vs. what's a known gap
- All customer-facing data (vehicles, garage, imports, orders, tickets) reads/writes real Supabase tables — no mock data.
- All 4 staff portals (Admin, Supplier, Inspector, Support) query real data scoped by role via RLS.
- **Not implemented:** actual file/photo upload (needs a Supabase Storage bucket + policies — documents and inspection media currently save metadata only, no binary upload), payment processing, email delivery, push notifications.
