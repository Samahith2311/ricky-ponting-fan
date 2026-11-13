"use client";

import { useEffect, useId, useRef, useState } from "react";
import { panel, primaryButton, secondaryButton } from "@/components/fan-zone-ui";
import { type Poll, postJson, type PollOption } from "@/lib/fan-zone/client";
import { site } from "@/lib/site";

const copy = site.pages.fanZone.polls;
const STORE = "fz-voted";
const REFRESH_MS = 15000;

type Voted = Record<string, number>;

function PollCard({ poll, voted, onResults }: { poll: Poll; voted: number | undefined; onResults: (slug: string, options: PollOption[], optionId: number) => void }) {
  const id = useId();
  const [choice, setChoice] = useState<number | null>(null);
  const [peek, setPeek] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const noteRef = useRef<HTMLParagraphElement>(null);

  const showResults = poll.status === "closed" || voted !== undefined || peek;
  const total = poll.options.reduce((sum, o) => sum + o.votes, 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (choice === null) {
      setError(copy.pick);
      return;
    }
    setBusy(true);
    setError("");
    const res = await postJson("/api/fan-zone/polls/vote", { pollSlug: poll.slug, optionId: choice });
    setBusy(false);
    if (res.ok) {
      onResults(poll.slug, res.data.results as PollOption[], choice);
      setNote(copy.thanks);
    } else if (res.code === "already_voted") {
      onResults(poll.slug, poll.options, 0);
      setNote(copy.alreadyVoted);
    } else {
      setError(res.message);
    }
    // The form goes away after a vote, so keep keyboard focus on the outcome.
    requestAnimationFrame(() => noteRef.current?.focus());
  }

  return (
    <li className={panel}>
      <h3 id={id} className="font-heading text-2xl leading-tight font-extrabold uppercase">
        {poll.question}
        {poll.status === "closed" && <span className="text-muted-foreground"> ({copy.closed})</span>}
      </h3>

      {showResults ? (
        <ul className="mt-4 grid gap-3">
          {poll.options.map((o) => {
            const percent = total === 0 ? 0 : Math.round((o.votes / total) * 100);
            return (
              <li key={o.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <span>
                    {o.label}
                    {voted === o.id && <span className="text-muted-foreground"> ({copy.yourVote})</span>}
                  </span>
                  <span className="font-heading text-lg font-bold">
                    {o.votes} {o.votes === 1 ? copy.vote1 : copy.votes}, {percent}%
                  </span>
                </div>
                <div aria-hidden className="mt-1 h-2 bg-muted">
                  <div className="h-full bg-score motion-safe:transition-[width]" style={{ width: `${percent}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <form onSubmit={submit} className="mt-4" noValidate>
          <div role="radiogroup" aria-labelledby={id} className="grid gap-2">
            {poll.options.map((o) => (
              <label
                key={o.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 border border-border px-3 py-2 has-checked:border-foreground has-checked:bg-muted"
              >
                <input
                  type="radio"
                  name={`poll-${poll.slug}`}
                  value={o.id}
                  checked={choice === o.id}
                  onChange={() => {
                    setChoice(o.id);
                    setError("");
                  }}
                  className="size-5 shrink-0 accent-primary"
                />
                {o.label}
              </label>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="submit" disabled={busy} className={primaryButton}>
              {copy.vote}
            </button>
            <button type="button" onClick={() => setPeek(true)} className={secondaryButton}>
              {copy.seeResults}
            </button>
          </div>
        </form>
      )}

      {peek && voted === undefined && poll.status === "open" && (
        <button type="button" onClick={() => setPeek(false)} className="mt-4 text-foreground underline underline-offset-4">
          {copy.hideResults}
        </button>
      )}
      <p role="alert" className="mt-3 text-destructive empty:hidden">
        {error}
      </p>
      <p role="status" ref={noteRef} tabIndex={-1} className="mt-3 empty:hidden">
        {note}
      </p>
    </li>
  );
}

/** Polls with results that refresh every 15 seconds, only while the tab is visible. */
export function FanZonePolls({ initial }: { initial: Poll[] }) {
  const [polls, setPolls] = useState(initial);
  const [voted, setVoted] = useState<Voted>({});

  useEffect(() => {
    try {
      setVoted(JSON.parse(localStorage.getItem(STORE) ?? "{}"));
    } catch {
      // Storage can be blocked. The server still stops a second vote.
    }
  }, []);

  useEffect(() => {
    async function refresh() {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/fan-zone/polls");
        if (res.ok) setPolls((await res.json()).polls);
      } catch {
        // Keep showing what we have.
      }
    }
    const timer = setInterval(refresh, REFRESH_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  function onResults(slug: string, options: PollOption[], optionId: number) {
    setPolls((all) => all.map((p) => (p.slug === slug ? { ...p, options } : p)));
    setVoted((v) => {
      const next = { ...v, [slug]: optionId };
      try {
        localStorage.setItem(STORE, JSON.stringify(next));
      } catch {
        // UI memory only.
      }
      return next;
    });
  }

  if (polls.length === 0) return <p className="text-muted-foreground">{copy.empty}</p>;
  return (
    <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {polls.map((p) => (
        <PollCard key={p.slug} poll={p} voted={voted[p.slug]} onResults={onResults} />
      ))}
    </ul>
  );
}
