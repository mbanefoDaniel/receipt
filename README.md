# Internal Receipt Generator

A production-focused internal receipt management app built with Next.js 15 App Router, TypeScript, Tailwind, shadcn/ui patterns, Prisma, Neon Postgres, Supabase Storage, React Hook Form, Zod, and React PDF.

## Features

- Single-admin authentication (internal use only)
- Dashboard analytics (total receipts, total revenue, monthly chart)
- Dynamic receipt generator (items, quantity, unit price, discounts, notes, warranty)
- Payment methods: Cash, Transfer, POS
- Premium receipt detail and print layout with QR verification
- Public verification route: `/verify/[receiptId]`
- React PDF download with logo support and professional spacing
- Receipt history with search, filter, view, delete
- Customer records with spend and receipt count
- Business settings (name, logo, footer, contact, default warranty)
- Responsive light/dark dashboard UI

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui-style component architecture
- Neon Postgres + Supabase Storage
- Prisma ORM
- React Hook Form + Zod
- React PDF

## 1) Environment Setup

Copy `.env.example` to `.env` and fill values:

```env
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-example-123456-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-example-123456.us-east-1.aws.neon.tech/neondb?sslmode=require"
AUTH_SECRET="replace-with-long-random-string"
ADMIN_EMAIL="admin@yourbusiness.com"
ADMIN_PASSWORD="ChangeThisToAStrongPassword123!"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET="business-assets"
```

## 2) Neon + Storage Setup

1. Create a Neon project and database.
2. In Neon dashboard, copy:
	- Pooled connection string into DATABASE_URL
	- Direct connection string into DIRECT_URL
3. Ensure both URLs include sslmode=require.
4. For logo upload, create a Supabase project and a public Storage bucket named business-assets.
5. Copy Supabase URL and anon key into NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.

## 3) Install and Run

```bash
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev
```

Open http://localhost:3000 and login with:

- Email: value from `ADMIN_EMAIL`
- Password: value from `ADMIN_PASSWORD`

## 4) Single Admin Constraint

The `Admin` model uses a fixed primary key (`id = 1`) and there is no admin registration route. This enforces one internal admin account for the app.

## 5) Project Structure

```text
.
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
├─ src/
│  ├─ app/
│  │  ├─ (auth)/login
│  │  ├─ (dashboard)/dashboard
│  │  ├─ (dashboard)/receipts
│  │  ├─ (dashboard)/customers
│  │  ├─ (dashboard)/settings
│  │  ├─ api/
│  │  └─ verify/[receiptId]
│  ├─ components/
│  │  ├─ dashboard/
│  │  ├─ layout/
│  │  ├─ receipts/
│  │  ├─ settings/
│  │  └─ ui/
│  ├─ lib/
│  └─ types/
├─ middleware.ts
└─ README.md
```

## 6) Notes

- This app is intentionally single-tenant, internal-only.
- No customer auth, subscription, or payment gateway exists.
- To deploy, set production env vars and run `npm run build`.
