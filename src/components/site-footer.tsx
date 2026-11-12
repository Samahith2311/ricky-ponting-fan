import Link from "next/link";
import { formatDate, retrieved } from "@/lib/data";
import { footerNav, site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-[1.5fr_1fr]">
        <div>
          <p className="font-heading text-2xl leading-none font-black uppercase">{site.name}</p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">{site.disclaimer}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Statistics from{" "}
            <a
              href="https://stats.espncricinfo.com/ci/engine/player/7133.html?class=11;type=allround"
              className="text-foreground underline underline-offset-4"
              rel="noopener noreferrer"
              target="_blank"
            >
              ESPNcricinfo Statsguru
            </a>
            , retrieved {formatDate(retrieved)}.
          </p>
        </div>

        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-6 font-heading text-lg font-bold tracking-wide uppercase">
            {footerNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="block py-1.5 text-muted-foreground hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
