import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { site } from "@/lib/site";
import { statPages } from "@/lib/stats-pages";

const copy = site.pages.stats;

export const metadata: Metadata = { title: copy.title, description: copy.lead };

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <SectionHeading as="h1" title={copy.title} lead={copy.lead} />
      <ul className="border-t border-border">
        {statPages.map((p) => (
          <li key={p.slug} className="border-b border-border">
            <Link href={`/stats/${p.slug}`} className="group grid items-baseline gap-x-8 gap-y-1 py-4 sm:grid-cols-[18rem_1fr_auto]">
              <span className="font-heading text-3xl leading-none font-extrabold uppercase group-hover:text-score">{p.heading}</span>
              <span className="text-muted-foreground">{p.question}</span>
              <ArrowRightIcon className="hidden size-5 self-center text-muted-foreground sm:block" weight="bold" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
