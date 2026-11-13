import { ResultsBar } from "@/components/results-bar";
import { UnverifiedMark, UnverifiedNote } from "@/components/unverified-mark";
import { site } from "@/lib/site";
import type { Tournament } from "@/lib/types";
import { fixed } from "@/lib/utils";

const cell = "px-3 py-2";
const num = `${cell} text-right`;
const whole = (n: number) => n.toLocaleString("en-AU");
export const isVerified = (r: Tournament) => r.verified && r.batting.verified && r.team.verified;

type Props = {
  caption: string;
  rows: Tournament[];
};

/** One row per World Cup or series: who won, whether he captained, Australia's results and his batting. */
export function TournamentTable({ caption, rows }: Props) {
  return (
    <div>
    <div role="region" aria-label={caption} tabIndex={0} className="overflow-x-auto border border-border">
      <table className="w-full min-w-[44rem] border-collapse text-sm tabular-nums">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="bg-muted text-left font-heading text-base tracking-wide text-muted-foreground uppercase">
            <th scope="col" className={`sticky left-0 bg-muted ${cell}`}>
              Series
            </th>
            <th scope="col" className={cell}>
              Role
            </th>
            <th scope="col" className={cell}>
              Winner
            </th>
            <th scope="col" className={cell}>
              {site.country}&apos;s results
            </th>
            <th scope="col" className={num}>
              <abbr title="Runs" className="no-underline">
                Runs
              </abbr>
            </th>
            <th scope="col" className={num}>
              <abbr title="Highest score" className="no-underline">
                HS
              </abbr>
            </th>
            <th scope="col" className={num}>
              <abbr title="Batting average" className="no-underline">
                Ave
              </abbr>
            </th>
            <th scope="col" className={num}>
              <abbr title="Hundreds" className="no-underline">
                100s
              </abbr>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.season} className="border-t border-border align-top">
              <th scope="row" className={`sticky left-0 bg-background ${cell} text-left font-medium whitespace-nowrap`}>
                {r.season}
                {!isVerified(r) && <UnverifiedMark />}
              </th>
              <td className={`${cell} whitespace-nowrap`}>
                {r.captain ? (
                  <span className="bg-foreground px-2 py-0.5 font-heading text-base font-extrabold tracking-wide text-background uppercase">
                    Captain
                  </span>
                ) : (
                  <span className="text-muted-foreground">Player</span>
                )}
              </td>
              <td className={`${cell} whitespace-nowrap`}>
                {r.winner === site.country ? (
                  <span className="bg-aus-gold px-2 py-0.5 font-heading text-base font-extrabold tracking-wide text-ink uppercase">
                    {r.winner}
                  </span>
                ) : (
                  r.winner
                )}
              </td>
              <td className={`${cell} min-w-44`}>
                <ResultsBar results={r.team} />
              </td>
              <td className={num}>{whole(r.batting.runs)}</td>
              <td className={num}>{r.batting.highestScore ?? "–"}</td>
              <td className={num}>{fixed(r.batting.average) ?? "–"}</td>
              <td className={num}>{whole(r.batting.hundreds)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {!rows.every(isVerified) && <UnverifiedNote />}
    </div>
  );
}
