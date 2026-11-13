"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { RadarAxis } from "@/lib/compare";

/** Values are already scaled 0 to 100 per axis (see radarAxes); the tooltip prints the real ones. */
export function CompareRadar({ axes, nameA, nameB }: { axes: RadarAxis[]; nameA: string; nameB: string }) {
  const config = {
    a: { label: nameA, color: "var(--compare-a)" },
    b: { label: nameB, color: "var(--compare-b)" },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={config} className="aspect-auto h-80 w-full">
      <RadarChart data={axes} outerRadius="68%">
        <PolarGrid />
        <PolarAngleAxis dataKey="measure" />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_: unknown, payload: readonly { payload?: RadarAxis }[]) => payload[0]?.payload?.measure}
              formatter={(_value, name, item) => {
                const axis = item.payload as RadarAxis;
                return (
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 shrink-0" style={{ background: item.color }} />
                      {name}
                    </span>
                    <span className="font-mono font-medium tabular-nums">{item.dataKey === "a" ? axis.realA : axis.realB}</span>
                  </div>
                );
              }}
            />
          }
        />
        <Radar name={nameA} dataKey="a" stroke="var(--color-a)" fill="var(--color-a)" fillOpacity={0.18} strokeWidth={2} isAnimationActive={false} />
        {/* Dashed, so the two outlines differ by more than colour. */}
        <Radar name={nameB} dataKey="b" stroke="var(--color-b)" fill="var(--color-b)" fillOpacity={0.18} strokeWidth={2} strokeDasharray="6 4" isAnimationActive={false} />
      </RadarChart>
    </ChartContainer>
  );
}
