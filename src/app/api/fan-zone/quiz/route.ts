import { callerHash, fail, filled, guard, json, limit, profane } from "@/lib/fan-zone/post";
import { quiz, quizShape, scoreAnswers } from "@/lib/fan-zone/quiz";
import { parseQuiz } from "@/lib/fan-zone/rules";
import { insertScore } from "@/lib/fan-zone/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const g = await guard(request);
  if ("response" in g) return g.response;
  const { cfg } = g;

  const parsed = parseQuiz(g.body, quizShape);
  if (!parsed.ok) return fail(parsed.error);
  const { nickname, answers, website } = parsed.value;
  const result = { score: scoreAnswers(answers), total: quiz.questions.length };

  // A bot that fills the hidden field is told it worked and nothing is stored.
  if (filled(website)) return json(result, 201);

  const over = await limit(cfg, `quiz:${callerHash(cfg, request)}`, 5, 3600);
  if (over) return over;

  if (profane(nickname)) return fail("rejected");
  if (!(await insertScore(cfg, nickname, result.score, result.total, quiz.version))) return fail("unavailable");
  return json(result, 201);
}
