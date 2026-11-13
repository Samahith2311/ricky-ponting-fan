"use client";

import { CartesianGrid, Line, LineChart, ReferenceDot, ReferenceLine, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";

/** `over` is decimal overs (14.5 is 14 and a half); `rate` is Australia's runs per over at that point. */
export type RatePoint = { over: number; rate: number };
export type RateMark = { over: number; label: string };

const config = { done: { label: "Played", color: "var(--chart-1)" }, ahead: { label: "To come", color: "var(--muted-foreground)" } } satisfies ChartConfig;
const axis = { tickLine: false, axisLine: false } as const;

/** The whole innings as a faint line, the part already played in colour, and a dot at the current ball. */
export function InningsChart({ points, current, marks }: { points: RatePoint[]; current: number; marks: RateMark[] }) {
  const data = points.map((p, i) => ({ ...p, done: i <= current ? p.rate : null, ahead: i >= current ? p.rate : null }));
  const now = points[current];
  // Whole overs only, about six of them, so labels never repeat or round to the wrong over.
  const first = Math.ceil(points[0].over);
  const step = Math.max(1, Math.ceil((Math.floor(points.at(-1)!.over) - first) / 6));
  const ticks = Array.from({ length: Math.floor((points.at(-1)!.over - first) / step) + 1 }, (_, k) => first + k * step);

  return (
    <ChartContainer config={config} className="aspect-auto h-56 w-full">
      <LineChart data={data} margin={{ top: 20, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="over" type="number" domain={["dataMin", "dataMax"]} ticks={ticks} interval={0} {...axis} tickMargin={8} />
        <YAxis {...axis} width={32} domain={[0, "auto"]} allowDecimals={false} />
        {marks.map((m) => (
          <ReferenceLine key={m.label} x={m.over} stroke="var(--muted-foreground)" strokeDasharray="3 3" label={{ value: m.label, position: "top", fill: "var(--muted-foreground)", fontSize: 11 }} />
        ))}
        <Line dataKey="ahead" stroke="var(--color-ahead)" strokeWidth={2} dot={false} isAnimationActive={false} />
        <Line dataKey="done" stroke="var(--color-done)" strokeWidth={3} dot={false} isAnimationActive={false} />
        <ReferenceDot x={now.over} y={now.rate} r={5} fill="var(--color-done)" stroke="var(--card)" strokeWidth={2} />
      </LineChart>
    </ChartContainer>
  );
}
