# Script Hub

React, Vite and Supabase application for publishing scripts, managing executors and viewing author profiles.

## Run locally

1. Install Node.js and run `npm ci`.
2. Create `.env.local` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase project. Use a publishable or legacy anon key, never a service role key.
3. Run `npm run dev`.

For a new database, apply `schema.sql` once. Create an Auth user for the owner and add that user's email to `public.admin_users` with role `Owner`. Then apply the SQL files in `supabase/migrations/` in filename order and create the public `images` Storage bucket. The existing Supabase project already has these migrations applied.

## Checks

- `node_modules/.bin/tsc --noEmit` checks TypeScript.
- `npm run build` creates the production bundle in `dist/`.

The site uses client side routes. `vercel.json` rewrites those routes to `index.html` when deployed on Vercel.
