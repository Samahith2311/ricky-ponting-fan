import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InningsCredit } from "@/components/innings-credit";
import { InningsPlayer } from "@/components/innings-player";
import { SectionHeading } from "@/components/section-heading";
import { ShareButton } from "@/components/share-button";
import { UnverifiedMark, UnverifiedNote } from "@/components/unverified-mark";
import { formatDate } from "@/lib/data";
import { allInnings, findInnings } from "@/lib/innings";
import { keyMoments, scoreText } from "@/lib/innings-math";
import { site, siteUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

// An unknown slug is a 404; every file in src/data/innings gets a page at build time.
export const dynamicParams = false;
export const generateStaticParams = () => allInnings().map((i) => ({ slug: i.id }));

const heading = (i: NonNullable<ReturnType<typeof findInnings>>) => `${scoreText(i.final)} v ${i.opponent}, ${i.title}`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const i = findInnings((await params).slug);
  if (!i) notFound();
  return {
    title: heading(i),
    description: `${i.batter}'s ${scoreText(i.final)} off ${i.final.balls} balls v ${i.opponent} at ${i.venue}, with ${i.final.fours} fours and ${i.final.sixes} sixes, replayed ball by ball.`,
  };
}

export default async function Page({ params }: Props) {
  const i = findInnings((await params).slug);
  if (!i) notFound();

  // The client gets the numbers it draws, without the citation repeated on every point.
  const frames = i.points.map(({ n, team, wickets, runs, balls, fours, sixes, verified }) => ({ n, team, wickets, runs, balls, fours, sixes, verified }));
  const reconstructed =
    !i.final.verified ||
    (i.result && !i.result.verified) ||
    i.points.some((p) => !p.verified) ||
    i.milestones.some((m) => !m.verified);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <SectionHeading
        as="h1"
        title={i.title}
        lead={
          <>
            {heading(i)}, at {i.venue} on {formatDate(i.date)}.
            {i.result && (
              <>
                {" "}
                {i.result.winner} won by {i.result.margin} {i.result.by}.{!i.result.verified && <UnverifiedMark />}
              </>
            )}
          </>
        }
        action={<ShareButton title={`${i.title}: ${site.subject} replay`} url={`${siteUrl}/innings/${i.id}`} />}
      />

      <InningsPlayer
        batter={i.batter}
        team={i.team}
        opponent={i.opponent}
        notOut={i.final.notOut}
        ballsPerOver={i.final.ballsPerOver}
        frames={frames}
        moments={keyMoments(i)}
      />

      {reconstructed && <UnverifiedNote />}

      <p className="mt-8 max-w-3xl text-sm text-muted-foreground">
        <InningsCredit credit={i.credit} />
        {i.credit.checkedAgainst.length > 0 && (
          <>
            {" "}
            Totals checked against ESPNcricinfo Statsguru:{" "}
            {i.credit.checkedAgainst.map((url, n) => (
              <span key={url}>
                {n > 0 && ", "}
                <a href={url} className="text-foreground underline underline-offset-4" rel="noopener noreferrer" target="_blank">
                  {n === 0 ? "his innings" : "the team innings"}
                </a>
              </span>
            ))}
            .
          </>
        )}{" "}
        Retrieved {formatDate(i.retrieved)}.
      </p>
    </div>
  );
}
