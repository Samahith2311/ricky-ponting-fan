import { getFanZoneConfig } from "@/lib/fan-zone/config";
import { fail, json } from "@/lib/fan-zone/post";
import { listPolls } from "@/lib/fan-zone/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const cfg = getFanZoneConfig();
  if (!cfg) return fail("unavailable");
  const polls = await listPolls(cfg);
  if (!polls) return fail("unavailable");
  return json({ polls }, 200, { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=25" });
}
