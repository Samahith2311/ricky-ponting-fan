type Props = {
  /** What the bars measure, e.g. "Runs". Read out before each value. */
  measure: string;
  rows: { label: string; value: number }[];
  decimals?: number;
};

/**
 * Ranked horizontal bars, largest first, one colour. Plain HTML so it renders on the
 * server and the name can sit above its bar on a narrow screen.
 */
export function RankedBars({ measure, rows, decimals = 0 }: Props) {
  const sorted = [...rows].sort((a, b) => b.value - a.value);
  const max = sorted[0]?.value || 1;

  return (
    <ol className="grid gap-y-3 sm:gap-y-2">
      {sorted.map((row) => (
        <li
          key={row.label}
          className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 sm:grid-cols-[12rem_1fr_4.5rem]"
        >
          <span className="text-sm">{row.label}</span>
          <span className="text-right text-sm font-semibold tabular-nums sm:order-3">
            <span className="sr-only">{measure}: </span>
            {row.value.toLocaleString("en-AU", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
          </span>
          <span aria-hidden className="col-span-2 h-3 sm:order-2 sm:col-span-1">
            {/* A zero draws nothing. */}
            {row.value > 0 && (
              <span
                className="block h-full min-w-0.5 rounded-r-[4px] bg-chart-1"
                style={{ width: `${(row.value / max) * 100}%` }}
              />
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}
