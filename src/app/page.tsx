import { site } from "@/lib/site";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-16 sm:px-6">
      <p className="font-heading text-xl font-bold uppercase tracking-wide text-score">
        {site.name}
      </p>

      <h1 className="mt-3 font-heading text-[clamp(4.5rem,19vw,13rem)] leading-[0.82] font-black uppercase">
        {site.subject.split(" ").map((word) => (
          <span key={word} className="block">
            {word}
          </span>
        ))}
      </h1>

      <div className="mt-10 flex max-w-xl flex-col border border-border sm:flex-row">
        <p className="bg-aus-gold px-4 py-3 font-heading text-2xl font-extrabold whitespace-nowrap text-ink uppercase">
          Coming soon
        </p>
        <p className="flex items-center px-4 py-3 text-muted-foreground">
          {site.comingSoon}
        </p>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">{site.tagline}</p>
    </main>
  );
}
