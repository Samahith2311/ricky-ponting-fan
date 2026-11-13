"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { cn } from "@/lib/utils";

type Selection = { a: string; b: string; format: string };
type Props = Selection & {
  players: { id: string; name: string }[];
  formats: { id: string; label: string }[];
  /** The results. Dimmed and marked busy while the server answers a change. */
  children: React.ReactNode;
};

const select = "h-11 w-full border border-input bg-card px-3 text-base";
const label = "mb-1 block font-heading text-base leading-none font-bold tracking-wide text-muted-foreground uppercase";

/** The three choices live in the URL. Changing one pushes a new URL and the server renders the new view. */
export function CompareControls({ players, formats, children, ...current }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // Shows the new choice at once; it settles to the URL's value when the server has answered.
  const [sel, setSel] = useOptimistic<Selection, Partial<Selection>>(current, (state, change) => ({ ...state, ...change }));

  const change = (next: Partial<Selection>) =>
    startTransition(() => {
      setSel(next);
      // push, so Back and Forward step through the choices.
      router.push(`?${new URLSearchParams({ ...sel, ...next })}`, { scroll: false });
    });

  // Picking the player the other select holds swaps the two.
  const pick = (slot: "a" | "b", id: string) => {
    const other = slot === "a" ? "b" : "a";
    change(id === sel[other] ? { [slot]: id, [other]: sel[slot] } : { [slot]: id });
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
        {(["a", "b"] as const).map((slot) => (
          <div key={slot}>
            <label htmlFor={`compare-${slot}`} className={label}>
              {slot === "a" ? "Player A" : "Player B"}
            </label>
            <select id={`compare-${slot}`} value={sel[slot]} onChange={(e) => pick(slot, e.target.value)} className={select}>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        ))}
        <div className="sm:col-span-2 lg:col-span-1">
          <span id="compare-format" className={label}>
            Format
          </span>
          <div role="group" aria-labelledby="compare-format" className="inline-flex border border-border">
            {formats.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={sel.format === f.id}
                onClick={() => change({ format: f.id })}
                className={cn(
                  "h-11 px-5 font-heading text-lg font-bold tracking-wide uppercase",
                  sel.format === f.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div aria-busy={pending} className={cn("transition-opacity", pending && "opacity-50")}>
        {children}
      </div>
    </>
  );
}
