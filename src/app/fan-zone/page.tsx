import type { Metadata } from "next";
import { FanZonePolls } from "@/components/fan-zone-polls";
import { FanZoneQuiz } from "@/components/fan-zone-quiz";
import { FanZoneWallForm } from "@/components/fan-zone-wall-form";
import { panel } from "@/components/fan-zone-ui";
import { SectionHeading } from "@/components/section-heading";
import { getFanZoneConfig } from "@/lib/fan-zone/config";
import { quiz } from "@/lib/fan-zone/quiz";
import { approvedPosts, leaderboard, listPolls } from "@/lib/fan-zone/supabase";
import { formatDate } from "@/lib/data";
import { site } from "@/lib/site";

const copy = site.pages.fanZone;
const subheading = "font-heading text-3xl leading-none font-black uppercase sm:text-4xl";

export const metadata: Metadata = { title: copy.title, description: copy.lead };
// Reads the environment and the database on every request.
export const dynamic = "force-dynamic";

function NotConnected() {
  return (
    <div className={panel}>
      <p className="font-heading text-2xl leading-none font-black uppercase">{copy.notConnected.heading}</p>
      <p className="mt-2 max-w-2xl text-muted-foreground">{copy.notConnected.text}</p>
    </div>
  );
}

export default async function Page() {
  const cfg = getFanZoneConfig();
  const [polls, board, posts] = cfg
    ? await Promise.all([listPolls(cfg), leaderboard(cfg), approvedPosts(cfg)])
    : [null, null, null];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <SectionHeading as="h1" title={copy.title} lead={copy.lead} />

      <section aria-labelledby="polls-heading">
        <h2 id="polls-heading" className={subheading}>
          {copy.polls.heading}
        </h2>
        <p className="mt-2 mb-4 max-w-2xl text-muted-foreground">{copy.polls.lead}</p>
        {!cfg ? <NotConnected /> : polls ? <FanZonePolls initial={polls} /> : <p className={panel}>{copy.unavailable}</p>}
      </section>

      <section className="mt-16" aria-labelledby="quiz-heading">
        <h2 id="quiz-heading" className={subheading}>
          {copy.quiz.heading}
        </h2>
        <p className="mt-2 mb-4 max-w-2xl text-muted-foreground">{copy.quiz.lead}</p>
        <FanZoneQuiz version={quiz.version} questions={quiz.questions} connected={cfg !== null} />
      </section>

      <section className="mt-16" aria-labelledby="board-heading">
        <h2 id="board-heading" className={subheading}>
          {copy.leaderboard.heading}
        </h2>
        <p className="mt-2 mb-4 max-w-2xl text-muted-foreground">{copy.leaderboard.lead}</p>
        {!cfg ? (
          <NotConnected />
        ) : !board ? (
          <p className={panel}>{copy.unavailable}</p>
        ) : board.length === 0 ? (
          <p className={panel}>{copy.leaderboard.empty}</p>
        ) : (
          <table className="w-full max-w-xl border-collapse border border-border bg-card text-left">
            <thead>
              <tr className="border-b border-border font-heading text-base tracking-wide text-muted-foreground uppercase">
                <th scope="col" className="px-3 py-2">
                  {copy.leaderboard.rank}
                </th>
                <th scope="col" className="px-3 py-2">
                  {copy.leaderboard.name}
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  {copy.leaderboard.score}
                </th>
              </tr>
            </thead>
            <tbody>
              {board.map((row, i) => (
                <tr key={row.nickname.toLowerCase()} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2 font-heading text-xl font-bold">{i + 1}</td>
                  <td className="px-3 py-2 break-words">{row.nickname}</td>
                  <td className="px-3 py-2 text-right font-heading text-xl font-bold">
                    {row.score}/{quiz.questions.length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="mt-16" aria-labelledby="wall-heading">
        <h2 id="wall-heading" className={subheading}>
          {copy.wall.heading}
        </h2>
        <p className="mt-2 mb-4 max-w-2xl text-muted-foreground">{copy.wall.lead}</p>
        {!cfg ? (
          <NotConnected />
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              {!posts ? (
                <p className={panel}>{copy.unavailable}</p>
              ) : posts.length === 0 ? (
                <p className={panel}>{copy.wall.empty}</p>
              ) : (
                <ul className="grid gap-3">
                  {posts.map((post) => (
                    <li key={`${post.created_at}-${post.nickname}`} className={panel}>
                      <p className="whitespace-pre-line break-words">{post.body}</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {post.nickname}, {formatDate(post.created_at)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <FanZoneWallForm />
          </div>
        )}
      </section>

      <section className="mt-16 max-w-3xl" aria-labelledby="privacy-heading">
        <h2 id="privacy-heading" className="font-heading text-2xl leading-none font-extrabold uppercase">
          {copy.privacy.heading}
        </h2>
        <div className="mt-3 grid gap-3 text-sm text-muted-foreground">
          {copy.privacy.text.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
