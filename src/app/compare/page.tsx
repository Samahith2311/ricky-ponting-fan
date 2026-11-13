import type { Metadata } from "next";
import { CompareRadar } from "@/components/charts";
import { CompareBars } from "@/components/compare-bars";
import { CompareControls } from "@/components/compare-controls";
import { SectionHeading } from "@/components/section-heading";
import { UnverifiedNote } from "@/components/unverified-mark";
import {
  compareFormats,
  comparePlayers,
  compareRetrieved,
  list,
  MEASURES,
  radarAxes,
  readSelection,
  rowFor,
  summaryFor,
} from "@/lib/compare";
import { formatDate } from "@/lib/data";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const copy = site.pages.compare;
const subheading = "font-heading text-2xl leading-none font-extrabold uppercase";

export const metadata: Metadata = {
  title: copy.title,
  description: `${list(comparePlayers.map((p) => p.name))} compared by ${list(compareFormats.map((f) => f.label))}: ${list(
    MEASURES.map((m) => m.label.toLowerCase()),
  )} side by side.`,
};

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { a, b, format } = readSelection(await searchParams);
  const playerA = comparePlayers.find((p) => p.id === a)!;
  const playerB = comparePlayers.find((p) => p.id === b)!;
  const formatLabel = compareFormats.find((f) => f.id === format)!.label;
  const rowA = rowFor(playerA, format);
  const rowB = rowFor(playerB, format);
  const axes = rowA && rowB ? radarAxes(rowA, rowB) : [];
  const absent = [...(rowA ? [] : [playerA]), ...(rowB ? [] : [playerB])];
  // The pages the shown rows came from.
  const sources = [
    { player: playerA, row: rowA },
    { player: playerB, row: rowB },
  ].filter((s) => s.row);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <SectionHeading as="h1" title={copy.title} lead={copy.lead} />

      <CompareControls
        a={a}
        b={b}
        format={format}
        players={comparePlayers.map((p) => ({ id: p.id, name: p.name }))}
        formats={compareFormats}
      >
        <section className="mt-10" aria-labelledby="result-heading">
          <h2 id="result-heading" className="font-heading text-3xl leading-none font-black uppercase sm:text-4xl">
            {playerA.name} <span className="text-muted-foreground">v</span> {playerB.name}
            <span className="text-muted-foreground"> / {formatLabel}</span>
          </h2>

          {/* One live region for both outcomes, so a change is announced whichever way it goes. */}
          <p aria-live="polite" className={cn("mt-4 max-w-3xl", rowA && rowB ? "text-lg" : "max-w-2xl border border-border bg-card p-4")}>
            {rowA && rowB
              ? summaryFor(playerA, rowA, playerB, rowB)
              : `${list(absent.map((p) => p.name))} ${absent.length > 1 ? "have" : "has"} no ${formatLabel} figures in this data, so there is nothing to compare. Pick another format or player.`}
          </p>

          {rowA && rowB && (
            <>
              <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
                <div>
                  <h3 className={`${subheading} mb-4`}>Side by side</h3>
                  <CompareBars
                    sides={[
                      { player: playerA, row: rowA, fill: "bg-compare-a" },
                      { player: playerB, row: rowB, fill: "bg-compare-b" },
                    ]}
                  />
                </div>

                <div>
                  <h3 className={`${subheading} mb-4`}>Radar</h3>
                  {axes.length >= 3 ? (
                    // Hidden from screen readers: the bars beside it carry every value.
                    <div aria-hidden>
                      <ul className="mb-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                        <li className="flex items-center gap-2">
                          <span className="h-0 w-6 border-t-2 border-compare-a" />
                          {playerA.name}, solid line
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="h-0 w-6 border-t-2 border-dashed border-compare-b" />
                          {playerB.name}, dashed line
                        </li>
                      </ul>
                      <CompareRadar axes={axes} nameA={playerA.name} nameB={playerB.name} />
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Too few shared measures to draw a radar.</p>
                  )}
                  <p className="mt-3 max-w-xl text-sm text-muted-foreground">{copy.radarNote}</p>
                </div>
              </div>

              {(!rowA.verified || !rowB.verified) && <UnverifiedNote />}
            </>
          )}
        </section>
      </CompareControls>

      <section className="mt-16 max-w-3xl" aria-labelledby="era-heading">
        <h2 id="era-heading" className={`${subheading} mb-3`}>
          {copy.eraHeading}
        </h2>
        <div className="grid gap-3 text-muted-foreground">
          {copy.eraNote.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </section>

      <p className="mt-8 text-sm text-muted-foreground">
        Sources: ESPNcricinfo Statsguru{sources.length > 0 && " pages for"}
        {sources.map((s, i) => (
          <span key={s.player.id}>
            {i === 0 ? " " : " and "}
            <a href={s.row!.source} className="text-foreground underline underline-offset-4" rel="noopener noreferrer" target="_blank">
              {s.player.name} ({formatLabel})
            </a>
          </span>
        ))}
        . Retrieved {formatDate(compareRetrieved)}.
      </p>
    </div>
  );
}
