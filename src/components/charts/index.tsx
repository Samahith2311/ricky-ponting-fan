"use client";

import { useInView } from "motion/react";
import dynamic from "next/dynamic";
import { useRef } from "react";
import type { YearPoint } from "./year-charts";

const YearChartsImpl = dynamic(() => import("./year-charts").then((m) => m.YearCharts), { ssr: false });

/**
 * Recharts is only downloaded once the chart scrolls into view, so pages stay light
 * and a chart inside a hidden tab never renders at zero width.
 */
export function YearCharts(props: { data: YearPoint[]; careerAverage: number | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "200px" });
  return (
    // Height matches the two charts inside, so nothing jumps when they load.
    <div ref={ref} className="min-h-[38rem]">
      {inView && <YearChartsImpl {...props} />}
    </div>
  );
}
