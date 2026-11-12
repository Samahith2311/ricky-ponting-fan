// Reads ESPNcricinfo Statsguru result pages and returns their tables as rows keyed by column header.
// Usage: node scripts/statsguru.mjs dump "<statsguru url>"   (prints every table on the page)
import { pathToFileURL } from "node:url";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

const text = (html) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();

/** @returns {Promise<{ title: string, tables: Record<string, Record<string, string>[]> }>} tables keyed by caption */
export async function getPage(url) {
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const html = await res.text();
  // e.g. "One-Day Internationals:Batting records:Ricky Ponting" (the <title> has no player name)
  const title = html.match(/var omniPageName = "([^"]*)"/)?.[1] ?? "";
  const tables = {};
  for (const t of html.matchAll(/<table class="engineTable"[^>]*>\s*<caption>([^<]+)<\/caption>([\s\S]*?)<\/table>/g)) {
    const head = t[2].match(/<thead>([\s\S]*?)<\/thead>/);
    if (!head) continue;
    // Integer-like keys ("100", "50", "0") would jump to the front of a JS object, so rename them.
    const rename = { 100: "100s", 50: "50s", 0: "Ducks" };
    const cols = [...head[1].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((c) => rename[text(c[1])] ?? text(c[1]));
    cols[0] ||= "Grouping";
    // Series views put the series name in a "title" row above each data row.
    let title = "";
    const rows = [];
    for (const r of t[2].matchAll(/<tr class="(title|data1)">([\s\S]*?)<\/tr>/g)) {
      const cells = [...r[2].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((c) => text(c[1]));
      if (r[1] === "title") title = cells[0] ?? "";
      else if (cells.length >= cols.length - 1)
        rows.push({ ...Object.fromEntries(cols.map((c, i) => [c || `col${i}`, cells[i] ?? ""])), title });
    }
    tables[t[1].trim()] = rows;
  }
  return { title, tables };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href && process.argv[2] === "dump") {
  const { title, tables } = await getPage(process.argv[3]);
  console.log(title);
  for (const [caption, rows] of Object.entries(tables)) {
    console.log(`\n## ${caption} (${rows.length} rows)`);
    if (rows[0]) console.log(Object.keys(rows[0]).join(" | "));
    for (const r of rows) console.log(Object.values(r).join(" | "));
  }
}
