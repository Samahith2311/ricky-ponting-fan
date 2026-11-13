import type { Metadata } from "next";
import { HonourCard, isRankingVerified, RankingCard } from "@/components/record-cards";
import { RecordsFilter } from "@/components/records-filter";
import { SectionHeading } from "@/components/section-heading";
import { UnverifiedNote } from "@/components/unverified-mark";
import { honours, rankings } from "@/lib/data";
import { site } from "@/lib/site";

const copy = site.pages.records;

// rankings.json has no category field: its all-time lists are records, so they file under the same heading.
const RANKING_CATEGORY = "Records";

export const metadata: Metadata = {
  title: copy.title,
  description: `${site.subject} is first in ${rankings.filter((r) => r.rank === 1).length} of ${rankings.length} all-time lists, with ${honours.length} awards, honours, hall of fame entries and records.`,
};

export default function Page() {
  const items = [
    ...rankings.map((ranking) => ({
      id: `ranking-${ranking.id}`,
      category: RANKING_CATEGORY,
      card: <RankingCard ranking={ranking} />,
    })),
    ...honours.map((honour) => ({
      id: `honour-${honour.id}`,
      category: honour.category,
      card: <HonourCard honour={honour} />,
    })),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <SectionHeading as="h1" title={copy.title} lead={copy.lead} />
      <RecordsFilter items={items} />
      {(!rankings.every(isRankingVerified) || !honours.every((h) => h.verified)) && <UnverifiedNote />}
    </div>
  );
}
