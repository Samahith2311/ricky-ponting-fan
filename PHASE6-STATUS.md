# Phase 6 (Fan Zone) status

Written after the Phase 6 build, updated 2026-11-13 after the local database checks. Phase 6 is committed (not pushed) and `PROGRESS.md` is up to date. What is left needs the site owner and a real Supabase project.

## Done

### Code and data
- `supabase/migrations/0001_fan_zone.sql`: six tables, row level security on all of them, grants, `fz_hit` and `poll_results` functions, three seeded open polls (opinion only).
- `src/lib/fan-zone/`: `rules.ts` (validation and filters, pure), `config.ts`, `hash.ts`, `supabase.ts` (plain `fetch` REST calls), `post.ts` (shared POST steps), `quiz.ts`, `client.ts`.
- Route handlers in `src/app/api/fan-zone/`: `polls`, `polls/vote`, `quiz`, `leaderboard`, `wall`.
- `/fan-zone` page with polls, quiz, leaderboard, fan wall with post form, and a privacy note. Copy is in `src/data/site.json` under `pages.fanZone`.
- `src/data/quiz.json`: ten questions. Every answer was copied from an existing data row, with its source.
- `src/data/moderation.json`: word lists for the profanity filter.
- `.env.example` now lists the four server-only names. The `NEXT_PUBLIC_SUPABASE_*` entries are gone.
- Self-check: `npm run test:fan-zone` (7 tests).
- New dependency: `server-only` only.

### Checks that passed (no Supabase variables set)
- Self-check 7 of 7, `tsc`, `npm run lint`, `npm run check:data` (16 files, 0 unverified), `npm run build`.
- Design checks 1 to 4: the site builds and `/fan-zone` shows "Not connected"; POSTs return 503; no `dangerouslySetInnerHTML`; `quiz.json` has 10 questions and passes `check:data`; no fake key or variable name in the built client files; wrong Origin 403, `text/plain` 415, 3 KB body 413.
- Browser (production build): quiz played through by keyboard to a score; validation messages on both forms; honeypot hidden from assistive tech and the Tab key; light and dark themes; no horizontal scroll at 360, 768 and 1280.
- Poll voting, quiz submit and wall post were exercised against a throwaway local mock of Supabase REST, not a real database.

### Checks that passed against a local Postgres (2026-11-13)
Not a Supabase project: PGlite (Postgres in Node) ran the real migration with the `anon`, `authenticated` and `service_role` roles created by hand, behind a throwaway stand-in for the Supabase REST calls. The production build ran against it.
- The migration runs clean, with the old default grants and with none (projects created after 2026-05-30).
- No table without row level security.
- `anon` and `authenticated`: `votes` and `rate_limits` denied; every insert, update and delete denied; `fz_hit` denied. `anon` sees no draft poll, no option of a draft poll, and only approved wall posts. `authenticated` can read nothing.
- Votes: second vote from the same cookie 409; cleared cookie capped at 5 per poll per day per IP, then 429; 11th vote in 10 minutes 429 with `Retry-After`; option from another poll 400; closed poll 409; draft poll 404; only 64-character hashes stored.
- Quiz: extra `score` key 400, 9 answers 400, wrong version 409, profane nickname 422, valid score on the leaderboard (one row per nickname), honeypot stores nothing, 6th submission in an hour 429.
- Wall: link, spaced swear word and leetspeak each 422; clean post 202 and stored `pending`; not public until approved, then on the API and the page; 4th post in an hour 429.
- Browser: polls refresh every 15 seconds; none while the page reports hidden (simulated, see below); one at once when visible again.

Fix made: the migration now has `grant insert on votes, quiz_scores, fan_wall_posts to service_role`. New Supabase projects grant nothing on new tables by default, and without this line every write failed with 42501.

## Not done / not tested

### Needs the site owner
1. Create a Supabase project.
2. Run `supabase/migrations/0001_fan_zone.sql` (SQL editor or CLI).
3. In the dashboard: Authentication, turn off sign-ups. Confirm the Data API exposes the `public` schema. The migration writes its own grants, so "Automatically expose new tables" can stay off.
4. Create `.env.local` from `.env.example` with `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `FAN_ZONE_HASH_SECRET` (32 or more random characters). Never commit it.
5. Set the same four names in Vercel (Production, and Preview if wanted). Consider a separate Supabase project for previews.
6. Approve fan wall posts by setting `status` to `approved` in the Table Editor. There is no admin page.
7. `git push` when ready.

### Checked on the real Supabase project (2026-11-13)
The migration is applied and `.env.local` holds the four values (`sb_publishable_` and `sb_secret_` keys).
- With the anon key directly against the REST API: 3 polls, 13 options and `poll_results` readable; `votes` and `rate_limits` denied; inserts into `votes`, `quiz_scores` and `fan_wall_posts` denied; `rpc/fz_hit` denied.
- Through the production build: `/fan-zone` shows the seeded polls; a vote counts and sets the cookie; a second vote with that cookie gives 409; a quiz score lands on the leaderboard; a wall post gives 202, is stored `pending` and is not public; a post with a link gives 422.
- Those checks left test rows: one vote, one score and one pending post under the nickname "Setup check". Delete them in the SQL editor before launch.

### Still to do on the real project
- Security advisor clean (Dashboard, Advisors).
- Set the four values in Vercel, then on the deployed site: an approved wall post appears within 30 seconds (CDN cache), and rate limits see the real client address.

### Not seen in the browser
- The pause with a really hidden tab. The automated browser reports background tabs as visible, so `document.visibilityState` was overridden to "hidden" for the check.
- Screen-reader output, and reduced motion with the real OS setting.

### Project housekeeping
- `CLAUDE.md` shows as modified in `git status` (the Commands and Layout sections are removed, two convention lines added). It was not part of the Phase 6 work and is left out of the Phase 6 commit. Commit or restore it yourself.
- `PLAN.md` has no ticks for any phase, so none were added; `PROGRESS.md` is the status record.

## Known behaviour and limits
- Short all-caps posts such as "GO AUS" are rejected (caps rule applied as designed).
- Short filter words such as "ass" are matched as whole words only, so a spaced-out "a s s" gets through. "Scunthorpe" is rejected.
- Rejected posts still count toward the 3-per-hour limit (limits run before the filters, by design).
- Poll results are entertainment: someone rotating IPs and clearing cookies can stuff a poll within the caps.
- Leaderboard ranking means who scored first, because the answers are public facts.
- Nicknames are first come and can be impersonated; the owner deletes rows in the dashboard.
- Free Supabase projects pause when idle; the routes return 503 until it wakes.

## Deviations from the design
- Quiz rate limit runs before the profanity check (same reasoning as the wall).
- `rules.ts` and `quiz.ts` do not import `server-only` (no secrets in them; the browser forms and the self-check use them).
- `Secure` on the `fz_vid` cookie is set only in production, so it works on http localhost.
- A missing Origin header is treated as 403.
