import type { Metadata } from "next";
import Link from "next/link";
import { InningsCredit } from "@/components/innings-credit";
import { SectionHeading } from "@/components/section-heading";
import { StatCard } from "@/components/stat-card";
import { UnverifiedMark, UnverifiedNote } from "@/components/unverified-mark";
import { formatDate } from "@/lib/data";
import { allInnings } from "@/lib/innings";
import { scoreText } from "@/lib/innings-math";
import { site } from "@/lib/site";

const copy = site.pages.innings;

export const metadata: Metadata = {
  title: copy.title,
  description: `Replay ${site.subject}'s innings ball by ball: ${new Intl.ListFormat("en-AU").format(allInnings().map((i) => i.title))}.`,
};

export default function Page() {
  const innings = allInnings();
  // One notice per source, whatever the number of innings.
  const credits = [...new Map(innings.map((i) => [i.credit.url, i.credit])).values()];
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <SectionHeading as="h1" title={copy.title} lead={copy.lead} />
      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {innings.map((i) => (
          <li key={i.id} className="relative flex flex-col gap-px border border-border bg-border focus-within:border-score hover:border-score">
            <div className="bg-card px-4 py-3">
              <h2 className="font-heading text-3xl leading-none font-black uppercase">
                {/* The link stretches over the whole card. */}
                <Link href={`/innings/${i.id}`} className="after:absolute after:inset-0 hover:text-score">
                  {i.title}
                </Link>
                {!i.final.verified && <UnverifiedMark />}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {i.batter} v {i.opponent}, {i.venue}, <time dateTime={i.date}>{formatDate(i.date)}</time>
              </p>
            </div>
            <dl className="grid grid-cols-4 gap-px">
              <StatCard label="Runs" value={scoreText(i.final)} />
              <StatCard label="Balls" value={i.final.balls} />
              <StatCard label="Fours" value={i.final.fours} />
              <StatCard label="Sixes" value={i.final.sixes} />
            </dl>
            <p className="bg-card px-4 py-3 font-heading text-lg font-bold tracking-wide uppercase">
              Replay the innings
            </p>
          </li>
        ))}
      </ul>
      {innings.some((i) => !i.final.verified) && <UnverifiedNote />}
      <p className="mt-8 max-w-3xl text-sm text-muted-foreground">
        {credits.map((credit, n) => (
          <span key={credit.url}>
            {n > 0 && " "}
            <InningsCredit credit={credit} />
          </span>
        ))}
      </p>
    </div>
  );
}
