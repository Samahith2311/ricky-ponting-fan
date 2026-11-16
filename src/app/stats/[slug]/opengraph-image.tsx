import { ogCard, pageCard } from "@/lib/og";
import { findStatPage, formatLabel, statPages } from "@/lib/stats-pages";

export { alt, contentType, size } from "@/lib/og";

// Built once per page at build time, like the page itself. No card for a page that does not exist.
export const dynamicParams = false;
export const generateStaticParams = () => statPages.map((p) => ({ slug: p.slug }));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const page = findStatPage((await params).slug);
  if (!page) return pageCard("stats");
  return ogCard({
    title: page.heading,
    kicker: page.question,
    plates:
      page.kind === "opponent"
        ? page.rows.map((r) => ({ label: `${r.label} runs`, value: r.runs }))
        : page.records.map((r) => ({ label: `${formatLabel(r.format)} wins`, value: r.won })),
  });
}
