import { getFanZoneConfig } from "@/lib/fan-zone/config";
import { fail, json } from "@/lib/fan-zone/post";
import { leaderboard } from "@/lib/fan-zone/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const cfg = getFanZoneConfig();
  if (!cfg) return fail("unavailable");
  const entries = await leaderboard(cfg);
  if (!entries) return fail("unavailable");
  return json({ entries }, 200, { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=45" });
}
