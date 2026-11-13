import "server-only";

export type FanZoneConfig = {
  url: string;
  anonKey: string;
  serviceKey: string;
  hashSecret: string;
};

/**
 * Read at request time, never at import, so a build without keys still works.
 * Returns null when anything is missing. It never throws.
 */
export function getFanZoneConfig(): FanZoneConfig | null {
  const url = process.env.SUPABASE_URL?.trim();
  const anonKey = process.env.SUPABASE_ANON_KEY?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const hashSecret = process.env.FAN_ZONE_HASH_SECRET?.trim();
  if (!url || !anonKey || !serviceKey || !hashSecret || hashSecret.length < 32) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return { url: parsed.origin, anonKey, serviceKey, hashSecret };
  } catch {
    return null;
  }
}
