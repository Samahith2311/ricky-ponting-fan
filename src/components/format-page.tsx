import Link from "next/link";
import { BattingTable } from "@/components/batting-table";
import { YearCharts } from "@/components/charts";
import { RankedBars } from "@/components/ranked-bars";
import { SectionHeading } from "@/components/section-heading";
import { StatCard } from "@/components/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/data";
import type { BattingRow, FormatData } from "@/lib/types";

const fixed = (n: number | null) => (n === null ? null : n.toFixed(2));
const whole = (n: number) => n.toLocaleString("en-AU");
const capitalise = (s: string) => s[0].toUpperCase() + s.slice(1);
const top = <T extends BattingRow>(rows: T[], key: "runs" | "average") =>
  rows.reduce((a, b) => ((b[key] ?? 0) > (a[key] ?? 0) ? b : a));

// A chart of two or three bars says less than the table under it.
const CHART_MIN_ROWS = 4;
// "Best average against" ignores opponents he barely batted against.
const MIN_INNINGS = 5;

// The active tab is marked with an inset bottom rule; shadcn's own underline sits outside the scrolling list and gets clipped.
const trigger =
  "h-11 flex-none px-4 font-heading text-lg font-bold tracking-wide uppercase after:hidden data-[state=active]:shadow-[inset_0_-3px_0_var(--score)]";
// Every panel stays in the HTML (forceMount) so the tables are indexable; inactive ones are hidden.
// grid-cols-1 = minmax(0, 1fr): without it a wide table stretches the track and the whole page with it.
const panel = "grid grid-cols-1 gap-8 pt-8 data-[state=inactive]:hidden";
const stack = "grid grid-cols-1 gap-4";
const subheading = "font-heading text-2xl leading-none font-extrabold uppercase";
const chartCard = "border border-border bg-card p-4 sm:p-6";

type Props = {
  data: FormatData;
  copy: { title: string; lead: string };
  /** Extra sections under the tabs (the IPL page adds coaching). */
  children?: React.ReactNode;
};

export function FormatPage({ data, copy, children }: Props) {
  const { summary, byYear, byOpponent, byHost, byTeam, venue, captaincy } = data;
  const bestYear = top(byYear, "runs");
  const bestOpponent = top(byOpponent, "runs");
  const regulars = byOpponent.filter((o) => o.innings >= MIN_INNINGS);
  const bestAverage = regulars.length ? top(regulars, "average") : null;
  const captainRows = [
    ...(captaincy.captain ? [{ label: "As captain", ...captaincy.captain }] : []),
    ...(captaincy.player ? [{ label: "Not captain", ...captaincy.player }] : []),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <SectionHeading
        as="h1"
        title={copy.title}
        lead={copy.lead}
        action={
          <span className="font-heading text-xl font-bold whitespace-nowrap text-muted-foreground">
            {summary.span?.replace("-", "–")}
          </span>
        }
      />

      <dl className="grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4">
        <StatCard label="Matches" value={summary.matches} />
        <StatCard label="Innings" value={summary.innings} />
        <StatCard label="Runs" value={summary.runs} />
        <StatCard label="Average" value={fixed(summary.average)} />
        <StatCard label="Strike rate" value={fixed(summary.strikeRate)} />
        <StatCard label="Highest score" value={summary.highestScore} />
        <StatCard label="Hundreds" value={summary.hundreds} />
        <StatCard label="Fifties" value={summary.fifties} />
      </dl>
      <p className="mt-3 text-sm text-muted-foreground">
        {whole(summary.notOuts)} not outs, {whole(summary.ducks)} ducks
        {summary.fours !== null && `, ${whole(summary.fours)} fours`}
        {summary.sixes !== null && `, ${whole(summary.sixes)} sixes`}
        {summary.ballsFaced !== null && `, ${whole(summary.ballsFaced)} balls faced`}.
      </p>

      <Tabs defaultValue="overview" className="mt-12 gap-0">
        <TabsList variant="line" className="h-auto w-full justify-start gap-0 overflow-x-auto border-b border-border p-0 group-data-horizontal/tabs:h-auto">
          <TabsTrigger value="overview" className={trigger}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="year" className={trigger}>
            By year
          </TabsTrigger>
          <TabsTrigger value="opponent" className={trigger}>
            By opponent
          </TabsTrigger>
          <TabsTrigger value="venue" className={trigger}>
            Home and away
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" forceMount className={panel}>
          <dl className="grid gap-px border border-border bg-border sm:grid-cols-3">
            <StatCard
              label="Best year"
              value={bestYear.runs}
              hint={`${bestYear.year}, at an average of ${fixed(bestYear.average) ?? "–"}`}
            />
            <StatCard
              label="Most runs against"
              value={bestOpponent.runs}
              hint={`${bestOpponent.opponent}, in ${bestOpponent.matches} matches`}
            />
            {bestAverage && (
              <StatCard
                label="Best average against"
                value={fixed(bestAverage.average)}
                hint={`${bestAverage.opponent}, ${bestAverage.innings} innings (minimum ${MIN_INNINGS})`}
              />
            )}
          </dl>

          {captainRows.length > 0 && (
            <section className={stack}>
              <h2 className={subheading}>With and without the captaincy</h2>
              <BattingTable caption={`${data.label} batting by captaincy`} firstColumn="Role" rows={captainRows} />
              <p className="text-sm text-muted-foreground">
                Results, World Cups and the Ashes are on the{" "}
                <Link href="/captaincy" className="text-foreground underline underline-offset-4">
                  captaincy page
                </Link>
                .
              </p>
            </section>
          )}

          {byTeam.length > 1 && (
            <section className={stack}>
              <h2 className={subheading}>By team</h2>
              <BattingTable
                caption={`${data.label} batting by team`}
                firstColumn="Team"
                rows={byTeam.map((r) => ({ label: r.team, ...r }))}
                total={summary}
              />
            </section>
          )}
        </TabsContent>

        <TabsContent value="year" forceMount className={panel}>
          {byYear.length >= CHART_MIN_ROWS && (
            <div className={chartCard}>
              <YearCharts
                data={byYear.map(({ year, runs, average }) => ({ year, runs, average }))}
                careerAverage={summary.average}
              />
            </div>
          )}
          <BattingTable
            caption={`${data.label} batting by calendar year`}
            firstColumn="Year"
            rows={byYear.map((r) => ({ label: String(r.year), ...r }))}
            total={summary}
          />
        </TabsContent>

        <TabsContent value="opponent" forceMount className={panel}>
          {byOpponent.length >= CHART_MIN_ROWS && (
            <figure className={chartCard}>
              <figcaption className={`${subheading} mb-5`}>Runs by opponent</figcaption>
              <RankedBars measure="Runs" rows={byOpponent.map((r) => ({ label: r.opponent, value: r.runs }))} />
            </figure>
          )}
          <BattingTable
            caption={`${data.label} batting by opponent`}
            firstColumn="Opponent"
            rows={byOpponent.map((r) => ({ label: r.opponent, ...r }))}
            total={summary}
          />
        </TabsContent>

        <TabsContent value="venue" forceMount className={panel}>
          <figure className={chartCard}>
            <figcaption className={`${subheading} mb-5`}>Average, home and away</figcaption>
            <RankedBars
              measure="Average"
              decimals={2}
              rows={venue.map((r) => ({ label: capitalise(r.venue), value: r.average ?? 0 }))}
            />
          </figure>
          <BattingTable
            caption={`${data.label} batting home, away and neutral`}
            firstColumn="Venue"
            rows={venue.map((r) => ({ label: capitalise(r.venue), ...r }))}
            total={summary}
          />

          <section className={stack}>
            <h2 className={subheading}>By host country</h2>
            {byHost.length >= CHART_MIN_ROWS && (
              <figure className={chartCard}>
                <figcaption className="sr-only">Runs by host country</figcaption>
                <RankedBars measure="Runs" rows={byHost.map((r) => ({ label: r.host, value: r.runs }))} />
              </figure>
            )}
            <BattingTable
              caption={`${data.label} batting by host country`}
              firstColumn="Country"
              rows={byHost.map((r) => ({ label: r.host, ...r }))}
              total={summary}
            />
          </section>
        </TabsContent>
      </Tabs>

      <p className="mt-8 text-sm text-muted-foreground">
        Source:{" "}
        <a
          href={summary.source}
          className="text-foreground underline underline-offset-4"
          rel="noopener noreferrer"
          target="_blank"
        >
          ESPNcricinfo Statsguru
        </a>
        , retrieved {formatDate(data.retrieved)}.
      </p>

      {children}
    </div>
  );
}
