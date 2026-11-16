import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { CareerTimeline } from "@/components/career-timeline";
import { JsonLd } from "@/components/json-ld";
import { ScoreboardCounter } from "@/components/scoreboard-counter";
import { SectionHeading } from "@/components/section-heading";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { formatDate, formats, international, retrieved, timeline, worldCupWins } from "@/lib/data";
import { site, siteUrl } from "@/lib/site";

const board = [
  { label: "Intl runs", value: international.runs },
  { label: "Hundreds", value: international.hundreds },
  { label: "Matches", value: international.matches },
  { label: "World Cups", value: worldCupWins.length },
];

const cta = "h-12 px-6 font-heading text-xl font-extrabold tracking-wide uppercase";

export default function Home() {
  const cupYears = new Intl.ListFormat("en-AU").format(worldCupWins.map((w) => String(w.year)));

  return (
    <>
      <JsonLd
        data={{
          "@type": "WebSite",
          name: site.name,
          url: siteUrl,
          description: site.description,
          about: { "@type": "Person", name: site.subject, alternateName: site.nickname, sameAs: site.sameAs },
        }}
      />
      <section className="outfield border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-10 pb-12 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-end lg:gap-14 lg:py-20">
          <div className="@container">
            <p className="font-heading text-xl font-bold tracking-wide text-score uppercase">
              {site.nickname} / {site.country} / {international.from}–{international.to}
            </p>
            {/* Sized from the column width so PONTING always fills it without overflowing. */}
            <h1 className="mt-2 font-heading text-[clamp(4.5rem,27cqi,11rem)] leading-[0.86] font-black uppercase">
              {site.subject.split(" ").map((word) => (
                <span key={word} className="block">
                  {word}
                </span>
              ))}
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">{site.lede}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className={cta}>
                <Link href="/test">Test numbers</Link>
              </Button>
              <Button asChild variant="outline" className={cta}>
                <Link href="/innings">Replay an innings</Link>
              </Button>
            </div>
          </div>

          {/* The board keeps its night colours in the light theme: scoreboards are black in daylight too. */}
          <div className="dark border border-border bg-card text-foreground">
            <div className="flex items-baseline justify-between gap-4 border-b border-border px-4 py-3 font-heading text-xl font-bold tracking-wide uppercase">
              <span>{site.subject}</span>
              <span className="text-muted-foreground">International</span>
            </div>
            <dl>
              {board.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
                  <dt className="font-heading text-2xl leading-none font-bold uppercase sm:text-3xl">{row.label}</dt>
                  <dd>
                    <ScoreboardCounter value={row.value} className="text-5xl sm:text-6xl" />
                  </dd>
                </div>
              ))}
            </dl>
            <p className="px-4 py-3 text-sm text-muted-foreground">
              World Cup winner in {cupYears}. Source: ESPNcricinfo Statsguru, {formatDate(retrieved)}.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading title="By format" lead="Four boards, one batter. Open a format for the year-by-year, opponent and home-and-away splits." />
        <div className="grid gap-6 md:grid-cols-2">
          {formats.map((f) => (
            <Link
              key={f.id}
              href={`/${f.id}`}
              className="group flex flex-col gap-px border border-border bg-border transition-colors hover:border-score"
            >
              <div className="flex items-baseline justify-between bg-card px-4 py-3">
                <h3 className="font-heading text-3xl leading-none font-black uppercase">{f.label}</h3>
                <span className="font-heading text-lg font-bold text-muted-foreground">{f.span?.replace("-", "–")}</span>
              </div>
              <dl className="grid grid-cols-3 gap-px">
                <StatCard label="Matches" value={f.matches} />
                <StatCard label="Runs" value={f.runs} />
                <StatCard label="Average" value={f.average} />
              </dl>
              <p className="flex items-center justify-between bg-card px-4 py-3 font-heading text-lg font-bold tracking-wide uppercase group-hover:text-score">
                Open {f.label} numbers
                <ArrowRightIcon className="size-5" weight="bold" />
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <SectionHeading
          title={site.pages.timeline.title}
          lead={site.pages.timeline.lead}
          action={
            <Link
              href="/timeline"
              className="flex items-center gap-1.5 font-heading text-lg font-bold tracking-wide whitespace-nowrap uppercase hover:text-score"
            >
              Full timeline
              <ArrowRightIcon className="size-5" weight="bold" />
            </Link>
          }
        />
        <CareerTimeline events={timeline.filter((event) => event.major)} />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <SectionHeading title="Also on the board" />
        <ul className="-mt-8">
          {site.explore.map((item) => (
            <li key={item.href} className="border-b border-border">
              <Link
                href={item.href}
                className="group grid items-baseline gap-x-8 gap-y-1 py-4 sm:grid-cols-[13rem_1fr_auto]"
              >
                <span className="font-heading text-3xl leading-none font-extrabold uppercase group-hover:text-score">
                  {item.title}
                </span>
                <span className="text-muted-foreground">{item.text}</span>
                <ArrowRightIcon className="hidden size-5 self-center text-muted-foreground sm:block" weight="bold" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
