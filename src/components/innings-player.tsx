"use client";

import { ArrowCounterClockwiseIcon, PauseIcon, PlayIcon } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { InningsChart } from "@/components/charts";
import { ScoreboardCounter } from "@/components/scoreboard-counter";
import { Button } from "@/components/ui/button";
import { UnverifiedMark } from "@/components/unverified-mark";
import { type Frame, type Moment, oversLabel, runRate } from "@/lib/innings-math";
import { cn } from "@/lib/utils";

/** One step per legal ball. A step is a timer tick, not an animation, so reduced motion plays it the same way. */
const TICK_MS = 90;

const label = "font-heading text-base leading-none font-bold tracking-wide text-muted-foreground uppercase";
const plates = "text-4xl sm:text-5xl";

type Props = {
  batter: string;
  team: string;
  opponent: string;
  notOut: boolean;
  ballsPerOver: number;
  frames: Frame[];
  moments: Moment[];
};

/** Plays an innings back: board, caption, scrubber, key moments and run-rate chart all follow one index. */
export function InningsPlayer({ batter, team, opponent, notOut, ballsPerOver, frames, moments }: Props) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const last = frames.length - 1;

  useEffect(() => {
    if (!playing) return;
    if (index >= last) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setIndex(index + 1), TICK_MS);
    return () => clearTimeout(timer);
  }, [playing, index, last]);

  const frame = frames[index];
  const moment = moments.filter((m) => m.index <= index).at(-1)!;
  // Rounded here so the screen-reader text of the counters matches the digits on the plates.
  const round = (value: number, places: number) => Number(value.toFixed(places));
  const rate = round(runRate(frame, ballsPerOver), 2);
  const strikeRate = round(frame.balls === 0 ? 0 : (frame.runs * 100) / frame.balls, 1);
  const overs = oversLabel(frame.n, ballsPerOver);
  const running = playing && index < last;
  const status = index === last ? (notOut ? "Not out" : "Out") : "Batting";

  const rates = useMemo(
    () => frames.map((f) => ({ over: f.n / ballsPerOver, rate: runRate(f, ballsPerOver) })),
    [frames, ballsPerOver],
  );
  const marks = moments
    .filter((m) => m.index > 0 && m.index < last)
    .map((m) => ({ over: frames[m.index].n / ballsPerOver, label: m.label }));

  const toggle = () => {
    if (running) return setPlaying(false);
    if (index >= last) setIndex(0);
    setPlaying(true);
  };
  const jump = (to: number) => {
    setPlaying(false);
    setIndex(to);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-10">
      <div className="grid content-start gap-4">
        {/* The board keeps its night colours in the light theme: scoreboards are black in daylight too. */}
        <div className="dark no-roll border border-border bg-card text-foreground">
          <div className="flex items-baseline justify-between gap-4 border-b border-border px-4 py-3 font-heading text-xl font-bold tracking-wide uppercase">
            <h2>
              {batter} v {opponent}
            </h2>
            <span className="text-muted-foreground">
              {status}
              {!frame.verified && <UnverifiedMark />}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
            <p className="font-heading text-2xl leading-none font-bold uppercase sm:text-3xl">Runs</p>
            <ScoreboardCounter value={frame.runs} className="text-5xl sm:text-6xl" />
          </div>

          <dl className="grid grid-cols-2 gap-px border-b border-border bg-border sm:grid-cols-4">
            {[
              { name: "Balls", value: frame.balls, decimals: 0 },
              { name: "Fours", value: frame.fours, decimals: 0 },
              { name: "Sixes", value: frame.sixes, decimals: 0 },
              { name: "Strike rate", value: strikeRate, decimals: 1 },
            ].map((stat) => (
              <div key={stat.name} className="flex flex-col gap-2 bg-card p-3">
                <dt className={label}>{stat.name}</dt>
                <dd>
                  <ScoreboardCounter value={stat.value} decimals={stat.decimals} className={plates} />
                </dd>
              </div>
            ))}
          </dl>

          <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
            <p className="font-heading text-2xl leading-none font-bold uppercase sm:text-3xl">{team}</p>
            <p className="flex items-center gap-1.5">
              <ScoreboardCounter value={frame.team} className="text-5xl sm:text-6xl" />
              <span aria-hidden className="font-heading text-4xl font-black text-muted-foreground">
                /
              </span>
              <ScoreboardCounter value={frame.wickets} className="text-5xl sm:text-6xl" />
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-px border-b border-border bg-border">
            <div className="flex flex-col gap-2 bg-card p-3">
              <dt className={label}>Overs</dt>
              <dd className="font-heading text-4xl leading-none font-black text-score tabular-nums sm:text-5xl">
                {overs}
              </dd>
            </div>
            <div className="flex flex-col gap-2 bg-card p-3">
              <dt className={label}>Run rate</dt>
              <dd>
                <ScoreboardCounter value={rate} decimals={2} className={plates} />
              </dd>
            </div>
          </dl>

          {/* Announced politely when the moment changes, so a screen reader hears "Fifty up" and not every ball. */}
          <div aria-live="polite" aria-atomic="true" className="px-4 py-3">
            <p className="font-heading text-2xl leading-none font-extrabold text-score uppercase">
              {moment.label}
              {!moment.verified && <UnverifiedMark />}
            </p>
            <p className="mt-1 text-muted-foreground">{moment.text}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={toggle}
            className="h-12 min-w-32 px-5 font-heading text-xl font-extrabold tracking-wide uppercase"
          >
            {running ? (
              <PauseIcon aria-hidden weight="fill" />
            ) : index >= last ? (
              <ArrowCounterClockwiseIcon aria-hidden weight="bold" />
            ) : (
              <PlayIcon aria-hidden weight="fill" />
            )}
            {running ? "Pause" : index >= last ? "Replay" : "Play"}
          </Button>
          <input
            type="range"
            min={0}
            max={last}
            value={index}
            onChange={(e) => jump(Number(e.target.value))}
            aria-label="Position in the innings"
            aria-valuetext={`Over ${overs}, ${team} ${frame.team} for ${frame.wickets}, ${batter} ${frame.runs} off ${frame.balls} balls`}
            className="h-12 min-w-0 flex-1 cursor-pointer accent-primary"
          />
        </div>
      </div>

      <div className="grid content-start gap-8">
        <section aria-labelledby="moments-heading">
          <h2 id="moments-heading" className="mb-3 font-heading text-2xl leading-none font-extrabold uppercase">
            Key moments
          </h2>
          <ol className="grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4 lg:grid-cols-2">
            {moments.map((m) => {
              const active = m.id === moment.id;
              return (
                <li key={m.id} className="bg-card">
                  <button
                    type="button"
                    onClick={() => jump(m.index)}
                    aria-current={active || undefined}
                    className={cn(
                      "flex h-full w-full flex-col items-start gap-1 border-l-4 px-3 py-3 text-left hover:bg-muted",
                      active ? "border-score" : "border-transparent",
                    )}
                  >
                    <span className="font-heading text-xl leading-none font-extrabold uppercase">
                      {m.label}
                      {!m.verified && <UnverifiedMark />}
                    </span>
                    <span className="text-sm text-muted-foreground">Over {oversLabel(frames[m.index].n, ballsPerOver)}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>

        <figure>
          <figcaption className="mb-3 font-heading text-xl font-bold tracking-wide uppercase">
            Run rate
            <span className="ml-3 font-sans text-sm font-normal tracking-normal text-muted-foreground normal-case">
              {team}, runs per over. The figure is on the board.
            </span>
          </figcaption>
          <div aria-hidden>
            <InningsChart points={rates} current={index} marks={marks} />
          </div>
        </figure>
      </div>
    </div>
  );
}
