# PLAN — Unofficial Ricky Ponting fan site

Stack: Next.js 15 (App Router) + TypeScript, Tailwind CSS v4, shadcn/ui, Motion, Recharts, next-themes, next/og, Vercel Analytics. Deploy: Vercel via GitHub.

After every phase: `npm run build` and `npm run lint` clean, the "done when" check tested, one git commit, `PROGRESS.md` updated.

Design direction: a ground scoreboard, not a template. Near-black green boards, chalk-white lettering, gold number plates, square corners, hairline rules, left-aligned layouts. Australian green `#00843D` and gold `#FFCD00`. Condensed display type (Big Shoulders) for headings and numbers, Hanken Grotesk for body. No photos, no gradients-as-decoration, no glow, no emoji.

Data rule that shapes everything: every number in `src/data/**/*.json` sits in an object that carries `source` and `verified`. `npm run check:data` enforces it and runs before every build.

---

## Phase 0 — Foundation

Scope: Next.js 15 scaffold in this folder, own git repo, folders `src/app`, `src/components`, `src/data`, `src/lib`, shadcn/ui init, brand tokens and fonts, `CLAUDE.md`, `PLAN.md`, `PROGRESS.md`, `.env.example`, "Coming soon" page with the unofficial-site line.

Done when:
- `npm run build` and `npm run lint` pass.
- `/` renders the "Coming soon" page with the unofficial fan site disclaimer.
- First commit exists on `main`; GitHub push and Vercel import commands handed over. **Wait for confirmation.**

## Phase 1 — Design system and homepage

Scope: navbar (Test, ODI, T20I, IPL, Captaincy, Records, Compare, Fan Zone), mobile menu, theme toggle (dark default, light), footer with disclaimer, hero with animated scoreboard counters, reusable `StatCard`, `SectionHeading`, `ScoreboardCounter`, `src/data/career-summary.json`, `check:data` script.

Done when:
- Homepage hero counters animate to the values in `career-summary.json`; no stat literal in any component.
- Nav links, mobile menu (360px) and theme toggle work; theme persists on reload.
- Layout holds at 360px, 768px and 1280px with no horizontal scroll.
- `npm run check:data` passes; build and lint pass.

## Phase 2 — Data layer and format pages

Scope: typed JSON for `test`, `odi`, `t20i`, `ipl` (runs, average, strike rate, highest score, 100s, 50s, by year, by opponent, home vs away), one reusable `FormatPage` with tabs, Recharts charts, routes `/test` `/odi` `/t20i` `/ipl`, IPL page with coaching stints, dev-only banner listing every unverified field.

Done when:
- All four routes render from JSON through the same `FormatPage`; tabs switch Overview / By year / By opponent / Home and away.
- Charts render in both themes and at 360px.
- Dev banner shows in `npm run dev`, lists every `verified: false` path, and is absent from the production build.
- Build, lint, `check:data` pass.

## Phase 3 — Captaincy, Records and timeline

Scope: `/captaincy` with Captain vs Player toggle, 2003 and 2007 World Cups, Ashes highs and lows; `/records` with filterable cards (ICC awards, Hall of Fame, batting and captaincy records); scroll-driven career timeline (1995 debut to coaching) on the homepage and at `/timeline`.

Done when:
- The toggle swaps captain / non-captain numbers from JSON for each format.
- Record cards filter by category; empty filter state handled.
- Timeline progress follows scroll; with reduced motion it renders static.
- Build, lint, `check:data` pass.

## Phase 4 — Innings replay

Scope: data-driven `/innings/[slug]` and `/innings` gallery. First entry: 140* in the 2003 World Cup final. Play, pause, scrub; animated score; run-rate chart; scoreboard display; key-moment captions; share button.

Done when:
- `/innings/2003-world-cup-final` plays start to finish, pauses, and scrubs to any point with score, chart and caption in sync.
- Adding a second JSON file adds a gallery card and a route with no component change.
- Any reconstructed (not ball-by-ball sourced) point is `verified: false` and labelled on the page.
- Build, lint, `check:data` pass.

## Phase 5 — Compare tool

Scope: `/compare` for Ponting vs Tendulkar, Kallis, Lara, Kohli per format; side-by-side bars; radar chart; generated summary line; URL-synced selection `?a=&b=&format=`; fair-comparison note about eras.

Done when:
- Changing a player or format updates bars, radar, summary and the URL; loading a shared URL restores the same view.
- Invalid or missing params fall back to a default pair; a format a player never played shows a clear empty state.
- Build, lint, `check:data` pass.

## Phase 6 — Fan Zone with Supabase

**Removed on 2026-11-13 at the owner's request, after it was built and checked. See `PROGRESS.md`. The original scope is kept below for the record.**

Scope: SQL migrations with RLS on every table (`polls`, `poll_options`, `votes`, `quiz_scores`, `fan_wall_posts`); live polls with one vote per browser plus server-side check and rate limiting; 10-question quiz with nickname-only leaderboard; fan wall with spam and profanity filtering and `pending` moderation; page `/fan-zone`. All writes go through server routes; the browser never holds a write key.

Done when:
- Without Supabase env vars the site still builds and `/fan-zone` shows a clear "not connected" state (quiz still playable locally).
- **Pause for Supabase project and keys.** With keys: a second vote from the same browser is rejected by the server; rapid repeat requests are rate limited; quiz score lands on the leaderboard; a wall post is stored as `pending` and is not public until approved; a profane or link-spam post is rejected.
- RLS enabled on every table; anon role can only read public rows.
- Build, lint, `check:data` pass.

## Phase 7 — Launch polish

Scope: per-page metadata, Open Graph, sitemap, robots, JSON-LD, question-style SEO pages (`/stats/ponting-vs-india`, `/stats/ponting-captain-record` and similar, each with unique accurate copy built from the JSON), next/og share cards with Web Share and WhatsApp fallback, PWA manifest and offline caching, Vercel Analytics and Speed Insights, accessibility pass including reduced motion, Lighthouse 90+.

Done when:
- Every route has its own title, description and OG image; `/sitemap.xml` and `/robots.txt` list the right URLs; JSON-LD validates.
- Share button uses Web Share where available, WhatsApp link otherwise.
- Site installs as a PWA and shows an offline page with no network.
- Keyboard-only pass works on nav, tabs, replay controls and forms; reduced motion disables animation.
- Lighthouse (mobile) scores 90+ for Performance, Accessibility, Best Practices and SEO on `/` and one format page.
- Build, lint, `check:data` pass.

## Final handover

(a) Every unverified number to check by hand. (b) Launch checklist: domain, Search Console, where to post. (c) Exact env vars for Vercel.
