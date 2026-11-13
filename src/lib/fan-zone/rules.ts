// Pure rules for the Fan Zone: request validation and the content filters.
// No imports and no secrets, so the browser form, the route handlers and the
// Node self-check (scripts/fan-zone.test.mjs) can all use the same code.

export type Lists = { words: string[]; squashed: string[] };

export const NICKNAME = /^[A-Za-z0-9][A-Za-z0-9 _.-]{1,19}$/;
export const MESSAGE_MIN = 3;
export const MESSAGE_MAX = 280;
const SLUG = /^[a-z0-9-]{1,60}$/;

// ---- Profanity ----------------------------------------------------------

const LOOKALIKE: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", $: "s" };
const collapse = (s: string) => s.replace(/([a-z])\1+/g, "$1");

/** Lower-case, strip accents, map look-alike characters (0o 1i 3e 4a 5s 7t @a $s). */
function fold(text: string) {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[013457@$]/g, (c) => LOOKALIKE[c]);
}

/**
 * Two passes over the folded text: whole words, and the text squashed to letters
 * only (catches "f u c k" and "f.u.c.k"). Each pass also runs with repeated
 * letters collapsed ("fuuuck"). Collapsing turns "ass" into "as", so short
 * entries are matched only against the uncollapsed text.
 */
export function isProfane(text: string, lists: Lists): boolean {
  const folded = fold(text);
  const tokens = folded.split(/[^a-z]+/).filter(Boolean);
  const squashed = folded.replace(/[^a-z]/g, "");

  if (tokens.some((t) => lists.words.includes(t))) return true;
  if (lists.squashed.some((w) => squashed.includes(w))) return true;

  const long = (w: string) => collapse(w).length >= 4;
  const collapsedTokens = tokens.map(collapse);
  if (lists.words.filter(long).some((w) => collapsedTokens.includes(collapse(w)))) return true;
  const collapsedSquashed = collapse(squashed);
  return lists.squashed.filter(long).some((w) => collapsedSquashed.includes(collapse(w)));
}

// ---- Fan wall content ---------------------------------------------------

const CONTROL = /[\p{Cc}​-‏‪-‮⁠﻿]/u;

/** True when the message breaks a spam rule. Which rule is never reported. */
export function wallSpam(message: string): boolean {
  const lower = message.toLowerCase();
  if (CONTROL.test(message.replace(/\n/g, ""))) return true;
  if (/[<>@]/.test(message) || message.includes("](")) return true;
  if (/https?:\/\//.test(lower) || lower.includes("www.")) return true;
  if (/\b[a-z0-9-]+\.[a-z]{2,}\b/.test(lower)) return true;
  if (/([\s\S])\1{6,}/u.test(message)) return true;
  const letters = message.replace(/[^\p{L}]/gu, "");
  if (letters.length > 0 && letters.replace(/[^\p{Lu}]/gu, "").length / letters.length > 0.7) return true;
  return false;
}

// ---- Request bodies -----------------------------------------------------

export type Parsed<T> = { ok: true; value: T } | { ok: false; error: "invalid" | "stale" };
const bad = { ok: false, error: "invalid" } as const;

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const hasExactly = (o: Record<string, unknown>, keys: string[]) => {
  const own = Object.keys(o);
  return own.length === keys.length && keys.every((k) => own.includes(k));
};

export function parseVote(body: unknown): Parsed<{ pollSlug: string; optionId: number }> {
  if (!isObject(body) || !hasExactly(body, ["pollSlug", "optionId"])) return bad;
  const { pollSlug, optionId } = body;
  if (typeof pollSlug !== "string" || !SLUG.test(pollSlug)) return bad;
  if (typeof optionId !== "number" || !Number.isSafeInteger(optionId) || optionId < 1) return bad;
  return { ok: true, value: { pollSlug, optionId } };
}

export type QuizShape = { version: string; optionCounts: number[] };

export function parseQuiz(
  body: unknown,
  quiz: QuizShape,
): Parsed<{ nickname: string; answers: number[]; website: string }> {
  if (!isObject(body) || !hasExactly(body, ["nickname", "version", "answers", "website"])) return bad;
  const { nickname, version, answers, website } = body;
  if (typeof nickname !== "string" || typeof version !== "string" || typeof website !== "string") return bad;
  if (!Array.isArray(answers) || answers.length !== quiz.optionCounts.length) return bad;
  const ok = answers.every((a, i) => typeof a === "number" && Number.isInteger(a) && a >= 0 && a < quiz.optionCounts[i]);
  if (!ok) return bad;
  const name = nickname.trim();
  if (!NICKNAME.test(name)) return bad;
  if (version !== quiz.version) return { ok: false, error: "stale" };
  return { ok: true, value: { nickname: name, answers: answers as number[], website } };
}

export function parseWall(body: unknown): Parsed<{ nickname: string; message: string; website: string }> {
  if (!isObject(body) || !hasExactly(body, ["nickname", "message", "website"])) return bad;
  const { nickname, message, website } = body;
  if (typeof nickname !== "string" || typeof message !== "string" || typeof website !== "string") return bad;
  const name = nickname.trim();
  const text = message.replace(/\r\n?/g, "\n").trim();
  if (!NICKNAME.test(name)) return bad;
  if ([...text].length < MESSAGE_MIN || [...text].length > MESSAGE_MAX) return bad;
  if (text.split("\n").length > 4) return bad;
  return { ok: true, value: { nickname: name, message: text, website } };
}
