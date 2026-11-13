import "server-only";
import type { Poll } from "./client";
import type { FanZoneConfig } from "./config";

// Plain REST calls to Supabase's PostgREST. No client library.
//
// Headers (Supabase docs, "API keys"): the newer publishable (sb_publishable_...) and
// secret (sb_secret_...) keys are not JWTs and go on the `apikey` header only. The legacy
// anon and service_role keys are JWTs; they go on `apikey` and, so that PostgREST takes
// the role from the token, also on `Authorization: Bearer`. The prefix tells them apart.
const authHeaders = (key: string): Record<string, string> =>
  key.startsWith("sb_") ? { apikey: key } : { apikey: key, Authorization: `Bearer ${key}` };

type Role = "anon" | "service";
type Reply = { status: number; data: unknown };

/** Returns null on a network error or timeout. Logs the path and status only, never bodies. */
async function call(
  cfg: FanZoneConfig,
  role: Role,
  path: string,
  init: { method?: "GET" | "POST"; body?: unknown; prefer?: string } = {},
): Promise<Reply | null> {
  const method = init.method ?? "GET";
  try {
    const res = await fetch(`${cfg.url}/rest/v1/${path}`, {
      method,
      headers: {
        ...authHeaders(role === "anon" ? cfg.anonKey : cfg.serviceKey),
        ...(init.body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(init.prefer ? { Prefer: init.prefer } : {}),
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok && res.status !== 409) console.error(`fan-zone: ${method} ${path.split("?")[0]} -> ${res.status}`);
    return { status: res.status, data };
  } catch {
    console.error(`fan-zone: ${method} ${path.split("?")[0]} failed`);
    return null;
  }
}

const rows = (reply: Reply | null): Record<string, unknown>[] | null =>
  reply && reply.status === 200 && Array.isArray(reply.data) ? (reply.data as Record<string, unknown>[]) : null;

// ---- Polls --------------------------------------------------------------


/** Open and closed polls with their counts. RLS keeps drafts out. */
export async function listPolls(cfg: FanZoneConfig): Promise<Poll[] | null> {
  const [polls, options, counts] = await Promise.all([
    call(cfg, "anon", "polls?select=id,slug,question,status&order=id"),
    call(cfg, "anon", "poll_options?select=id,poll_id,label&order=poll_id,position"),
    call(cfg, "anon", "rpc/poll_results", { method: "POST", body: {} }),
  ]);
  const p = rows(polls);
  const o = rows(options);
  const c = counts && counts.status === 200 && Array.isArray(counts.data) ? (counts.data as Record<string, unknown>[]) : null;
  if (!p || !o || !c) return null;
  const votes = new Map(c.map((r) => [Number(r.option_id), Number(r.votes)]));
  return p.map((poll) => ({
    slug: String(poll.slug),
    question: String(poll.question),
    status: poll.status === "closed" ? "closed" : "open",
    options: o
      .filter((opt) => opt.poll_id === poll.id)
      .map((opt) => ({ id: Number(opt.id), label: String(opt.label), votes: votes.get(Number(opt.id)) ?? 0 })),
  }));
}

/** undefined: no such poll (drafts are invisible to the anon role). null: upstream failure. */
export async function findPoll(cfg: FanZoneConfig, slug: string): Promise<{ id: number; status: string } | null | undefined> {
  const found = rows(await call(cfg, "anon", `polls?select=id,status&slug=eq.${encodeURIComponent(slug)}`));
  if (!found) return null;
  return found[0] ? { id: Number(found[0].id), status: String(found[0].status) } : undefined;
}

export async function castVote(
  cfg: FanZoneConfig,
  pollId: number,
  optionId: number,
  hash: string,
): Promise<"ok" | "already_voted" | "invalid" | null> {
  const reply = await call(cfg, "service", "votes", {
    method: "POST",
    body: { poll_id: pollId, option_id: optionId, voter_hash: hash },
    prefer: "return=minimal",
  });
  if (!reply) return null;
  if (reply.status === 201) return "ok";
  const code = (reply.data as { code?: string } | null)?.code;
  if (code === "23505") return "already_voted";
  if (code === "23503") return "invalid";
  return null;
}

// ---- Rate limit ---------------------------------------------------------

/** true: allowed. false: over the limit. null: could not tell (treated as unavailable). */
export async function rateLimit(cfg: FanZoneConfig, bucket: string, limit: number, windowSeconds: number): Promise<boolean | null> {
  const reply = await call(cfg, "service", "rpc/fz_hit", {
    method: "POST",
    body: { p_bucket: bucket, p_limit: limit, p_window_s: windowSeconds },
  });
  return reply && reply.status === 200 && typeof reply.data === "boolean" ? reply.data : null;
}

// ---- Quiz scores --------------------------------------------------------

export type Score = { nickname: string; score: number };

export async function insertScore(cfg: FanZoneConfig, nickname: string, score: number, total: number, version: string) {
  const reply = await call(cfg, "service", "quiz_scores", {
    method: "POST",
    body: { nickname, score, total, quiz_version: version },
    prefer: "return=minimal",
  });
  return reply?.status === 201;
}

/** Best first, earliest first on a tie, one row per nickname (case-insensitive), top ten. */
export async function leaderboard(cfg: FanZoneConfig): Promise<Score[] | null> {
  const found = rows(await call(cfg, "anon", "quiz_scores?select=nickname,score&order=score.desc,created_at.asc&limit=100"));
  if (!found) return null;
  const seen = new Set<string>();
  const top: Score[] = [];
  for (const r of found) {
    const key = String(r.nickname).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    top.push({ nickname: String(r.nickname), score: Number(r.score) });
    if (top.length === 10) break;
  }
  return top;
}

// ---- Fan wall -----------------------------------------------------------

export type Post = { nickname: string; body: string; created_at: string };

export async function insertPost(cfg: FanZoneConfig, nickname: string, body: string) {
  const reply = await call(cfg, "service", "fan_wall_posts", {
    method: "POST",
    body: { nickname, body, status: "pending" },
    prefer: "return=minimal",
  });
  return reply?.status === 201;
}

export async function approvedPosts(cfg: FanZoneConfig): Promise<Post[] | null> {
  const found = rows(
    await call(cfg, "anon", "fan_wall_posts?select=nickname,body,created_at&status=eq.approved&order=created_at.desc&limit=30"),
  );
  return found && found.map((r) => ({ nickname: String(r.nickname), body: String(r.body), created_at: String(r.created_at) }));
}
