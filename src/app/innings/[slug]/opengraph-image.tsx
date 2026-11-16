import { allInnings, findInnings } from "@/lib/innings";
import { scoreText } from "@/lib/innings-math";
import { ogCard, pageCard } from "@/lib/og";

export { alt, contentType, size } from "@/lib/og";

// Built once per page at build time, like the page itself. No card for a page that does not exist.
export const dynamicParams = false;
export const generateStaticParams = () => allInnings().map((i) => ({ slug: i.id }));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const i = findInnings((await params).slug);
  if (!i) return pageCard("innings");
  return ogCard({
    title: i.title,
    kicker: `${i.batter} v ${i.opponent}, ${i.venue}`,
    plates: [
      { label: "Runs", value: scoreText(i.final) },
      { label: "Balls", value: i.final.balls },
      { label: "Fours", value: i.final.fours },
      { label: "Sixes", value: i.final.sixes },
    ],
  });
}
