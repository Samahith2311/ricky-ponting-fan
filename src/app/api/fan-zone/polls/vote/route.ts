import { randomUUID } from "node:crypto";
import { voterHash } from "@/lib/fan-zone/hash";
import { callerHash, fail, guard, json, limit } from "@/lib/fan-zone/post";
import { parseVote } from "@/lib/fan-zone/rules";
import { castVote, findPoll, listPolls } from "@/lib/fan-zone/supabase";

export const dynamic = "force-dynamic";

const YEAR = 31536000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export async function POST(request: Request) {
  const g = await guard(request);
  if ("response" in g) return g.response;
  const { cfg } = g;

  const parsed = parseVote(g.body);
  if (!parsed.ok) return fail("invalid");
  const { pollSlug, optionId } = parsed.value;

  const iph = callerHash(cfg, request);
  const overAll = await limit(cfg, `vote:${iph}`, 10, 600);
  if (overAll) return overAll;

  const poll = await findPoll(cfg, pollSlug);
  if (poll === null) return fail("unavailable");
  if (poll === undefined) return fail("not_found");
  if (poll.status !== "open") return fail("closed");

  const overPoll = await limit(cfg, `vote:${poll.id}:${iph}`, 5, 86400);
  if (overPoll) return overPoll;

  // The browser id. Only its HMAC reaches the database.
  const existing = request.headers.get("cookie")?.match(/(?:^|;\s*)fz_vid=([^;]+)/)?.[1];
  const vid = existing && UUID.test(existing) ? existing : randomUUID();

  const outcome = await castVote(cfg, poll.id, optionId, voterHash(cfg.hashSecret, vid));
  if (outcome === null) return fail("unavailable");
  if (outcome === "already_voted") return fail("already_voted");
  if (outcome === "invalid") return fail("invalid");

  const polls = await listPolls(cfg);
  const results = polls?.find((p) => p.slug === pollSlug)?.options ?? [];
  const response = json({ voted: optionId, results });
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.headers.append("Set-Cookie", `fz_vid=${vid}; Path=/api/fan-zone; Max-Age=${YEAR}; HttpOnly; SameSite=Lax${secure}`);
  return response;
}
