import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {site.disclaimer}
        </p>
      </div>
    </footer>
  );
}
