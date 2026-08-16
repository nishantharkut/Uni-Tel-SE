# UNI-TEL Setup Guide

## Prerequisites

- Node.js 18 or later
- npm
- A Supabase project for authentication and persistent academic data
- Supabase CLI for database and Edge Function setup

## 1. Install dependencies

```powershell
npm ci
```

## 2. Configure environment variables

Create `.env.local` in the repository root:

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-or-publishable-key>
```

Use only the browser-safe Supabase anonymous/publishable key. Never expose the service-role key in frontend environment variables.

## 3. Set up Supabase

Use the fresh database setup guide:

[docs/database/supabase-setup.md](docs/database/supabase-setup.md)

The current baseline migration is:

`supabase/migrations/20260817000000_initial_schema.sql`

## 4. Run the application

```powershell
npm run dev
```

Vite serves the app locally, usually at `http://localhost:5173`.

## 5. Validate the setup

```powershell
npx tsc -p tsconfig.app.json --noEmit --pretty false
npm run build
```

Expected result: both commands exit successfully. Existing Vite warnings about large chunks or stale Browserslist data do not block local development.

## Troubleshooting

- If the app cannot connect to Supabase, recheck `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
- If authenticated pages load but data is missing, confirm the baseline migration was applied.
- If JSON import fails, deploy the Edge Function with `supabase functions deploy import-academic-data`.
- If local Supabase commands fail with Docker errors, start Docker Desktop or use a disposable Supabase project for database verification.
