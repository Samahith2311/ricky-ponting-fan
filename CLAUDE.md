# CLAUDE.md — Ricky Ponting fan site

Unofficial fan site. Next.js 15 (App Router) + TypeScript, Tailwind CSS v4, shadcn/ui (Radix, `lyra` preset), Motion, Recharts, next-themes, Supabase, next/og, Vercel Analytics. Deployed on Vercel from GitHub. The user is on Windows: give PowerShell-compatible commands.

## Hard rules

1. **All cricket stats live in `src/data/*.json`.** Never hardcode a stat in a component, page, metadata string or OG image. Components read JSON; derived values (win %, differences) are computed from JSON at render time.
2. **Every number carries `source` and `verified`.** Each number in a data file sits directly inside an object that has `source` (URL or citation) and `verified` (boolean). Look figures up on ESPNcricinfo Statsguru or another reliable source. If a number was not confirmed against a fetched source, set `"verified": false`. Never guess silently. `npm run check:data` enforces the shape and runs before every build.
3. **Keep `PROGRESS.md` current.** Update it after every phase. `PLAN.md` holds the phases and their "done when" checks.
4. **Never commit secrets.** Secrets go in `.env.local` (gitignored). `.env.example` lists names only. Tell the user what to set in Vercel.
5. **No copyrighted photos.** Video is embedded YouTube only. The footer must say this is an unofficial fan site.

## Process

One phase at a time. After each phase: `npm run build`, `npm run lint`, fix errors, test the phase's "done when" check, commit with a clear message, update `PROGRESS.md`. Stop and ask only for things the user must do: GitHub push, Vercel import, Supabase project and keys, or a decision that cannot be made here.

## Commands

```powershell
npm run dev          # local dev (Turbopack)
npm run build        # runs check:data first, then next build
npm run lint         # eslint
npm run check:data   # every number in src/data has source + verified
```

## Layout

- `src/app` — routes, layouts, metadata, route handlers
- `src/components` — site components; `src/components/ui` is shadcn/ui
- `src/data` — all stats and site copy as JSON
- `src/lib` — types, data loaders, helpers
- `supabase/migrations` — SQL migrations (RLS on every table)

## Design

Scoreboard, not template. Australian green `#00843D`, gold `#FFCD00`. Dark by default, light supported. Headings and numbers in Big Shoulders (condensed, uppercase); body in Hanken Grotesk. Square corners, hairline rules, left-aligned layouts. Use the tokens in `src/app/globals.css`; gold is never text on a light background. No gradients as decoration, glow, glass blur, emoji or stock imagery. Mobile-first: check 360px, 768px, 1280px. Respect `prefers-reduced-motion`.

## Conventions

- Server components by default; `"use client"` only where state, effects, Motion or Recharts need it.
- Next.js 15: `params` and `searchParams` are Promises in pages and layouts.
- Supabase writes go through server route handlers only. The service role key never reaches the browser.
