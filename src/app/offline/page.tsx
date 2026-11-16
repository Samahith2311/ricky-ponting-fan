import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { site } from "@/lib/site";

const copy = site.pages.offline;

// Served by public/sw.js when a page is requested with no network and no saved copy.
export const metadata: Metadata = { title: copy.title, robots: { index: false } };

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <SectionHeading as="h1" title={copy.title} lead={copy.lead} />
    </div>
  );
}
