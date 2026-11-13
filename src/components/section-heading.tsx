type Props = {
  title: string;
  lead?: React.ReactNode;
  /** Right-hand slot, usually a link. */
  action?: React.ReactNode;
  as?: "h1" | "h2" | "h3";
};

/** Board-style heading: condensed caps sitting on a heavy rule. */
export function SectionHeading({ title, lead, action, as: Tag = "h2" }: Props) {
  return (
    <div className="mb-8">
      <div className="flex items-end justify-between gap-4 border-b-2 border-foreground pb-2">
        <Tag className="font-heading text-4xl leading-none font-black uppercase sm:text-5xl">{title}</Tag>
        {action}
      </div>
      {lead && <p className="mt-3 max-w-2xl text-muted-foreground">{lead}</p>}
    </div>
  );
}
