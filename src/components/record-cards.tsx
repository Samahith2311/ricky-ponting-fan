import { StatCard } from "@/components/stat-card";
import { UnverifiedMark } from "@/components/unverified-mark";
import type { Honour, Ranking } from "@/lib/types";
import { cn, ordinal } from "@/lib/utils";

const card = "flex h-full flex-col gap-3 border border-border bg-card p-4";
const kicker = "font-heading text-lg leading-none font-bold tracking-wide text-muted-foreground uppercase";
const title = "font-heading text-2xl leading-none font-black uppercase";

export const isRankingVerified = (r: Ranking) => r.verified && r.leaders.every((l) => l.verified);

function Source({ href, name }: { href: string; name: string }) {
  return (
    <p className="mt-auto pt-1 text-xs">
      <a href={href} className="text-muted-foreground underline underline-offset-4" rel="noopener noreferrer" target="_blank">
        Source<span className="sr-only"> for {name}</span>
      </a>
    </p>
  );
}

/** An all-time list: his place and figure, then the top of the table with his row in bold. */
export function RankingCard({ ranking }: { ranking: Ranking }) {
  return (
    <article className={card}>
      <h2 className={title}>
        {ranking.title}
        {!isRankingVerified(ranking) && <UnverifiedMark />}
      </h2>
      <dl className="grid grid-cols-2 gap-px border border-border bg-border">
        <StatCard label="Rank" value={ordinal(ranking.rank)} />
        <StatCard label={ranking.measure} value={ranking.value} />
      </dl>
      <ol className="text-sm tabular-nums">
        {ranking.leaders.map((leader) => (
          <li
            key={leader.rank}
            className={cn(
              "flex items-baseline justify-between gap-4 border-t border-border py-1.5",
              leader.rank === ranking.rank && "font-bold",
            )}
          >
            <span>
              <span className="mr-2 text-muted-foreground">{leader.rank}</span>
              {leader.player}
            </span>
            <span>{leader.value.toLocaleString("en-AU")}</span>
          </li>
        ))}
      </ol>
      <Source href={ranking.source} name={ranking.title} />
    </article>
  );
}

/** An award, hall of fame entry, honour or record. Empty strings in the data mean "not recorded". */
export function HonourCard({ honour }: { honour: Honour }) {
  return (
    <article className={card}>
      <p className={kicker}>
        {honour.category}
        {honour.when && ` / ${honour.when}`}
      </p>
      <h2 className={title}>
        {honour.title}
        {!honour.verified && <UnverifiedMark />}
      </h2>
      {honour.subtitle && <p className="text-sm">{honour.subtitle}</p>}
      {honour.value && (
        <p className="font-heading text-5xl leading-none font-black text-score tabular-nums">{honour.value}</p>
      )}
      {honour.note && <p className="text-sm text-muted-foreground">{honour.note}</p>}
      <Source href={honour.source} name={honour.title} />
    </article>
  );
}
