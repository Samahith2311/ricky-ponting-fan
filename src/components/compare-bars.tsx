import { UnverifiedMark } from "@/components/unverified-mark";
import { type ComparePlayer, formatValue, MEASURES } from "@/lib/compare";
import type { BattingRow } from "@/lib/types";

type Side = { player: ComparePlayer; row: BattingRow; fill: string };

/**
 * One block per measure, the two players one above the other. Bar lengths are scaled within a
 * measure only, to the larger of the two, and the real value is printed beside every bar.
 */
export function CompareBars({ sides }: { sides: [Side, Side] }) {
  return (
    <ul className="grid gap-6">
      {MEASURES.map((m) => {
        const values = sides.map((s) => s.row[m.key]);
        const max = Math.max(...values.map((v) => v ?? 0)) || 1;
        return (
          <li key={m.key}>
            <h4 className="mb-2 font-heading text-lg leading-none font-bold tracking-wide text-muted-foreground uppercase">
              {m.label}
            </h4>
            <ul className="grid gap-y-3 sm:gap-y-2">
              {sides.map((s, i) => {
                const value = values[i];
                return (
                  <li
                    key={s.player.id}
                    className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 sm:grid-cols-[9rem_1fr_5rem]"
                  >
                    <span className="text-sm">
                      {s.player.name}
                      {!s.row.verified && <UnverifiedMark />}
                    </span>
                    <span className="text-right font-heading text-xl leading-none font-extrabold tabular-nums sm:order-3">
                      <span className="sr-only">{m.label}: </span>
                      {value === null ? "–" : formatValue(value, m)}
                      {value === null && <span className="sr-only"> (not recorded)</span>}
                    </span>
                    <span aria-hidden className="col-span-2 h-3 sm:order-2 sm:col-span-1">
                      {value !== null && value > 0 && (
                        <span
                          className={`block h-full min-w-0.5 ${s.fill}`}
                          style={{ width: `${(value / max) * 100}%` }}
                        />
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}
