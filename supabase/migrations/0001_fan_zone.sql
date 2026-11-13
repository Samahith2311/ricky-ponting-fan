-- Fan Zone: polls, votes, quiz scores, fan wall, rate limits.
-- Every table has row level security on. The browser never talks to Supabase:
-- the Next.js server reads with the anon key (RLS applies) and writes with the
-- service role key (bypasses RLS). votes and rate_limits have no policy, so the
-- anon and authenticated roles can read and write nothing there.

create table polls (
  id bigint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9-]{1,60}$'),
  question text not null check (char_length(question) between 5 and 200),
  status text not null default 'draft' check (status in ('draft', 'open', 'closed')),
  created_at timestamptz not null default now()
);

create table poll_options (
  id bigint generated always as identity primary key,
  poll_id bigint not null references polls (id) on delete cascade,
  label text not null check (char_length(label) between 1 and 100),
  position smallint not null,
  unique (poll_id, position),
  unique (poll_id, id)
);

-- One vote per poll per voter_hash, enforced here. voter_hash is an HMAC of the
-- browser cookie; no IP data is stored on this table.
create table votes (
  id bigint generated always as identity primary key,
  poll_id bigint not null,
  option_id bigint not null,
  voter_hash text not null check (char_length(voter_hash) = 64),
  created_at timestamptz not null default now(),
  foreign key (poll_id, option_id) references poll_options (poll_id, id) on delete cascade,
  unique (poll_id, voter_hash)
);

create table quiz_scores (
  id bigint generated always as identity primary key,
  nickname text not null check (nickname ~ '^[A-Za-z0-9][A-Za-z0-9 _.-]{1,19}$'),
  score smallint not null check (score between 0 and 10),
  total smallint not null check (total = 10),
  quiz_version text not null check (char_length(quiz_version) <= 20),
  created_at timestamptz not null default now()
);
create index quiz_scores_board on quiz_scores (score desc, created_at);

-- New posts are 'pending'. Approve one in the Table Editor by setting status to 'approved'.
create table fan_wall_posts (
  id bigint generated always as identity primary key,
  nickname text not null check (nickname ~ '^[A-Za-z0-9][A-Za-z0-9 _.-]{1,19}$'),
  body text not null check (char_length(body) between 3 and 280),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);
create index fan_wall_approved on fan_wall_posts (created_at desc) where status = 'approved';

-- Fixed-window counters. bucket holds hashes only, never a raw IP.
create table rate_limits (
  bucket text not null check (char_length(bucket) <= 120),
  window_start timestamptz not null,
  hits int not null default 1,
  primary key (bucket, window_start)
);
create index rate_limits_age on rate_limits (window_start);

-- Counts one hit in the current window; true while the bucket is within its limit.
-- Rows older than 2 days are deleted on every call.
create function fz_hit(p_bucket text, p_limit int, p_window_s int)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  w timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_s) * p_window_s);
  c int;
begin
  insert into public.rate_limits as r (bucket, window_start)
  values (p_bucket, w)
  on conflict (bucket, window_start) do update set hits = r.hits + 1
  returning r.hits into c;
  delete from public.rate_limits where window_start < now() - interval '2 days';
  return c <= p_limit;
end
$$;

-- Vote counts per option for open and closed polls. The anon role cannot read votes, so it goes through here.
create function poll_results()
returns table (poll_id bigint, option_id bigint, votes bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select o.poll_id, o.id, count(v.id)
  from public.poll_options o
  join public.polls p on p.id = o.poll_id and p.status in ('open', 'closed')
  left join public.votes v on v.poll_id = o.poll_id and v.option_id = o.id
  group by o.poll_id, o.id
$$;

-- Row level security -------------------------------------------------------
alter table polls enable row level security;
alter table poll_options enable row level security;
alter table votes enable row level security;
alter table quiz_scores enable row level security;
alter table fan_wall_posts enable row level security;
alter table rate_limits enable row level security;

revoke all on polls, poll_options, votes, quiz_scores, fan_wall_posts, rate_limits from anon, authenticated;
grant select on polls, poll_options, quiz_scores to anon;
grant select (id, nickname, body, status, created_at) on fan_wall_posts to anon;
-- Supabase projects created after 2026-05-30 grant nothing on new tables by default, so the server's writes are granted here.
grant insert on votes, quiz_scores, fan_wall_posts to service_role;

create policy anon_read_polls on polls for select to anon
  using (status in ('open', 'closed'));
create policy anon_read_options on poll_options for select to anon
  using (exists (select 1 from polls p where p.id = poll_id and p.status in ('open', 'closed')));
create policy anon_read_scores on quiz_scores for select to anon
  using (true);
create policy anon_read_wall on fan_wall_posts for select to anon
  using (status = 'approved');

-- Supabase grants execute on new functions to anon and authenticated by default, hence the explicit revokes.
revoke execute on function fz_hit(text, int, int) from public, anon, authenticated;
grant execute on function fz_hit(text, int, int) to service_role;
revoke execute on function poll_results() from public, authenticated;
grant execute on function poll_results() to anon, service_role;

-- Seed polls: opinion only, no statistics. Open from the start. -----------------
with new_polls as (
  insert into polls (slug, question, status) values
    ('favourite-moment', 'Which Ponting moment do you love most?', 'open'),
    ('best-shot', 'What was his best shot?', 'open'),
    ('batting-for-your-life', 'Who would you pick to bat for your life?', 'open')
  returning id, slug
)
insert into poll_options (poll_id, label, position)
select p.id, o.label, o.position
from new_polls p
join (values
  ('favourite-moment', 'Lifting the World Cup as captain', 1),
  ('favourite-moment', 'Winning the Ashes back', 2),
  ('favourite-moment', 'A pull shot racing to the boundary', 3),
  ('favourite-moment', 'A direct-hit run out', 4),
  ('best-shot', 'The pull', 1),
  ('best-shot', 'The cover drive', 2),
  ('best-shot', 'The flick off the pads', 3),
  ('best-shot', 'The straight drive', 4),
  ('batting-for-your-life', 'Ricky Ponting', 1),
  ('batting-for-your-life', 'Sachin Tendulkar', 2),
  ('batting-for-your-life', 'Brian Lara', 3),
  ('batting-for-your-life', 'Jacques Kallis', 4),
  ('batting-for-your-life', 'Virat Kohli', 5)
) as o (slug, label, position) on o.slug = p.slug;
