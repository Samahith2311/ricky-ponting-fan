# PROGRESS

Running log. Phases and "done when" checks are in `PLAN.md`.

| Phase | Status |
|---|---|
| 0 Foundation | Done, waiting for GitHub push + Vercel import confirmation |
| 1 Design system and homepage | Not started |
| 2 Data layer and format pages | Not started |
| 3 Captaincy, Records, timeline | Not started |
| 4 Innings replay | Not started |
| 5 Compare tool | Not started |
| 6 Fan Zone with Supabase | Not started |
| 7 Launch polish | Not started |

## Phase 0 — Foundation (2026-11-12)

Done:
- Own git repo in this folder on `main` (the parent `C:\projectt` is a separate repo).
- Next.js 15.5 (App Router, TypeScript, `src/` dir), Tailwind CSS v4, ESLint.
- shadcn/ui initialised: Radix base, `lyra` preset (sharp corners).
- Brand tokens in `src/app/globals.css`: dark default, light ready, green `#00843D`, gold `#FFCD00`.
- Fonts via `next/font`: Big Shoulders (display), Hanken Grotesk (body).
- "Coming soon" page and footer disclaimer, copy from `src/data/site.json`.
- `npm run check:data` (rule 2 enforcement) wired into `prebuild`.
- `CLAUDE.md`, `PLAN.md`, `.env.example`.

Checks: build pass, lint pass, check:data pass, `/` serves the Coming soon page with the disclaimer.

Decisions:
- Scaffolded in a temp subfolder then moved up, because the folder name "Ricky Pointing" is not a valid npm package name.
- Production build uses webpack (`next build`); Turbopack is dev only.
- Statsguru is reachable for by-year, by-opponent, home/away and captaincy splits, so those can be verified.

Needs from user: push to GitHub, import into Vercel, confirm.

## Unverified numbers

None yet. No stats in the repo before Phase 1.
