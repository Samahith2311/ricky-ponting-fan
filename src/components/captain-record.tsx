import { ResultsBar } from "@/components/results-bar";
import { StatCard } from "@/components/stat-card";
import { formatLabel } from "@/lib/stats-pages";
import type { CaptaincyRecord, TeamResults } from "@/lib/types";

const winPercent = (r: TeamResults) => (r.matches === 0 ? "–" : `${((r.won / r.matches) * 100).toFixed(1)}%`);

/** One card per format: matches, win rate and the results bar. Used on /captaincy and the captaincy question page. */
export function CaptainRecord({ records }: { records: CaptaincyRecord[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {records.map((r) => (
        <li key={r.format} className="flex flex-col gap-px border border-border bg-border">
          <div className="flex items-baseline justify-between bg-card px-4 py-3">
            <h3 className="font-heading text-3xl leading-none font-black uppercase">{formatLabel(r.format)}</h3>
            <span className="font-heading text-lg font-bold text-muted-foreground">{r.span.replace("-", "–")}</span>
          </div>
          <dl className="grid grid-cols-2 gap-px">
            <StatCard label="Matches" value={r.matches} />
            <StatCard label="Win rate" value={winPercent(r)} />
          </dl>
          <div className="flex-1 bg-card p-4">
            <ResultsBar results={r} />
          </div>
        </li>
      ))}
    </ul>
  );
}
