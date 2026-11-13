import quizJson from "@/data/quiz.json";

export type QuizQuestion = {
  id: string;
  prompt: string;
  /** Index into `options` of the correct answer. */
  answer: number;
  options: { text: string; source: string; verified: boolean }[];
  source: string;
  verified: boolean;
};

export const quiz: { version: string; questions: QuizQuestion[] } = quizJson;

export const quizShape = { version: quiz.version, optionCounts: quiz.questions.map((q) => q.options.length) };

/** The server marks the answers itself. A score sent by the browser is never read. */
export const scoreAnswers = (answers: number[]) => answers.filter((a, i) => a === quiz.questions[i].answer).length;
