"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export type YearPoint = { year: number; runs: number; average: number | null };

const config = {
  runs: { label: "Runs", color: "var(--chart-1)" },
  average: { label: "Average", color: "var(--chart-1)" },
} satisfies ChartConfig;

const caption = "mb-3 font-heading text-xl font-bold tracking-wide uppercase";
const note = "ml-3 font-sans text-sm font-normal tracking-normal text-muted-foreground normal-case";
const axis = { tickLine: false, axisLine: false } as const;

/**
 * Runs and average share a time axis but not a scale, so they are two charts,
 * never one chart with two y-axes. The table below each chart carries every value.
 */
export function YearCharts({ data, careerAverage }: { data: YearPoint[]; careerAverage: number | null }) {
  const peak = data.reduce((a, b) => (b.runs > a.runs ? b : a));
  const yearLabel = (_: unknown, payload: readonly { payload?: YearPoint }[]) => payload[0]?.payload?.year;

  return (
    <div className="grid gap-8">
      <figure>
        <figcaption className={caption}>
          Runs by year
          {/* The one value worth calling out; the axis, tooltip and table carry the rest. */}
          <span className={note}>
            Peak {peak.runs.toLocaleString("en-AU")} in {peak.year}
          </span>
        </figcaption>
        <ChartContainer config={config} className="aspect-auto h-64 w-full">
          <BarChart accessibilityLayer data={data} margin={{ top: 20, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="year" {...axis} tickMargin={8} minTickGap={12} />
            <YAxis {...axis} width={44} tickFormatter={(v: number) => v.toLocaleString("en-AU")} />
            <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent labelFormatter={yearLabel} />} />
            <Bar dataKey="runs" fill="var(--color-runs)" radius={[4, 4, 0, 0]} maxBarSize={24} />
          </BarChart>
        </ChartContainer>
      </figure>

      <figure>
        <figcaption className={caption}>
          Average by year
          {careerAverage !== null && <span className={note}>Rule marks the career average, {careerAverage.toFixed(2)}</span>}
        </figcaption>
        <ChartContainer config={config} className="aspect-auto h-64 w-full">
          <LineChart accessibilityLayer data={data} margin={{ top: 20, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="year" {...axis} tickMargin={8} minTickGap={12} />
            <YAxis {...axis} width={44} domain={[0, "auto"]} />
            <ChartTooltip content={<ChartTooltipContent labelFormatter={yearLabel} />} />
            {careerAverage !== null && (
              <ReferenceLine y={careerAverage} stroke="var(--muted-foreground)" />
            )}
            <Line
              dataKey="average"
              stroke="var(--color-average)"
              strokeWidth={2}
              // The ring in the surface colour keeps each dot readable where it sits on the line.
              dot={{ r: 4, fill: "var(--color-average)", stroke: "var(--card)", strokeWidth: 2 }}
              activeDot={{ r: 6, stroke: "var(--card)", strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ChartContainer>
      </figure>
    </div>
  );
}
