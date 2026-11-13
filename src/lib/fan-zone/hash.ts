import "server-only";
import { createHmac } from "node:crypto";

const hmac = (secret: string, data: string) => createHmac("sha256", secret).update(data).digest("hex");

/** What the database stores for a browser: never the cookie value itself. */
export const voterHash = (secret: string, vid: string) => hmac(secret, `vid:${vid}`);

/** First 64 bits of an IPv6 address, or the IPv4 address as is. "" when unreadable. */
function ipKey(raw: string): string {
  const ip = raw.trim().toLowerCase();
  const mapped = ip.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (mapped) return mapped[1];
  if (!ip.includes(":")) return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(ip) ? ip : "";
  const [head, tail = ""] = ip.split("::");
  const front = head ? head.split(":") : [];
  const back = tail ? tail.split(":") : [];
  const groups = ip.includes("::") ? [...front, ...Array(Math.max(0, 8 - front.length - back.length)).fill("0"), ...back] : front;
  if (groups.length !== 8 || !groups.every((g) => /^[0-9a-f]{1,4}$/.test(g))) return "";
  return groups.slice(0, 4).map((g) => g.padStart(4, "0")).join(":");
}

/**
 * Hash of the caller's network address for rate limits. The raw address is
 * never stored or logged. The UTC date is part of the input, so the hash
 * changes every day. Vercel overwrites x-forwarded-for with the real client.
 */
export function ipHash(secret: string, request: Request): string {
  const first = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "";
  const key = ipKey(first) || "unknown";
  return hmac(secret, `ip:${new Date().toISOString().slice(0, 10)}:${key}`);
}
