"use client";

import { ArrowRightIcon, ListIcon, XIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { nav, site } from "@/lib/site";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="size-11 lg:hidden" aria-label="Open menu">
          <ListIcon className="size-6" weight="bold" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" showCloseButton={false} className="gap-0 data-[side=right]:w-full">
        <div className="flex h-14 items-center justify-between border-b border-border pr-1 pl-4">
          <SheetTitle className="font-heading text-2xl font-black uppercase">{site.shortName}</SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
          <SheetClose asChild>
            <Button variant="ghost" className="size-11" aria-label="Close menu">
              <XIcon className="size-6" weight="bold" />
            </Button>
          </SheetClose>
        </div>
        <nav aria-label="Mobile">
          <ul>
            {nav.map((item) => (
              <li key={item.href} className="border-b border-border">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={pathname.startsWith(item.href) ? "page" : undefined}
                  className="flex h-16 items-center justify-between px-4 font-heading text-3xl font-extrabold uppercase aria-[current=page]:text-score"
                >
                  {item.label}
                  <ArrowRightIcon className="size-5 text-muted-foreground" weight="bold" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
