"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const ALL = "All";

type Props = {
  /** Cards are rendered on the server; this component only decides which ones to show. */
  items: { id: string; category: string; card: React.ReactNode }[];
};

export function RecordsFilter({ items }: Props) {
  const [active, setActive] = useState(ALL);
  const categories = [ALL, ...new Set(items.map((item) => item.category))];
  const shown = active === ALL ? items : items.filter((item) => item.category === active);

  return (
    <div>
      <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            aria-pressed={active === category}
            onClick={() => setActive(category)}
            className={cn(
              "h-11 border border-border px-5 font-heading text-lg font-bold tracking-wide uppercase",
              active === category ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {shown.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((item) => (
              <li key={item.id}>{item.card}</li>
            ))}
          </ul>
        ) : (
          <div className="border border-border bg-card p-6">
            <p className="font-heading text-2xl leading-none font-black uppercase">Nothing here</p>
            <p className="mt-2 text-muted-foreground">
              {active === ALL ? "There are no entries yet." : `No entries are filed under ${active}.`}
            </p>
            {active !== ALL && (
              <button
                type="button"
                onClick={() => setActive(ALL)}
                className="mt-4 text-foreground underline underline-offset-4"
              >
                Show everything
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
