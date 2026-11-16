import type { LabelledRow } from "@/components/batting-table";
import { captaincyData, formatData, formats } from "@/lib/data";
import { site } from "@/lib/site";
import type { BattingRow, CaptaincyRecord } from "@/lib/types";

// The question pages under /stats. Every sentence is built from the data files at render time.

const copy = site.pages.stats;
// The IPL is left out: its "opponents" are franchises, not countries.
const INTERNATIONAL = ["test", "odi", "t20i"];
const surname = site.subject.split(" ").at(-1)!;

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const fill = (template: string, values: Record<string, string>) => template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
const whole = (n: number) => n.toLocaleString("en-AU");
const plural = (n: number, one: string, many = `${one}s`) => `${whole(n)} ${n === 1 ? one : many}`;
// "2004-2004" reads as one year; anything else as a range.
const span = (s?: string) => {
  if (!s) return "";
  const [from, to] = s.split("-");
  return from === to ? ` (${from})` : ` (${from}–${to})`;
};
export const formatLabel = (id: string) => formats.find((f) => f.id === id)?.label ?? id;

type Base = {
  slug: string;
  heading: string;
  question: string;
  /** One sentence per format, then any totals. Also the answer in the FAQ markup. */
  answers: string[];
  sources: { label: string; url: string }[];
  retrieved: string;
  verified: boolean;
};
export type StatPage =
  | (Base & { kind: "opponent"; opponent: string; rows: LabelledRow[]; matches: number })
  | (Base & { kind: "captain"; records: CaptaincyRecord[] });

function battingSentence(r: BattingRow, format: string, opponent: string) {
  const where = `${plural(r.matches, format)} against ${opponent}${span(r.span)}`;
  if (r.innings === 0) return `${site.subject} played ${where} and did not bat.`;
  const average = r.average === null ? "without being dismissed" : `at an average of ${r.average.toFixed(2)}`;
  const scores =
    r.hundreds || r.fifties
      ? `with ${plural(r.hundreds, "hundred")} and ${plural(r.fifties, "fifty", "fifties")}`
      : "and did not reach fifty";
  const best = r.highestScore ? ` His highest score was ${r.highestScore}.` : "";
  return `In ${where}, ${site.subject} scored ${plural(r.runs, "run")} ${average}, ${scores}.${best}`;
}

function opponentPages(): StatPage[] {
  const names = [...new Set(INTERNATIONAL.flatMap((f) => formatData[f].byOpponent.map((o) => o.opponent)))];
  return names
    .map((opponent): StatPage => {
      const played = INTERNATIONAL.flatMap((f) => {
        const row = formatData[f].byOpponent.find((o) => o.opponent === opponent);
        return row ? [{ format: f, row }] : [];
      });
      const total = (key: "matches" | "runs" | "hundreds") => played.reduce((sum, p) => sum + p.row[key], 0);
      const answers = played.map((p) => battingSentence(p.row, formatLabel(p.format), opponent));
      if (played.length > 1) {
        answers.push(
          `Across ${played.length} formats that is ${plural(total("runs"), "run")} and ${plural(total("hundreds"), "hundred")} in ${plural(total("matches"), "match", "matches")} against ${opponent}.`,
        );
      }
      const values = { subject: site.subject, surname, opponent };
      return {
        kind: "opponent",
        slug: `${slugify(surname)}-vs-${slugify(opponent)}`,
        opponent,
        heading: fill(copy.opponentHeading, values),
        question: fill(copy.opponentQuestion, values),
        answers,
        rows: played.map((p) => ({ ...p.row, label: formatLabel(p.format) })),
        matches: total("matches"),
        sources: played.map((p) => ({ label: formatLabel(p.format), url: p.row.source })),
        // ISO dates sort as text; the latest covers every format on the page.
        retrieved: played.map((p) => formatData[p.format].retrieved).sort().at(-1)!,
        verified: played.every((p) => p.row.verified),
      };
    })
    .sort((a, b) => (a.kind === "opponent" && b.kind === "opponent" ? b.matches - a.matches : 0));
}

function resultsSentence(r: CaptaincyRecord, matches: string) {
  const rest = [
    r.drawn ? `${whole(r.drawn)} drawn` : "",
    r.tied ? `${whole(r.tied)} tied` : "",
    r.noResult ? `${whole(r.noResult)} with no result` : "",
  ].filter(Boolean);
  const rate = r.matches === 0 ? "" : `, a win rate of ${((r.won / r.matches) * 100).toFixed(1)}%`;
  return `${site.subject} captained ${site.country} in ${matches}${span(r.span)}: ${[`${whole(r.won)} won`, `${whole(r.lost)} lost`, ...rest].join(", ")}${rate}.`;
}

function captainPage(): StatPage {
  const { record, worldCupRecord, retrieved } = captaincyData;
  const values = { subject: site.subject, surname, country: site.country };
  return {
    kind: "captain",
    slug: `${slugify(surname)}-captain-record`,
    heading: fill(copy.captainHeading, values),
    question: fill(copy.captainQuestion, values),
    answers: [
      ...record.map((r) => resultsSentence(r, plural(r.matches, formatLabel(r.format)))),
      resultsSentence(worldCupRecord, plural(worldCupRecord.matches, "World Cup match", "World Cup matches")),
    ],
    records: record,
    sources: [...record.map((r) => ({ label: formatLabel(r.format), url: r.source })), { label: "World Cups", url: worldCupRecord.source }],
    retrieved,
    verified: [...record, worldCupRecord].every((r) => r.verified),
  };
}

/** The captaincy question first, then one page per international opponent, most matches first. */
export const statPages: StatPage[] = [captainPage(), ...opponentPages()];

// Two opponents whose names slug the same would share a URL; fail the build instead.
if (new Set(statPages.map((p) => p.slug)).size !== statPages.length) throw new Error("stats-pages: duplicate slug");

export const findStatPage = (slug: string) => statPages.find((p) => p.slug === slug);
