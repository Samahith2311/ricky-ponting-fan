import type { Metadata } from "next";
import { CaptainRecord } from "@/components/captain-record";
import { CaptainToggle } from "@/components/captain-toggle";
import { ResultsBar } from "@/components/results-bar";
import { SectionHeading } from "@/components/section-heading";
import { StatCard } from "@/components/stat-card";
import { isVerified, TournamentTable } from "@/components/tournament-table";
import { UnverifiedMark, UnverifiedNote } from "@/components/unverified-mark";
import { captaincyData as data, formatDate } from "@/lib/data";
import { site } from "@/lib/site";
import { formatLabel } from "@/lib/stats-pages";
import { fixed } from "@/lib/utils";

const copy = site.pages.captaincy;

const subheading = "font-heading text-2xl leading-none font-extrabold uppercase";

export const metadata: Metadata = {
  title: copy.title,
  description: `${site.subject} as ${site.country}'s captain: ${new Intl.ListFormat("en-AU").format(
    data.record.map((r) => `${r.won} ${formatLabel(r.format)} wins in ${r.matches} matches`),
  )}, with his World Cups and Ashes series.`,
};

export default function Page() {
  // The World Cups he captained to the title, and the Ashes series, read straight from the data.
  const cupsWon = data.worldCups.filter((w) => w.captain && w.winner === site.country);
  const captainedAshes = data.ashes.filter((a) => a.captain);
  const ashesWon = captainedAshes.filter((a) => a.winner === site.country);
  const mostRuns = data.ashes.reduce((a, b) => (b.batting.runs > a.batting.runs ? b : a));
  const lowestAverage = data.ashes.reduce((a, b) => ((b.batting.average ?? Infinity) < (a.batting.average ?? Infinity) ? b : a));
  // The tables print their own footnote; this one covers the record cards and the two panels.
  const anyUnverified = [...data.record, data.worldCupRecord].some((r) => !r.verified) || !cupsWon.every(isVerified);
  const sources = [
    ...data.record.map((r) => ({ label: formatLabel(r.format), url: r.source })),
    { label: "World Cups", url: data.worldCupRecord.source },
    { label: "Ashes", url: data.ashes[0].source },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <SectionHeading as="h1" title={copy.title} lead={copy.lead} />

      <section aria-labelledby="record-heading">
        <h2 id="record-heading" className={`${subheading} mb-4`}>
          Record as captain
        </h2>
        <CaptainRecord records={data.record} />
      </section>

      <section className="mt-16" aria-labelledby="toggle-heading">
        <h2 id="toggle-heading" className={`${subheading} mb-1`}>
          Captain or player
        </h2>
        <p className="mb-5 max-w-2xl text-muted-foreground">
          The same batter in the same formats, with the armband and without it.
        </p>
        <CaptainToggle rows={data.batting} />
      </section>

      <section className="mt-16">
        <SectionHeading
          title="World Cups"
          lead="Every World Cup he played, and a closer look at the ones he won as captain."
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {cupsWon.map((w) => (
            <section key={w.year} className="flex flex-col gap-px border border-border bg-border">
              <div className="flex items-baseline justify-between gap-4 bg-card px-4 py-3">
                <h3 className="font-heading text-4xl leading-none font-black uppercase">
                  {w.year}
                  {!isVerified(w) && <UnverifiedMark />}
                </h3>
                <span className="font-heading text-lg font-bold text-muted-foreground">Winner: {w.winner}</span>
              </div>
              <dl className="grid grid-cols-3 gap-px">
                <StatCard label="Runs" value={w.batting.runs} />
                <StatCard label="Average" value={fixed(w.batting.average)} />
                <StatCard label="Highest score" value={w.batting.highestScore} />
                <StatCard label="Strike rate" value={fixed(w.batting.strikeRate)} />
                <StatCard label="Hundreds" value={w.batting.hundreds} />
                <StatCard label="Fifties" value={w.batting.fifties} />
              </dl>
              <div className="bg-card p-4">
                <p className="mb-2 font-heading text-lg leading-none font-bold tracking-wide text-muted-foreground uppercase">
                  {site.country}&apos;s results
                </p>
                <ResultsBar results={w.team} />
              </div>
            </section>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4">
          <TournamentTable caption="Every World Cup he played" rows={data.worldCups} />
          <div className="border border-border bg-card p-4">
            <p className="mb-2 font-heading text-lg leading-none font-bold tracking-wide text-muted-foreground uppercase">
              As captain across the World Cups, {data.worldCupRecord.span.replace("-", "–")}
            </p>
            <ResultsBar results={data.worldCupRecord} />
          </div>
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading
          title="The Ashes"
          lead="Every series from his first to his last. Series he captained are marked; the bars show how Australia fared."
        />
        <dl className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-3">
          <StatCard
            label="Series won as captain"
            value={ashesWon.length}
            hint={`Out of ${captainedAshes.length} series as captain`}
          />
          <StatCard
            label="Most runs in a series"
            value={mostRuns.batting.runs}
            hint={`${mostRuns.season}, won by ${mostRuns.winner}`}
          />
          <StatCard
            label="Lowest average in a series"
            value={fixed(lowestAverage.batting.average)}
            hint={`${lowestAverage.season}, won by ${lowestAverage.winner}`}
          />
        </dl>
        <div className="mt-4 grid grid-cols-1">
          <TournamentTable caption="Every Ashes series he played" rows={data.ashes} />
        </div>
      </section>

      {anyUnverified && <UnverifiedNote />}

      <p className="mt-8 text-sm text-muted-foreground">
        Sources: ESPNcricinfo Statsguru,{" "}
        {sources.map((s, i) => (
          <span key={s.label}>
            {i > 0 && ", "}
            <a href={s.url} className="text-foreground underline underline-offset-4" rel="noopener noreferrer" target="_blank">
              {s.label}
            </a>
          </span>
        ))}
        . Retrieved {formatDate(data.retrieved)}.
      </p>
    </div>
  );
}
