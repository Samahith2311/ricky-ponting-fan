// Safe for the browser: types shared with the server, and the one fetch helper the forms use.
import { site } from "@/lib/site";

export type PollOption = { id: number; label: string; votes: number };
export type Poll = { slug: string; question: string; status: "open" | "closed"; options: PollOption[] };

const errors: Record<string, string> = site.pages.fanZone.errors;

export type PostResult = { ok: true; data: Record<string, unknown> } | { ok: false; code: string; message: string };

/** POSTs JSON to a Fan Zone route and turns any failure into one sentence of page copy. */
export async function postJson(path: string, body: unknown): Promise<PostResult> {
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, data };
    const code = typeof data?.error === "string" && data.error in errors ? data.error : "unavailable";
    return { ok: false, code, message: errors[code] };
  } catch {
    return { ok: false, code: "network", message: errors.network };
  }
}
