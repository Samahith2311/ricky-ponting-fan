"use client";

import { motion, useScroll } from "motion/react";
import { useRef, useSyncExternalStore } from "react";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribe(notify: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
}

/** The server render and the first client render both answer "reduced", so they match; the real answer follows. */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => true,
  );
}

/** Fills the rail from the top as the list scrolls past. Only mounted when motion is allowed. */
function ProgressLine({ target }: { target: React.RefObject<HTMLElement | null> }) {
  const { scrollYProgress } = useScroll({ target, offset: ["start 65%", "end 65%"] });
  return (
    <motion.span
      aria-hidden
      style={{ scaleY: scrollYProgress }}
      className="absolute top-0 bottom-0 left-[5px] w-0.5 origin-top bg-score"
    />
  );
}

/**
 * The rail behind a list of events. With motion allowed, a heavier line grows down it with the
 * scroll position. With reduced motion it is the plain rail: no progress line, nothing animated.
 * The list itself is passed in as children and stays server-rendered.
 */
export function TimelineRail({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  return (
    <div ref={ref} className="relative">
      <span aria-hidden className="absolute top-0 bottom-0 left-[5px] w-0.5 bg-border" />
      {!reduced && <ProgressLine target={ref} />}
      {children}
    </div>
  );
}
