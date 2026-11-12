import Link from "next/link";
import { nav, site } from "@/lib/site";
import { MobileNav } from "./mobile-nav";
import { NavLink } from "./nav-link";
import { ThemeToggle } from "./theme-toggle";

/** Three stumps and two bails. */
function StumpsMark() {
  return (
    <svg viewBox="0 0 18 20" className="h-5 w-auto text-score" fill="currentColor" aria-hidden>
      <rect x="1" y="4" width="3" height="16" />
      <rect x="7.5" y="4" width="3" height="16" />
      <rect x="14" y="4" width="3" height="16" />
      <rect x="0" y="0" width="8.5" height="2" />
      <rect x="9.5" y="0" width="8.5" height="2" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-heading text-2xl leading-none font-black uppercase">
          <StumpsMark />
          <span className="sm:hidden">{site.shortName}</span>
          <span className="hidden sm:inline">{site.name}</span>
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex">
            {nav.map((item) => (
              <li key={item.href}>
                <NavLink href={item.href}>{item.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center">
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
