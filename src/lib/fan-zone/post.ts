import "server-only";
import { type FanZoneConfig, getFanZoneConfig } from "./config";
import { ipHash } from "./hash";
import { isProfane } from "./rules";
import { rateLimit } from "./supabase";
import moderation from "@/data/moderation.json";

// Shared plumbing for the POST route handlers. Errors are always {error: code} from this set.
export type ErrorCode =
  | "unavailable"
  | "forbidden"
  | "unsupported"
  | "too_large"
  | "invalid"
  | "stale"
  | "rate_limited"
  | "rejected"
  | "closed"
  | "not_found"
  | "already_voted";

const STATUS: Record<ErrorCode, number> = {
  unavailable: 503,
  forbidden: 403,
  unsupported: 415,
  too_large: 413,
  invalid: 400,
  stale: 409,
  rate_limited: 429,
  rejected: 422,
  closed: 409,
  not_found: 404,
  already_voted: 409,
};

const NO_STORE = { "Cache-Control": "no-store" };
const MAX_BODY = 2048;

export const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  Response.json(body, { status, headers: { ...NO_STORE, ...headers } });

export const fail = (code: ErrorCode, headers: Record<string, string> = {}) => json({ error: code }, STATUS[code], headers);

/** Reads at most MAX_BODY bytes. null when the body is bigger. */
async function readLimited(request: Request): Promise<string | null> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY) return null;
  const reader = request.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

/**
 * Steps 1 to 5 of every POST, in order: config (503), Origin (403), Content-Type (415),
 * size (413), JSON (400). Returns the config and the parsed body, or the error response.
 */
export async function guard(request: Request): Promise<{ cfg: FanZoneConfig; body: unknown } | { response: Response }> {
  const cfg = getFanZoneConfig();
  if (!cfg) return { response: fail("unavailable") };

  const origin = request.headers.get("origin");
  let originHost = "";
  try {
    originHost = origin ? new URL(origin).host : "";
  } catch {
    // A malformed Origin is treated like a missing one.
  }
  if (!originHost || originHost !== request.headers.get("host")) return { response: fail("forbidden") };

  const type = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (type !== "application/json") return { response: fail("unsupported") };

  const text = await readLimited(request);
  if (text === null) return { response: fail("too_large") };
  try {
    return { cfg, body: JSON.parse(text) };
  } catch {
    return { response: fail("invalid") };
  }
}

/** Step 7. Counts one hit; returns an error response when over the limit or when the check failed. */
export async function limit(cfg: FanZoneConfig, bucket: string, max: number, windowSeconds: number): Promise<Response | null> {
  const allowed = await rateLimit(cfg, bucket, max, windowSeconds);
  if (allowed === null) return fail("unavailable");
  if (allowed) return null;
  const retry = windowSeconds - (Math.floor(Date.now() / 1000) % windowSeconds);
  return fail("rate_limited", { "Retry-After": String(retry) });
}

export const callerHash = (cfg: FanZoneConfig, request: Request) => ipHash(cfg.hashSecret, request);

/** Honeypot field: a real visitor never sees it, so any value means a bot. */
export const filled = (website: string) => website !== "";

/** Profanity filter on the word lists in src/data/moderation.json. */
export const profane = (text: string) => isProfane(text, moderation);
