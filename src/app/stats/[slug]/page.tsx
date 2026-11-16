import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BattingTable } from "@/components/batting-table";
import { CaptainRecord } from "@/components/captain-record";
import { JsonLd } from "@/components/json-ld";
import { SectionHeading } from "@/components/section-heading";
import { ShareButton } from "@/components/share-button";
import { UnverifiedNote } from "@/components/unverified-mark";
import { formatDate } from "@/lib/data";
import { site, siteUrl } from "@/lib/site";
import { findStatPage, statPages } from "@/lib/stats-pages";

type Props = { params: Promise<{ slug: string }> };

const copy = site.pages.stats;
const textLink = "text-foreground underline underline-offset-4";

// An unknown slug is a 404; every question in src/lib/stats-pages.ts gets a page at build time.
export const dynamicParams = false;
export const generateStaticParams = () => statPages.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = findStatPage((await params).slug);
  if (!page) notFound();
  return { title: page.question, description: page.answers[0] };
}

export default async function Page({ params }: Props) {
  const page = findStatPage((await params).slug);
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [{ "@type": "Question", name: page.question, acceptedAnswer: { "@type": "Answer", text: page.answers.join(" ") } }],
        }}
      />
      <SectionHeading as="h1" title={page.heading} lead={page.question} />

      <div className="max-w-3xl space-y-3 text-lg">
        {page.answers.map((answer) => (
          <p key={answer}>{answer}</p>
        ))}
      </div>
      {!page.verified && <UnverifiedNote />}
      <div className="mt-6">
        <ShareButton title={page.question} url={`${siteUrl}/stats/${page.slug}`} />
      </div>

      <section className="mt-12 grid grid-cols-1 gap-4" aria-labelledby="by-format">
        <h2 id="by-format" className="font-heading text-2xl leading-none font-extrabold uppercase">
          {copy.byFormat}
        </h2>
        {page.kind === "opponent" ? (
          <BattingTable caption={`Batting against ${page.opponent} by format`} firstColumn="Format" rows={page.rows} />
        ) : (
          <CaptainRecord records={page.records} />
        )}
      </section>

      <p className="mt-8 text-sm text-muted-foreground">
        Sources: ESPNcricinfo Statsguru,{" "}
        {page.sources.map((s, i) => (
          <span key={s.label}>
            {i > 0 && ", "}
            <a href={s.url} className={textLink} rel="noopener noreferrer" target="_blank">
              {s.label}
            </a>
          </span>
        ))}
        . Retrieved {formatDate(page.retrieved)}.
      </p>

      <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
        {page.kind === "captain" && (
          <Link href="/captaincy" className={textLink}>
            {copy.captaincyLink}
          </Link>
        )}
        <Link href="/stats" className={textLink}>
          {copy.more}
        </Link>
      </p>
    </div>
  );
}
