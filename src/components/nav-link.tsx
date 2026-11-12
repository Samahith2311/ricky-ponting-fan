"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const active = usePathname().startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className="-mb-px flex h-14 items-center border-b-2 border-transparent px-3 font-heading text-lg font-bold tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground aria-[current=page]:border-score aria-[current=page]:text-foreground"
    >
      {children}
    </Link>
  );
}
