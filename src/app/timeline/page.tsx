import type { Metadata } from "next";
import { CareerTimeline } from "@/components/career-timeline";
import { SectionHeading } from "@/components/section-heading";
import { timeline } from "@/lib/data";
import { site } from "@/lib/site";

const copy = site.pages.timeline;

export const metadata: Metadata = {
  title: copy.title,
  description: `${timeline.length} events in the career of ${site.subject}, from ${timeline[0].date.slice(0, 4)} to ${timeline.at(-1)!.date.slice(0, 4)}.`,
};

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <SectionHeading as="h1" title={copy.title} lead={copy.lead} />
      <p className="-mt-4 mb-8 text-sm text-muted-foreground">Gold squares mark the milestones shown on the homepage.</p>
      <CareerTimeline events={timeline} headingLevel="h2" />
    </div>
  );
}
