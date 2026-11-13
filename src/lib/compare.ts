import compareJson from "@/data/compare.json";
import { formats } from "@/lib/data";
import type { BattingRow } from "@/lib/types";

export type ComparePlayer = {
  id: string;
  name: string;
  /** One row per format he played; a format with no row was never played. */
  formats: (BattingRow & { format: string })[];
};

export const comparePlayers: ComparePlayer[] = compareJson.players;
export const compareRetrieved = compareJson.retrieved;

/** Test, ODI and T20I: the formats compare.json covers. Labels come from career-summary.json. */
export const compareFormats = formats
  .filter((f) => comparePlayers.some((p) => p.formats.some((r) => r.format === f.id)))
  .map((f) => ({ id: f.id, label: f.label }));

export const MEASURES = [
  { key: "matches", label: "Matches", decimals: 0 },
  { key: "runs", label: "Runs", decimals: 0 },
  { key: "average", label: "Average", decimals: 2 },
  { key: "strikeRate", label: "Strike rate", decimals: 2 },
  { key: "hundreds", label: "Hundreds", decimals: 0 },
  { key: "fifties", label: "Fifties", decimals: 0 },
] as const;

type Measure = (typeof MEASURES)[number];

export const formatValue = (value: number, m: Measure) =>
  value.toLocaleString("en-AU", { minimumFractionDigits: m.decimals, maximumFractionDigits: m.decimals });

/** First value of a query param, lower-cased ("" when missing). */
const param = (v: string | string[] | undefined) => ((Array.isArray(v) ? v[0] : v) ?? "").toLowerCase();

/**
 * Reads ?a=&b=&format=. A bad player falls back to the first default that is not the other player,
 * so one good value in the URL is kept. Both players the same counts as a bad B.
 */
export function readSelection(params: Record<string, string | string[] | undefined>) {
  const ids = comparePlayers.map((p) => p.id);
  const requestedA = param(params.a);
  const requestedB = param(params.b);
  const a = ids.includes(requestedA) ? requestedA : ids.find((id) => id !== requestedB)!;
  const b = ids.includes(requestedB) && requestedB !== a ? requestedB : ids.find((id) => id !== a)!;
  const requestedFormat = param(params.format);
  const format = compareFormats.some((f) => f.id === requestedFormat) ? requestedFormat : compareFormats[0].id;
  return { a, b, format };
}

export const rowFor = (player: ComparePlayer, format: string) => player.formats.find((r) => r.format === format);

export const list = (items: string[]) => new Intl.ListFormat("en-AU").format(items);
const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Who is higher on which measure, built from the two rows. Measures without a figure for both are named and left out. */
export function summaryFor(a: ComparePlayer, ra: BattingRow, b: ComparePlayer, rb: BattingRow) {
  const higherA: string[] = [];
  const higherB: string[] = [];
  const level: string[] = [];
  const missing: string[] = [];
  for (const m of MEASURES) {
    const va = ra[m.key];
    const vb = rb[m.key];
    const name = m.label.toLowerCase();
    if (va === null || vb === null) {
      missing.push(`${name} is not recorded for ${va === null ? a.name : b.name}`);
    } else if (va > vb) higherA.push(name);
    else if (vb > va) higherB.push(name);
    else level.push(name);
  }
  const sentences = [
    higherA.length && `${a.name} is higher on ${list(higherA)}.`,
    higherB.length && `${b.name} is higher on ${list(higherB)}.`,
    level.length && `Level on ${list(level)}.`,
    missing.length && `${capitalise(list(missing))}, so ${missing.length === 1 ? "it is" : "they are"} left out.`,
  ].filter(Boolean) as string[];
  return sentences.join(" ");
}

/** One radar axis: both values scaled so the higher of the pair is 100, plus the real values for the tooltip. */
export type RadarAxis = { measure: string; a: number; b: number; realA: string; realB: string };

export function radarAxes(ra: BattingRow, rb: BattingRow): RadarAxis[] {
  const axes: RadarAxis[] = [];
  for (const m of MEASURES) {
    const va = ra[m.key];
    const vb = rb[m.key];
    if (va === null || vb === null) continue;
    const top = Math.max(va, vb) || 1;
    axes.push({ measure: m.label, a: (va / top) * 100, b: (vb / top) * 100, realA: formatValue(va, m), realB: formatValue(vb, m) });
  }
  return axes;
}
