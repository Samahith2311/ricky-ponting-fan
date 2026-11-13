"use client";

import { useState } from "react";
import { StatCard } from "@/components/stat-card";
import type { BattingRow, CaptaincyBatting } from "@/lib/types";
import { cn, fixed } from "@/lib/utils";

const ROLES = [
  { key: "captain", label: "As captain" },
  { key: "player", label: "Not captain" },
] as const;

/** Captain vs player: one switch swaps every format's batting board between the two roles. */
export function CaptainToggle({ rows }: { rows: CaptaincyBatting[] }) {
  const [role, setRole] = useState<(typeof ROLES)[number]["key"]>("captain");

  return (
    <div>
      <div role="group" aria-label="Batting role" className="inline-flex border border-border">
        {ROLES.map((r) => (
          <button
            key={r.key}
            type="button"
            aria-pressed={role === r.key}
            onClick={() => setRole(r.key)}
            className={cn(
              "h-11 px-5 font-heading text-lg font-bold tracking-wide uppercase",
              role === r.key ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {rows.map((row) => {
          const batting: BattingRow | null = row[role];
          return (
            <section key={row.format} className="flex flex-col gap-px border border-border bg-border">
              <div className="flex items-baseline justify-between bg-card px-4 py-3">
                <h3 className="font-heading text-3xl leading-none font-black uppercase">{row.label}</h3>
                {batting?.span && (
                  <span className="font-heading text-lg font-bold text-muted-foreground">
                    {batting.span.replace("-", "–")}
                  </span>
                )}
              </div>
              {batting ? (
                <dl className="grid grid-cols-2 gap-px">
                  <StatCard label="Matches" value={batting.matches} />
                  <StatCard label="Runs" value={batting.runs} />
                  <StatCard label="Average" value={fixed(batting.average)} />
                  <StatCard label="Strike rate" value={fixed(batting.strikeRate)} />
                  <StatCard label="Hundreds" value={batting.hundreds} />
                  <StatCard label="Highest score" value={batting.highestScore} />
                </dl>
              ) : (
                <p className="bg-card p-4 text-muted-foreground">No {row.label} matches outside the captaincy.</p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
