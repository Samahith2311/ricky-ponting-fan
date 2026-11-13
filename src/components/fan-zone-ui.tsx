// Shared bits for the Fan Zone forms.
export const fieldLabel = "mb-1 block font-heading text-base leading-none font-bold tracking-wide text-muted-foreground uppercase";
export const fieldInput = "h-11 w-full border border-input bg-card px-3 text-base aria-[invalid=true]:border-destructive";
export const primaryButton =
  "h-11 border border-foreground bg-foreground px-6 font-heading text-lg font-bold tracking-wide text-background uppercase disabled:opacity-50";
export const secondaryButton =
  "h-11 border border-border px-6 font-heading text-lg font-bold tracking-wide uppercase text-foreground hover:bg-muted";
export const panel = "border border-border bg-card p-4 sm:p-5";

/** Bots fill every field they find. People never see this one, and neither do screen readers or the Tab key. */
export function Honeypot({ id }: { id: string }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor={id}>Leave this field empty</label>
      <input id={id} name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
    </div>
  );
}
