import { SectionHeading } from "@/components/section-heading";
import { coaching, formatDate } from "@/lib/data";
import { ordinal } from "@/lib/utils";

const cell = "px-3 py-2";

export function CoachingStints() {
  const sources = [...new Set([...coaching.stints, ...coaching.seasons].map((row) => row.source))];

  return (
    <section className="mt-16">
      <SectionHeading
        title="In the dugout"
        lead="Head coach of three IPL sides since he stopped playing. League position first, then how far the side went."
      />

      <ul className="grid gap-px border border-border bg-border md:grid-cols-3">
        {coaching.stints.map((stint) => (
          <li key={stint.team} className="bg-card p-4">
            <p className="font-heading text-lg leading-none font-bold tracking-wide text-muted-foreground uppercase">
              {stint.role} / {stint.years}
            </p>
            <h3 className="mt-2 font-heading text-3xl leading-none font-black uppercase">{stint.team}</h3>
            <p className="mt-3 text-sm text-muted-foreground">{stint.note}</p>
          </li>
        ))}
      </ul>

      <div
        role="region"
        aria-label="IPL seasons as head coach"
        tabIndex={0}
        className="mt-6 overflow-x-auto border border-border"
      >
        <table className="w-full min-w-[30rem] border-collapse text-sm">
          <caption className="sr-only">IPL seasons as head coach</caption>
          <thead>
            <tr className="bg-muted text-left font-heading text-base tracking-wide text-muted-foreground uppercase">
              <th scope="col" className={cell}>
                Season
              </th>
              <th scope="col" className={cell}>
                Team
              </th>
              <th scope="col" className={cell}>
                League table
              </th>
              <th scope="col" className={cell}>
                Finish
              </th>
            </tr>
          </thead>
          <tbody>
            {coaching.seasons.map((s) => (
              <tr key={s.season} className="border-t border-border">
                <th scope="row" className={`${cell} text-left font-medium tabular-nums`}>
                  {s.season}
                  {!s.verified && <sup aria-label="unverified"> †</sup>}
                </th>
                <td className={cell}>{s.team}</td>
                <td className={`${cell} tabular-nums`}>
                  {ordinal(s.position)} of {s.teams}
                </td>
                <td className={cell}>
                  {s.finish === "Champions" ? (
                    <span className="bg-aus-gold px-2 py-0.5 font-heading text-base font-extrabold tracking-wide text-ink uppercase">
                      {s.finish}
                    </span>
                  ) : (
                    s.finish
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        Sources:{" "}
        {sources.map((url, i) => (
          <span key={url}>
            {i > 0 && ", "}
            <a href={url} className="text-foreground underline underline-offset-4" rel="noopener noreferrer" target="_blank">
              {decodeURIComponent(new URL(url).pathname.split("/").pop()!).replaceAll("_", " ")}
            </a>
          </span>
        ))}{" "}
        (Wikipedia), retrieved {formatDate(coaching.retrieved)}.
      </p>
    </section>
  );
}
