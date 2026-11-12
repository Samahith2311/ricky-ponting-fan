"use client";

import { useInView } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

type Props = {
  value: number;
  decimals?: number;
  /** Set the size with a text-* class; plates scale with the font size. */
  className?: string;
};

/**
 * A number on scoreboard plates. Each digit is a strip of 0-9 that rolls to its
 * value when the counter scrolls into view. The rolling is CSS (see globals.css),
 * so reduced-motion and no-JS visitors get the final number straight away.
 */
export function ScoreboardCounter({ value, decimals = 0, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const text = value.toFixed(decimals);

  return (
    <span ref={ref} data-rolling={inView} className={cn("inline-flex font-heading leading-none font-black", className)}>
      <span className="sr-only">{value.toLocaleString("en-AU", { minimumFractionDigits: decimals })}</span>
      <span aria-hidden className="inline-flex items-end gap-[0.07em]">
        {text.split("").map((char, i) =>
          char === "." ? (
            <span key={i} className="px-[0.02em] text-aus-gold">
              .
            </span>
          ) : (
            <span key={i} className="plate">
              <span
                className="digit-strip"
                style={{ "--d": char, transitionDelay: `${i * 70}ms` } as React.CSSProperties}
              >
                {DIGITS.map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </span>
            </span>
          ),
        )}
      </span>
    </span>
  );
}
