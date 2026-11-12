import type { BattingRow } from "@/lib/types";

export type LabelledRow = BattingRow & { label: string };

const fixed = (n: number | null) => (n === null ? "–" : n.toFixed(2));
const whole = (n: number | null) => (n === null ? "–" : n.toLocaleString("en-AU"));

const COLUMNS: { head: string; title: string; cell: (r: BattingRow) => string }[] = [
  { head: "Mat", title: "Matches", cell: (r) => whole(r.matches) },
  { head: "Inns", title: "Innings", cell: (r) => whole(r.innings) },
  { head: "NO", title: "Not outs", cell: (r) => whole(r.notOuts) },
  { head: "Runs", title: "Runs", cell: (r) => whole(r.runs) },
  { head: "HS", title: "Highest score", cell: (r) => r.highestScore ?? "–" },
  { head: "Ave", title: "Batting average", cell: (r) => fixed(r.average) },
  { head: "SR", title: "Strike rate", cell: (r) => fixed(r.strikeRate) },
  { head: "100s", title: "Hundreds", cell: (r) => whole(r.hundreds) },
  { head: "50s", title: "Fifties", cell: (r) => whole(r.fifties) },
];

type Props = {
  caption: string;
  firstColumn: string;
  rows: LabelledRow[];
  /** Career line shown as the footer row. */
  total?: BattingRow;
};

export function BattingTable({ caption, firstColumn, rows, total }: Props) {
  const anyUnverified = rows.some((r) => !r.verified);
  const cell = "px-3 py-2 text-right";

  return (
    <div>
      {/* Wide tables scroll inside their own box; the region is focusable so keyboards can scroll it. */}
      <div role="region" aria-label={caption} tabIndex={0} className="overflow-x-auto border border-border">
        <table className="w-full min-w-[38rem] border-collapse text-sm tabular-nums">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="bg-muted font-heading text-base tracking-wide text-muted-foreground uppercase">
              <th scope="col" className="sticky left-0 bg-muted px-3 py-2 text-left font-bold">
                {firstColumn}
              </th>
              {COLUMNS.map((c) => (
                <th key={c.head} scope="col" className={`${cell} font-bold`}>
                  <abbr title={c.title} className="no-underline">
                    {c.head}
                  </abbr>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-t border-border">
                <th scope="row" className="sticky left-0 bg-background px-3 py-2 text-left font-medium whitespace-nowrap">
                  {r.label}
                  {!r.verified && <sup aria-label="unverified"> †</sup>}
                </th>
                {COLUMNS.map((c) => (
                  <td key={c.head} className={cell}>
                    {c.cell(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {total && (
            <tfoot>
              <tr className="border-t-2 border-foreground font-bold">
                <th scope="row" className="sticky left-0 bg-background px-3 py-2 text-left">
                  Career
                </th>
                {COLUMNS.map((c) => (
                  <td key={c.head} className={cell}>
                    {c.cell(total)}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {anyUnverified && <p className="mt-2 text-xs text-muted-foreground">† Not yet confirmed against a source.</p>}
    </div>
  );
}
