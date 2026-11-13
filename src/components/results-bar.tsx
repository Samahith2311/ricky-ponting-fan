import { UnverifiedMark } from "@/components/unverified-mark";
import type { TeamResults } from "@/lib/types";

const PARTS = [
  { key: "won", label: "Won", fill: "bg-chart-1" },
  { key: "lost", label: "Lost", fill: "bg-chart-5" },
  { key: "drawn", label: "Drawn", fill: "bg-chart-4" },
  { key: "tied", label: "Tied", fill: "bg-chart-3" },
  { key: "noResult", label: "No result", fill: "bg-muted-foreground" },
] as const;

/**
 * Won, lost, drawn, tied and no result as one segmented bar. The counts are written out
 * under it, so colour is never the only carrier. Won and lost always show, even at zero.
 */
export function ResultsBar({ results }: { results: TeamResults }) {
  const parts = PARTS.map((p) => ({ ...p, count: results[p.key] ?? 0 })).filter(
    (p) => p.count > 0 || p.key === "won" || p.key === "lost",
  );

  return (
    <div>
      <div aria-hidden className="flex h-3 gap-px bg-border">
        {parts
          .filter((p) => p.count > 0)
          .map((p) => (
            <span key={p.key} className={`basis-0 ${p.fill}`} style={{ flexGrow: p.count }} />
          ))}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm whitespace-nowrap tabular-nums">
        {parts.map((p) => (
          <li key={p.key} className="flex items-center gap-1.5">
            <span aria-hidden className={`size-2.5 ${p.fill}`} />
            {p.label} {p.count}
          </li>
        ))}
        {!results.verified && (
          <li>
            <UnverifiedMark />
          </li>
        )}
      </ul>
    </div>
  );
}
