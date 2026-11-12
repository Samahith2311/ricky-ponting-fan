import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CoachingStints } from "@/components/coaching-stints";
import { FormatPage } from "@/components/format-page";
import { formatCopy, formatData } from "@/lib/data";
import { site } from "@/lib/site";

type Props = { params: Promise<{ format: string }> };

// Only /test, /odi, /t20i and /ipl exist; anything else at this level is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(formatData).map((format) => ({ format }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { format } = await params;
  const data = formatData[format];
  if (!data) return {};
  const { matches, runs, average } = data.summary;
  return {
    title: `${formatCopy[format].title} record`,
    description: `${site.subject} in ${formatCopy[format].title}: ${runs.toLocaleString("en-AU")} runs at ${average?.toFixed(2)} in ${matches} matches, with year-by-year, opponent and home-and-away splits.`,
  };
}

export default async function Page({ params }: Props) {
  const { format } = await params;
  const data = formatData[format];
  if (!data) notFound();

  return (
    <FormatPage data={data} copy={formatCopy[format]}>
      {format === "ipl" && <CoachingStints />}
    </FormatPage>
  );
}
