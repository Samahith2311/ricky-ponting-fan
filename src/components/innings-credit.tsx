import type { Innings } from "@/lib/types";

const link = "text-foreground underline underline-offset-4";

/** The licence notice for data taken from Cricsheet (Open Data Commons Attribution License, section 4.3). */
export function InningsCredit({ credit }: { credit: Innings["credit"] }) {
  return (
    <>
      Contains information from{" "}
      <a href={credit.url} className={link} rel="noopener noreferrer" target="_blank">
        {credit.name}
      </a>
      , made available under the{" "}
      <a href={credit.licenceUrl} className={link} rel="noopener noreferrer" target="_blank">
        {credit.licence}
      </a>
      .
    </>
  );
}
