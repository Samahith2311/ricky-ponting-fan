# PROGRESS

Running log. Phases and "done when" checks are in `PLAN.md`.

## Where we stopped (2026-11-13)

| Phase | Status | Commit |
|---|---|---|
| 0 Foundation | Done. Pushed to GitHub, deployed on Vercel (confirmed by user) | `6d34145` |
| 1 Design system and homepage | Done | `12c9354` |
| 2 Data layer and format pages | Done | `5da9eb9` |
| 3 Captaincy, Records, timeline | Done | `667d629` |
| 4 Innings replay | Done | `7d1d722` |
| 5 Compare tool | Done | `32ab8e2` |
| 6 Fan Zone with Supabase | Done locally against the real Supabase project. Left for the owner: Vercel variables, security advisor, push | `ebdd6f7` |
| 7 Launch polish | Not started | |

**Phase 6 is not pushed yet.** Everything up to `32ab8e2` is on GitHub (`main` matched `origin/main` on 2026-11-13). The Phase 6 commit exists only on this machine. Pushing it is safe without keys: the Fan Zone shows "Not connected" and the quiz still plays. To update the live site:

```powershell
cd "C:\projectt\Ricky Pointing"
git push
```

### Next

- Phase 6, owner steps left: set the four environment variables in Vercel, look at the security advisor, delete the "Setup check" test rows, push. Detail in `PHASE6-STATUS.md`.
- Phase 7, launch polish: includes a look at the homepage bundle. First Load JS is 250 kB (199 kB before Phase 3); the rise is Motion, pulled in by the homepage timeline.
- Final handover: unverified list, launch checklist, Vercel env vars.

### To resume

Open this folder in Claude Code and say: `continue from PROGRESS.md`.

### Working notes

- Do not run `npm run build` while `npm run dev` is running. Both write `.next` and the dev server breaks.
- Do not rewrite project files with PowerShell `Get-Content` / `Set-Content`. It added a byte-order mark and broke the en dashes in `coaching.json`. Use the editor tools or Node.
- A PowerShell here-string commit message must not contain double quotes.
- Statsguru answers 503 when asked too fast. `scripts/build-data.mjs` waits and retries; a full `npm run data:build` takes about three minutes.
- Kohli is still playing, so his rows in `compare.json` and `rankings.json` move. Run `npm run data:build` again before launch.
- The GateGuard hook denies the first write to a new file in each folder per turn. State the facts it asks for and retry.
- To add an innings: download the Cricsheet archive that holds the match into a folder outside the repo, then run `node scripts/build-innings.mjs <path to the match .json>`. The script checks the ball data against Statsguru and writes nothing on a mismatch. No component change is needed.
- Port 3000 can be held by another project on this machine (`C:\projectt\CamPus_security\web`). Run this site on another port: `npm run dev -- -p 3100`.

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

## Phase 3 — Captaincy, Records and timeline (2026-11-13)

Data (all four files pass `check:data`, 0 unverified):
- `src/data/captaincy.json` (generated): record as captain per format, World Cup record as captain, batting as captain against not captain, all five World Cups he played, all eight Ashes series with a `captain` flag.
- `src/data/rankings.json` (generated): seven all-time lists with the leaders.
- `src/data/honours.json` (hand-written from Wikipedia wikitext and one Statsguru records page): 17 entries in four categories.
- `src/data/timeline.json` (hand-written, same sources): 24 events, 1974 to 2024. `major: true` marks the homepage cut.

Done:
- Types and loaders for captaincy, rankings, honours and timeline in `src/lib/types.ts` and `src/lib/data.ts`.
- `/captaincy`: record as captain per format with a results bar (win rate computed at render), Captain vs Player toggle (`captain-toggle.tsx`, client), 2003 and 2007 World Cup panels, a table of all five World Cups, the eight Ashes series with the captained ones flagged and highlight cards derived from the rows.
- `/records`: cards from `rankings.json` and `honours.json`, client filter whose categories come from the data, empty state.
- Timeline: `CareerTimeline` (server) inside `TimelineRail` (client, Motion `useScroll` progress line). `/timeline` shows every event; the homepage shows the `major` ones and links to the full page.
- `UnverifiedMark`: dagger plus footnote for any `verified: false` entry on the new pages.
- Page titles and leads for the three pages in `site.json` under `pages`.

Checks: build pass, lint pass, check:data pass (13 files, 0 unverified). In the browser (production build): the toggle swaps captain and not-captain numbers and they match `captaincy.json`; the filter narrows the cards per category; the timeline progress line follows scroll; no horizontal scroll at 360px on `/`, `/captaincy`, `/records`, `/timeline` (768 and 1280 were checked before the review fixes, which did not touch layout); heading order is h1, h2, h3. Unverified mark test: five entries flipped to `verified: false`, marks and footnotes showed, files restored.

Not checked:
- Reduced motion with the real OS setting. It was simulated by overriding `matchMedia`: no progress line, every event visible.
- The homepage timeline section in the dark theme.
- The records empty state with real data. No category is empty, so it was seen only by forcing it.

Decisions:
- `rankings.json` has no category, so its seven lists are filed under Records.
- `timeline.json` keeps its hand-written order. The loader does not sort.
- Series titles are left out of the World Cup and Ashes tables to keep the sticky first column narrow at 360px.
- A code review after the build led to twelve fixes: one typed count in the captaincy lead, heading order, link names for screen readers, the unverified mark, and moving the timeline list back to a server component.

## Phase 4 — Innings replay (2026-11-13)

Data:
- `src/data/innings/2003-world-cup-final.json`, generated by `scripts/build-innings.mjs` from Cricsheet's ball-by-ball file for match 65286 (archive `icc_mens_cricket_world_cup_json.zip`). Nothing is reconstructed. One point per legal ball, from the moment he walks in until the innings ends or he is out.
- The script checks the ball data against Statsguru (his runs, balls, fours, sixes and not out; the team total, wickets and overs; the match number) and writes nothing on a mismatch.
- Licence: Cricsheet match data is under the Open Data Commons Attribution License 1.0. The attribution notice, with links, is on `/innings` and on each replay page.

Done:
- Loader `src/lib/innings.ts` reads every file in `src/data/innings/`. A file whose `id` differs from its file name fails the build.
- `/innings` gallery and `/innings/[slug]` replay, statically generated. Unknown slugs are a 404.
- Player (`innings-player.tsx`, client): play, pause, replay, native range scrubber, key-moment buttons, scoreboard plates, run-rate chart (Recharts, loaded lazily), caption. Key moments are derived from the ball data; caption text is in the JSON.
- Share button: Web Share where available, otherwise copy the link.
- Unverified points, results and gallery figures carry the dagger and the note.

Checks: build pass, lint pass, check:data pass (14 files, 0 unverified). In the browser: plays start to finish; pauses; scrubbed to ten points with the board matching the JSON; during play the plates, chart dot and caption agreed at nine samples; the scrubber works from the keyboard; a second JSON file added a gallery card and a route with no component change (a copy, and later a real second innings from match 65275, both removed afterwards); a dismissed innings ends at the dismissal and says so; unverified marks show; no horizontal scroll at 360px; the timeline link to the replay resolves.

Not checked:
- The native share sheet and a real clipboard write. The copy path was tested with a stubbed clipboard.
- Reduced motion with the real OS setting, and screen-reader output.

Decisions:
- `verified: true` on the ball points means parsed by script from the fetched Cricsheet file, the same meaning as for the Statsguru rows.
- Scrubbing pauses playback. Playback is 90 ms per ball. No speed control.
- The batter name is shown scorecard style, as Cricsheet has it.
- `build-innings` is run by hand. It is not part of `npm run data:build`.
- A code review after the build led to eleven fixes: the plates no longer roll inside the player (they lagged the chart), points end at a dismissal, sources cite the archive and file, and the gallery carries the attribution.

## Phase 5 — Compare tool (2026-11-13)

Done:
- `/compare`: any two of the five batters in `compare.json`, per format. The selection lives in the URL as `?a=&b=&format=`. `src/lib/compare.ts` validates it: values are lowercased, bad or missing values fall back to the default pair, and a duplicate pair is repaired.
- Side-by-side bars with the real values printed (matches, runs, average, strike rate, hundreds, fifties), a radar chart (Recharts, loaded lazily), a summary line generated from the data, an era note, an empty state when a player has no figures in the format, and per-player source links with the retrieved date.
- Picking the player the other select holds swaps the two.
- Series colours are tokens in `globals.css`: `--compare-a` (blue) and `--compare-b` (orange).

Checks: build pass, lint pass, check:data pass (14 files, 0 unverified). In the browser: changing a player or the format updates bars, radar, summary and URL, and the values match `compare.json`; a shared URL restores the view; invalid, upper-case, array-valued and missing params fall back; the empty state shows for a player with no figures in a format; Back and Forward step through the choices with controls and results in agreement; results are marked busy while the server answers; no horizontal scroll at 360, 768 and 1280; both themes.

Palette: the pair passes the dataviz palette validator in both themes on both surfaces (lightness band, chroma, colour-vision deficiency, contrast). The lowest contrast against a surface is 3.61:1. Gold is not a series colour because it cannot pass the dark lightness band.

Not checked: screen-reader output, reduced motion with the real OS setting (the radar never animates), and the unverified mark on this page (every compare row is verified).

Decisions:
- `/compare` is server-rendered on demand (dynamic), so a shared URL arrives with its content. It is the only page that is not static.
- A selection change pushes a history entry, so Back steps through choices instead of leaving the page.
- The radar is scaled per axis to the higher of the two players and is hidden from screen readers; the bars carry every value. A measure with no recorded value is dropped from the radar and named in the summary.
- Highest score, ducks, fours and sixes are not compared.
- A code review after the build led to ten fixes, including the light-theme orange (it was under 3:1 contrast) and a rounded bar corner.

## Phase 6 — Fan Zone with Supabase (2026-11-13)

Full detail, owner steps, known limits and deviations from the design are in `PHASE6-STATUS.md`.

Done:
- `supabase/migrations/0001_fan_zone.sql`: six tables, row level security on all of them, explicit grants, `fz_hit` (rate limit) and `poll_results` functions, three seeded opinion polls.
- `src/lib/fan-zone/`: validation and filters (`rules.ts`, pure), config, hashing, plain `fetch` REST calls to Supabase, shared POST steps.
- Route handlers under `src/app/api/fan-zone/`: `polls`, `polls/vote`, `quiz`, `leaderboard`, `wall`. Every write goes through them with the service role key; the browser holds no key.
- `/fan-zone`: polls, ten-question quiz, leaderboard, fan wall with post form, privacy note. Copy in `site.json` under `pages.fanZone`. Quiz answers in `src/data/quiz.json`, each copied from an existing data row with its source.
- `npm run test:fan-zone` (7 tests on the rules). One new dependency: `server-only`.

Checks: build pass, lint pass, `tsc` pass, check:data pass (16 files, 0 unverified), self-check 7 of 7. Without keys the site builds, `/fan-zone` shows "Not connected", the quiz plays and POSTs return 503.

Checked against a local Postgres, not a Supabase project (PGlite running the real migration, behind a throwaway stand-in for the Supabase REST calls, with the production build):
- The migration runs clean. Every table has row level security. The `anon` and `authenticated` roles are denied on `votes`, `rate_limits`, every write and `fz_hit`; `anon` sees no draft poll and no pending or rejected wall post.
- Votes: a second vote with the same cookie gives 409; a cleared cookie is capped at 5 per poll per day per IP, then 429; the 11th vote in 10 minutes gives 429 with `Retry-After`; an option from another poll 400; a closed poll 409; a draft poll 404. Only hashes are stored.
- Quiz: extra `score` key 400, nine answers 400, wrong version 409, profane nickname 422, a valid score lands on the leaderboard, the sixth submission in an hour 429.
- Wall: a link, a spaced swear word and leetspeak each 422; a clean post 202 and stored `pending`; public only after approval; the fourth post in an hour 429.
- Polls refresh every 15 seconds in the browser, stop while the page reports hidden and refresh at once when it is visible again.

Fixed along the way: Supabase projects created after 2026-05-30 grant nothing on new tables by default, so the server's inserts would have failed with a permission error. The migration now grants `insert` on `votes`, `quiz_scores` and `fan_wall_posts` to `service_role`. A run without that line failed with 42501; with it, both the old and the new default pass.

Checked on the real Supabase project (2026-11-13), after the owner ran the migration: the anon key reads polls and is denied on `votes`, `rate_limits`, every insert and `fz_hit`; through the production build a vote, a repeat vote (409), a quiz score, a pending wall post and a rejected link post all behave as designed with the `sb_publishable_` and `sb_secret_` keys.

Not checked:
- The security advisor, and the deployed site on Vercel (CDN cache times, real client addresses for rate limits).
- The hidden-tab pause with a really hidden tab. The automated browser reports every tab as visible, so "hidden" was simulated by overriding `document.visibilityState`.
- Screen-reader output, and reduced motion with the real OS setting.

Decisions:
- `PLAN.md` carries no ticks for any phase; this file is the status record.
- The local Postgres stand-in was a throwaway and is not in the repo (it would add a dependency).

## Unverified numbers

None. Statsguru rows were parsed from the page named in their `source`. Coaching rows were read from the Wikipedia wikitext named in their `source`.
