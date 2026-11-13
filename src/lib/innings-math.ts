import type { Innings } from "./types";

/** The part of a point the player needs. `verified` is false for a reconstructed point. */
export type Frame = { n: number; team: number; wickets: number; runs: number; balls: number; fours: number; sixes: number; verified: boolean };

/** A key moment: a point in the innings with a caption. */
export type Moment = { id: string; index: number; label: string; text: string; verified: boolean };

/** Cricket notation: 14 overs and 3 balls is "14.3". */
export const oversLabel = (n: number, ballsPerOver: number) => `${Math.floor(n / ballsPerOver)}.${n % ballsPerOver}`;

/** Runs per over so far. */
export const runRate = (frame: Frame, ballsPerOver: number) =>
  frame.n === 0 ? 0 : (frame.team * ballsPerOver) / frame.n;

/** "140*" for an unbeaten score, "140" otherwise. */
export const scoreText = (f: Innings["final"]) => `${f.runs}${f.notOut ? "*" : ""}`;

/** Arrival, each milestone the ball data reaches, and the finish. Captions come from the file. */
export function keyMoments(innings: Innings): Moment[] {
  const { points, milestones, captions, final } = innings;
  const last = points.length - 1;
  const reached = milestones.flatMap((m) => {
    const index = points.findIndex((p) => p.runs >= m.runs);
    return index < 0 ? [] : [{ id: `runs-${m.runs}`, index, label: m.label, text: m.text, verified: m.verified && points[index].verified }];
  });
  return [
    { id: "arrival", index: 0, label: "Arrival", text: captions.arrival, verified: points[0].verified },
    ...reached,
    { id: "end", index: last, label: final.notOut ? "Not out" : "Out", text: captions.end, verified: points[last].verified && final.verified },
  ].sort((a, b) => a.index - b.index);
}
