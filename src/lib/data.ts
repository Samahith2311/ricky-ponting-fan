import captaincy from "@/data/captaincy.json";
import careerSummary from "@/data/career-summary.json";
import type { FormatSummary } from "./types";

export const retrieved = careerSummary.retrieved;
export const formats: FormatSummary[] = careerSummary.formats;

const sum = (rows: FormatSummary[], key: "matches" | "runs" | "hundreds" | "fifties") =>
  rows.reduce((total, row) => total + row[key], 0);

/** Test + ODI + T20I, added up at render time from the per-format rows. */
const internationalFormats = formats.filter((f) => f.id !== "ipl");
export const international = {
  matches: sum(internationalFormats, "matches"),
  runs: sum(internationalFormats, "runs"),
  hundreds: sum(internationalFormats, "hundreds"),
  fifties: sum(internationalFormats, "fifties"),
  // Spans read "1995-2012"; the string sort works because every year has four digits.
  from: internationalFormats.map((f) => f.span!.split("-")[0]).sort()[0],
  to: internationalFormats.map((f) => f.span!.split("-")[1]).sort().at(-1),
};

/** World Cups Ponting played in that Australia won. */
export const worldCupWins = captaincy.worldCups.filter((w) => w.winner === "Australia");

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
