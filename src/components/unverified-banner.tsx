import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

function collect(node: unknown, at: string, hits: string[]) {
  if (Array.isArray(node)) {
    node.forEach((value, i) => collect(value, `${at}[${i}]`, hits));
  } else if (node && typeof node === "object") {
    if ((node as { verified?: unknown }).verified === false) hits.push(at);
    for (const [key, value] of Object.entries(node)) collect(value, `${at}.${key}`, hits);
  }
}

/** Development only (see layout.tsx): lists every object in src/data marked verified: false. */
export function UnverifiedBanner() {
  const dir = path.join(process.cwd(), "src/data");
  const hits: string[] = [];
  for (const file of readdirSync(dir, { recursive: true }) as string[]) {
    if (!file.endsWith(".json")) continue;
    collect(JSON.parse(readFileSync(path.join(dir, file), "utf8")), file.replaceAll("\\", "/"), hits);
  }

  return (
    <details className="border-b border-dashed border-destructive bg-destructive/10 px-4 py-2 text-sm">
      <summary className="cursor-pointer font-semibold">
        Dev only: {hits.length} unverified {hits.length === 1 ? "entry" : "entries"} in src/data
      </summary>
      {hits.length > 0 && (
        <ul className="mt-2 grid gap-1 font-mono text-xs">
          {hits.map((hit) => (
            <li key={hit}>{hit}</li>
          ))}
        </ul>
      )}
    </details>
  );
}
