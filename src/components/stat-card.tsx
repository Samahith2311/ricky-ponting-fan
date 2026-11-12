import { cn } from "@/lib/utils";

type Props = {
  label: string;
  /** Pass the raw value from the data files; null renders as a dash. */
  value: number | string | null;
  hint?: string;
  className?: string;
};

export const formatStat = (value: number | string | null) =>
  value === null ? "–" : typeof value === "number" ? value.toLocaleString("en-AU") : value;

/** One cell of a scoreboard grid. Use inside <dl className="stat-grid ...">. */
export function StatCard({ label, value, hint, className }: Props) {
  return (
    <div className={cn("@container flex flex-col gap-2 bg-card p-3 sm:p-4", className)}>
      <dt className="font-heading text-base leading-none font-bold tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      {/* Sized from the cell width, so a six-character value fits whatever grid the card sits in. */}
      <dd className="font-heading text-[clamp(1.5rem,34cqi,3rem)] leading-none font-black text-score tabular-nums">
        {formatStat(value)}
      </dd>
      {hint && <dd className="text-sm text-muted-foreground">{hint}</dd>}
    </div>
  );
}
