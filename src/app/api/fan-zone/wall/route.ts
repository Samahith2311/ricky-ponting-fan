import { getFanZoneConfig } from "@/lib/fan-zone/config";
import { callerHash, fail, filled, guard, json, limit, profane } from "@/lib/fan-zone/post";
import { parseWall, wallSpam } from "@/lib/fan-zone/rules";
import { approvedPosts, insertPost } from "@/lib/fan-zone/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const cfg = getFanZoneConfig();
  if (!cfg) return fail("unavailable");
  const posts = await approvedPosts(cfg);
  if (!posts) return fail("unavailable");
  return json({ posts }, 200, { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" });
}

export async function POST(request: Request) {
  const g = await guard(request);
  if ("response" in g) return g.response;
  const { cfg } = g;

  const parsed = parseWall(g.body);
  if (!parsed.ok) return fail("invalid");
  const { nickname, message, website } = parsed.value;

  // A bot that fills the hidden field is told it worked and nothing is stored.
  if (filled(website)) return json({ status: "pending" }, 202);

  // Limits come before the content filters, so the filters cannot be probed quickly.
  const over = (await limit(cfg, `wall:${callerHash(cfg, request)}`, 3, 3600)) ?? (await limit(cfg, "wall:all", 50, 3600));
  if (over) return over;

  if (wallSpam(message) || profane(message) || profane(nickname)) return fail("rejected");
  if (!(await insertPost(cfg, nickname, message))) return fail("unavailable");
  return json({ status: "pending" }, 202);
}
