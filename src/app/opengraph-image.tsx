import { international } from "@/lib/data";
import { ogCard } from "@/lib/og";
import { site } from "@/lib/site";

export { alt, contentType, size } from "@/lib/og";

export default function Image() {
  return ogCard({
    title: site.subject,
    kicker: `${site.country}, ${international.from} to ${international.to}`,
    plates: [
      { label: "Intl runs", value: international.runs },
      { label: "Hundreds", value: international.hundreds },
      { label: "Matches", value: international.matches },
    ],
  });
}
