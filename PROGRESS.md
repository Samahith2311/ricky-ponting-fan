# PROGRESS

Running log. Phases and "done when" checks are in `PLAN.md`.

| Phase | Status |
|---|---|
| 0 Foundation | Done. Pushed to GitHub, deployed on Vercel (confirmed by user) |
| 1 Design system and homepage | Done |
| 2 Data layer and format pages | Done |
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

## Phase 1 — Design system and homepage (2026-11-12)

Done:
- Data pipeline: `npm run data:build` reads ESPNcricinfo Statsguru result pages (`scripts/statsguru.mjs`) and writes `career-summary.json`, `test.json`, `odi.json`, `t20i.json`, `ipl.json`, `captaincy.json`, `compare.json`. Every row carries its page URL and `verified: true`. The script fails if a breakdown does not add up to the career total, or if captaincy results do not add up to matches.
- Navbar (Test, ODI, T20I, IPL, Captaincy, Records, Compare, Fan Zone), mobile menu (sheet), theme toggle (dark default, light, persisted), footer with disclaimer and source credit, skip link.
- `ScoreboardCounter` (rolling number plates, CSS-driven, starts when in view), `StatCard`, `SectionHeading`.
- Homepage: hero with the scoreboard, by-format boards, links to the other sections.

Checks: build pass, lint pass, check:data pass (8 files). In the browser: counters land on 27483 / 71 / 560 / 3, which are sums of the JSON rows; theme survives reload; mobile menu opens and closes; no horizontal scroll at 360, 768, 1280.

Decisions:
- Numbers are parsed from Statsguru HTML by script, not typed by hand or transcribed by a model, so `verified: true` means "copied from the cited page on the retrieved date".
- The hero board stays dark in the light theme (a scoreboard is black in daylight too). Gold is never text on a light background.
- International totals (runs, hundreds, matches) and the World Cup count are computed at render time from the JSON rows.
- Nav links to `/test` etc. 404 until Phase 2 to 6 add the routes.

## Phase 2 — Data layer and format pages (2026-11-12)

Done:
- Typed data layer: `FormatData` in `src/lib/types.ts`, loaders in `src/lib/data.ts`. The four format files are type-checked against it at build.
- One route file, `src/app/[format]/page.tsx`, serves `/test`, `/odi`, `/t20i`, `/ipl` through one `FormatPage`. Anything else at that level is a 404.
- `FormatPage`: career stat grid, tabs (Overview, By year, By opponent, Home and away), tables for every split, derived highlights (best year, most runs against, best average against).
- Charts: Recharts for runs by year and average by year (two charts, one axis each), loaded only when scrolled into view. Ranked bars for opponents, venues and host countries are plain HTML so they render on the server and work at 360px with long team names.
- IPL page adds "In the dugout": three head-coach stints and eleven seasons, from Wikipedia season tables (`src/data/coaching.json`).
- Dev-only banner (`UnverifiedBanner`) lists every `verified: false` entry. `node scripts/check-data.mjs --unverified` prints the same list.

Checks: build pass, lint pass, check:data pass (10 files, 0 unverified). In the browser: all four routes render, tabs switch, charts render in both themes and at 360px, no horizontal scroll. Banner test: flipped one coaching row to `verified: false`, the dev banner listed `coaching.json.seasons[10]` and the row showed a dagger; the production HTML has no banner; flag restored.

Decisions:
- No dual-axis chart: runs and average are separate charts sharing the year axis.
- Statsguru prints "-" in count columns when he played but did not bat; the generator stores 0 there. Average, strike rate and highest score stay `null`.
- Do not run `npm run build` while `npm run dev` is running: both write `.next` and the dev server breaks.

Fixed along the way: a wide table inside a CSS grid stretched the page to 626px on a 360px screen (`grid-cols-1` fixes it). A PowerShell text round-trip added a BOM to `coaching.json` and broke the en dashes; restored and checked byte by byte.

## Unverified numbers

None. Statsguru rows were parsed from the page named in their `source`. Coaching rows were read from the Wikipedia wikitext named in their `source`.
