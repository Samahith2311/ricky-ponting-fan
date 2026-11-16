import { formatCopy, formatData } from "@/lib/data";
import { ogCard } from "@/lib/og";
import { site } from "@/lib/site";
import { fixed } from "@/lib/utils";

export { alt, contentType, size } from "@/lib/og";

// Built once per page at build time, like the page itself. No card for a page that does not exist.
export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(formatData).map((format) => ({ format }));

export default async function Image({ params }: { params: Promise<{ format: string }> }) {
  const { format } = await params;
  const data = formatData[format];
  if (!data) return ogCard({ title: site.name });
  const { runs, average, hundreds } = data.summary;
  return ogCard({
    title: formatCopy[format].title,
    kicker: `${site.subject}, ${data.summary.span?.replace("-", " to ")}`,
    plates: [
      { label: "Runs", value: runs },
      { label: "Average", value: fixed(average) },
      { label: "Hundreds", value: hundreds },
    ],
  });
}
