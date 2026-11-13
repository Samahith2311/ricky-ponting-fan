import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { TimelineRail } from "@/components/timeline-rail";
import { UnverifiedMark, UnverifiedNote } from "@/components/unverified-mark";
import type { TimelineEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

/** "1996", "Nov 1992" or "15 Feb 1995", depending on how much of the date is known. */
function when(date: string) {
  if (date.length === 4) return date;
  return new Date(date).toLocaleDateString("en-AU", {
    ...(date.length === 10 && { day: "numeric" }),
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

type Props = {
  events: TimelineEvent[];
  /** Level of each event title: h2 on a page of its own, h3 under a section heading. */
  headingLevel?: "h2" | "h3";
};

/** Career events on a vertical rail (TimelineRail draws the scroll-linked progress line). */
export function CareerTimeline({ events, headingLevel: Heading = "h3" }: Props) {
  return (
    <>
      <TimelineRail>
        <ol>
          {events.map((event) => (
            <li key={event.id} className="relative pb-10 pl-9 last:pb-0">
              <span
                aria-hidden
                className={cn(
                  "absolute top-1 left-0 size-3 border-2",
                  event.major ? "border-foreground bg-aus-gold" : "border-muted-foreground bg-background",
                )}
              />
              <div className="grid gap-x-8 gap-y-1 sm:grid-cols-[9rem_minmax(0,1fr)]">
                <p className="font-heading text-xl leading-none font-bold tracking-wide text-muted-foreground uppercase sm:pt-1.5">
                  <time dateTime={event.date}>{when(event.date)}</time>
                </p>
                <div>
                  <Heading className="font-heading text-3xl leading-none font-black uppercase">
                    {event.major && <span className="sr-only">Milestone: </span>}
                    {event.title}
                    {!event.verified && <UnverifiedMark />}
                  </Heading>
                  <p className="mt-2 max-w-prose text-muted-foreground">{event.text}</p>
                  <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    {event.href && (
                      <Link
                        href={event.href}
                        className="inline-flex items-center gap-1 text-foreground underline underline-offset-4"
                      >
                        More<span className="sr-only"> about {event.title}</span>
                        <ArrowRightIcon aria-hidden className="size-4" weight="bold" />
                      </Link>
                    )}
                    <a
                      href={event.source}
                      className="text-muted-foreground underline underline-offset-4"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Source<span className="sr-only"> for {event.title}</span>
                    </a>
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </TimelineRail>
      {!events.every((event) => event.verified) && <UnverifiedNote />}
    </>
  );
}
