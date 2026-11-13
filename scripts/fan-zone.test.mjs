// Self-check for the Fan Zone logic that has branches. Run: npm run test:fan-zone
// Imports the pure rules straight from TypeScript (Node 22.18+ strips the types).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { isProfane, parseQuiz, parseVote, parseWall, wallSpam } from "../src/lib/fan-zone/rules.ts";

const lists = JSON.parse(readFileSync("src/data/moderation.json", "utf8"));
const quizData = JSON.parse(readFileSync("src/data/quiz.json", "utf8"));
const quiz = { version: quizData.version, optionCounts: quizData.questions.map((q) => q.options.length) };
const goodAnswers = quizData.questions.map(() => 0);

test("profanity filter lets clean text through", () => {
  for (const text of ["What a cracking pull shot", "Class act, an assassin with the bat", "Passing the baton"]) {
    assert.equal(isProfane(text, lists), false, text);
  }
});

test("profanity filter catches plain, spaced, leetspeak, repeated-letter and accented forms", () => {
  for (const text of ["what the fuck", "f u c k", "f.u.c.k", "sh1t", "$h1t", "fuuuuck", "FÜCK", "s h i t", "w4nker", "total bullshit"]) {
    assert.equal(isProfane(text, lists), true, text);
  }
});

test("wall spam rules reject links and junk, accept a normal post", () => {
  assert.equal(wallSpam("Great to see his record on show here"), false);
  for (const text of ["see http://example.com", "visit www.example", "go to example.com now", "mail me @someone", "<b>hi</b>", "[x](y)", "aaaaaaaaaa", "THIS IS ALL CAPITALS FROM START TO END", "zero​width"]) {
    assert.equal(wallSpam(text), true, text);
  }
});

test("vote body: right shape passes, anything else is invalid", () => {
  assert.equal(parseVote({ pollSlug: "best-shot", optionId: 3 }).ok, true);
  for (const body of [null, [], {}, { pollSlug: "best-shot" }, { pollSlug: "best-shot", optionId: "3" }, { pollSlug: "best-shot", optionId: 1.5 }, { pollSlug: "Bad Slug", optionId: 1 }, { pollSlug: "best-shot", optionId: 1, extra: 1 }]) {
    assert.equal(parseVote(body).ok, false, JSON.stringify(body));
  }
});

test("quiz body: unknown key, wrong types, wrong answer count, stale version", () => {
  const ok = { nickname: " Punter ", version: quiz.version, answers: goodAnswers, website: "" };
  const parsed = parseQuiz(ok, quiz);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.value.nickname, "Punter");

  const invalid = (body) => assert.deepEqual(parseQuiz(body, quiz), { ok: false, error: "invalid" }, JSON.stringify(body));
  invalid({ ...ok, score: 10 }); // a client-sent score is an unknown key
  invalid({ ...ok, answers: goodAnswers.slice(1) }); // 9 answers
  invalid({ ...ok, answers: [...goodAnswers, 0] }); // 11 answers
  invalid({ ...ok, answers: goodAnswers.map((_, i) => (i === 0 ? "0" : 0)) }); // wrong type
  invalid({ ...ok, answers: goodAnswers.map((_, i) => (i === 0 ? 9 : 0)) }); // out of range
  invalid({ ...ok, nickname: "x" }); // too short
  invalid({ ...ok, nickname: "bad<name>" });
  invalid({ ...ok, website: 5 });
  invalid({ nickname: "Punter", version: quiz.version, answers: goodAnswers });
  assert.deepEqual(parseQuiz({ ...ok, version: "old" }, quiz), { ok: false, error: "stale" });
});

test("wall body: trims, enforces length and line count, rejects unknown keys", () => {
  const ok = { nickname: "Fan_1", message: "  Lovely stuff  ", website: "" };
  const parsed = parseWall(ok);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.value.message, "Lovely stuff");
  for (const body of [{ ...ok, message: "hi" }, { ...ok, message: "x".repeat(281) }, { ...ok, message: "a\nb\nc\nd\ne" }, { ...ok, id: 1 }, { ...ok, nickname: "-bad" }, { ...ok, message: 12 }]) {
    assert.equal(parseWall(body).ok, false, JSON.stringify(body).slice(0, 60));
  }
});

test("quiz.json holds ten questions and every answer index points at an option", () => {
  assert.equal(quizData.questions.length, 10);
  for (const q of quizData.questions) assert.ok(Number.isInteger(q.answer) && q.options[q.answer], q.id);
});
