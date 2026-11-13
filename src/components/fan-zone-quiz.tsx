"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { fieldInput, fieldLabel, Honeypot, panel, primaryButton, secondaryButton } from "@/components/fan-zone-ui";
import { UnverifiedMark, UnverifiedNote } from "@/components/unverified-mark";
import { postJson } from "@/lib/fan-zone/client";
import type { QuizQuestion } from "@/lib/fan-zone/quiz";
import { NICKNAME } from "@/lib/fan-zone/rules";
import { site } from "@/lib/site";

const copy = site.pages.fanZone.quiz;

type Props = {
  version: string;
  questions: QuizQuestion[];
  /** False when the database is not connected: the score stays on the page. */
  connected: boolean;
};

export function FanZoneQuiz({ version, questions, connected }: Props) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [pickError, setPickError] = useState("");
  const [done, setDone] = useState(false);

  const [nickname, setNickname] = useState("");
  const [nickError, setNickError] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const promptRef = useRef<HTMLHeadingElement>(null);
  const feedbackRef = useRef<HTMLParagraphElement>(null);
  const scoreRef = useRef<HTMLHeadingElement>(null);
  const nickRef = useRef<HTMLInputElement>(null);
  const submittedRef = useRef<HTMLParagraphElement>(null);

  const q = questions[index];
  const last = index === questions.length - 1;
  const score = answers.filter((a, i) => a === questions[i].answer).length;
  const focusSoon = (el: React.RefObject<HTMLElement | null>) => requestAnimationFrame(() => el.current?.focus());

  function check(e: React.FormEvent) {
    e.preventDefault();
    if (picked === null) {
      setPickError(copy.pick);
      return;
    }
    setAnswers([...answers, picked]);
    setChecked(true);
    focusSoon(feedbackRef);
  }

  function next() {
    if (last) {
      setDone(true);
      focusSoon(scoreRef);
    } else {
      setIndex(index + 1);
      setPicked(null);
      setChecked(false);
      focusSoon(promptRef);
    }
  }

  function restart() {
    setIndex(0);
    setPicked(null);
    setChecked(false);
    setAnswers([]);
    setDone(false);
    setSubmitted(false);
    setNickError("");
    focusSoon(promptRef);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = nickname.trim();
    if (!NICKNAME.test(name)) {
      setNickError(copy.nicknameError);
      nickRef.current?.focus();
      return;
    }
    setNickError("");
    setBusy(true);
    const website = String(new FormData(e.currentTarget).get("website") ?? "");
    const res = await postJson("/api/fan-zone/quiz", { nickname: name, version, answers, website });
    setBusy(false);
    if (res.ok) {
      setSubmitted(true);
      router.refresh();
      focusSoon(submittedRef);
    } else {
      setNickError(res.message);
      nickRef.current?.focus();
    }
  }

  if (done) {
    return (
      <div className={panel}>
        <h3 ref={scoreRef} tabIndex={-1} className="w-fit font-heading text-2xl leading-none font-extrabold uppercase">
          {copy.scoreHeading}
        </h3>
        <p className="mt-2 font-heading text-6xl leading-none font-black">
          {score} <span className="text-2xl text-muted-foreground uppercase">{copy.scoreOf} {questions.length}</span>
        </p>

        {connected && !submitted && (
          <form onSubmit={submit} noValidate className="relative mt-6 max-w-md">
            <h4 className="mb-3 font-heading text-xl leading-none font-extrabold uppercase">{copy.submitHeading}</h4>
            <label htmlFor="quiz-nickname" className={fieldLabel}>
              {copy.nickname}
            </label>
            <input
              ref={nickRef}
              id="quiz-nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              autoComplete="off"
              required
              aria-invalid={nickError ? true : undefined}
              aria-describedby={nickError ? "quiz-nickname-hint quiz-nickname-error" : "quiz-nickname-hint"}
              className={fieldInput}
            />
            <p id="quiz-nickname-hint" className="mt-1 text-sm text-muted-foreground">
              {copy.nicknameHint}
            </p>
            <p id="quiz-nickname-error" role="alert" className="mt-1 text-sm text-destructive empty:hidden">
              {nickError}
            </p>
            <Honeypot id="quiz-website" />
            <button type="submit" disabled={busy} className={`${primaryButton} mt-4`}>
              {busy ? copy.sending : copy.submit}
            </button>
          </form>
        )}
        {connected && submitted && (
          <p ref={submittedRef} role="status" tabIndex={-1} className="mt-6">
            {copy.submitted}
          </p>
        )}
        {!connected && <p className="mt-6 text-muted-foreground">{copy.localOnly}</p>}

        <button type="button" onClick={restart} className={`${secondaryButton} mt-6`}>
          {copy.again}
        </button>
      </div>
    );
  }

  const correct = checked && answers[index] === q.answer;
  return (
    <form onSubmit={check} noValidate className={panel}>
      <p className="font-heading text-lg font-bold tracking-wide text-muted-foreground uppercase">
        {copy.question} {index + 1} {copy.of} {questions.length}
      </p>
      <h3
        id="quiz-prompt"
        ref={promptRef}
        tabIndex={-1}
        className="mt-1 max-w-3xl font-heading text-2xl leading-tight font-extrabold uppercase sm:text-3xl"
      >
        {q.prompt}
        {!q.verified && <UnverifiedMark />}
      </h3>

      <div role="radiogroup" aria-labelledby="quiz-prompt" aria-describedby={pickError ? "quiz-pick-error" : undefined} className="mt-4 grid max-w-xl gap-2">
        {q.options.map((o, i) => (
          <label
            key={`${q.id}-${i}`}
            className={`flex min-h-11 items-center gap-3 border px-3 py-2 has-checked:bg-muted ${
              checked && i === q.answer ? "border-score border-2" : checked && i === picked ? "border-destructive" : "border-border has-checked:border-foreground"
            } ${checked ? "" : "cursor-pointer"}`}
          >
            <input
              type="radio"
              name={`quiz-${q.id}`}
              checked={picked === i}
              disabled={checked}
              onChange={() => {
                setPicked(i);
                setPickError("");
              }}
              className="size-5 shrink-0 accent-primary"
            />
            {o.text}
          </label>
        ))}
      </div>
      <p id="quiz-pick-error" role="alert" className="mt-2 text-sm text-destructive empty:hidden">
        {pickError}
      </p>

      {checked ? (
        <>
          <p ref={feedbackRef} role="status" tabIndex={-1} className="mt-4">
            <strong>{correct ? copy.correct : `${copy.wrong} ${q.options[q.answer].text}.`}</strong>{" "}
            <a href={q.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
              {copy.source}
            </a>
          </p>
          <button type="button" onClick={next} className={`${primaryButton} mt-4`}>
            {last ? copy.finish : copy.next}
          </button>
        </>
      ) : (
        <button type="submit" className={`${primaryButton} mt-4`}>
          {copy.check}
        </button>
      )}
      {questions.some((x) => !x.verified) && <UnverifiedNote />}
    </form>
  );
}
