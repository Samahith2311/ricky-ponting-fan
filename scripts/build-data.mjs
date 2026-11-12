// Builds the Statsguru-backed data files in src/data. Every row carries the page it came from.
// Run: npm run data:build   (needs network; overwrites the generated files listed at the bottom)
import { writeFileSync } from "node:fs";
import { getPage } from "./statsguru.mjs";

const BASE = "https://stats.espncricinfo.com/ci/engine";
const PONTING = 7133;
const retrieved = new Date().toISOString().slice(0, 10);

const player = (id, query) => `${BASE}/player/${id}.html?${query}`;
const team = (query) => `${BASE}/team/2.html?${query}`; // 2 = Australia
const num = (s) => (s === undefined || s === "" || s === "-" ? null : Number(s));
// Statsguru prints "-" in the count columns when he played but did not bat: that is zero, not unknown.
const count = (s) => num(s) ?? 0;
const yearOf = (date) => Number(date.slice(-4));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Statsguru answers 503 when asked too fast: pause between pages, back off and retry.
async function load(url, attempt = 1) {
  await sleep(1500 * attempt);
  try {
    return await getPage(url);
  } catch (err) {
    if (attempt >= 4) throw err;
    return load(url, attempt + 1);
  }
}

function batting(r, source) {
  return {
    ...(r.Span ? { span: r.Span } : {}),
    matches: count(r.Mat),
    innings: count(r.Inns),
    notOuts: count(r.NO),
    runs: count(r.Runs),
    highestScore: r.HS === "-" ? null : r.HS,
    average: num(r.Ave),
    ballsFaced: num(r.BF),
    strikeRate: num(r.SR),
    hundreds: count(r["100s"]),
    fifties: count(r["50s"]),
    ducks: count(r.Ducks),
    fours: num(r["4s"]),
    sixes: num(r["6s"]),
    source,
    verified: true,
  };
}

// Filtered pages list "unfiltered" and "filtered"; plain pages list "overall".
function overall(tables) {
  const rows = tables["Career averages"] ?? [];
  return rows.find((r) => r.Grouping === "filtered") ?? rows.find((r) => r.Grouping === "overall");
}

// Self-check: a breakdown must add up to the career figure it came from.
function mustSum(name, rows, key, total) {
  const sum = rows.reduce((a, r) => a + r[key], 0);
  if (sum !== total) throw new Error(`${name}: ${key} adds to ${sum}, summary says ${total}`);
}

const CONTINENTS = ["Africa", "Americas", "Asia", "Europe", "Oceania"];
const IPL_TEAMS = {
  CSK: "Chennai Super Kings",
  Chargers: "Deccan Chargers",
  Daredevils: "Delhi Daredevils",
  KKR: "Kolkata Knight Riders",
  MI: "Mumbai Indians",
  Warriors: "Pune Warriors India",
  RR: "Rajasthan Royals",
  RCB: "Royal Challengers Bangalore",
};

async function format(id, label, query) {
  const source = player(PONTING, query);
  const { tables } = await load(source);
  const rows = tables["Career summary"];
  const summary = batting(overall(tables), source);
  const name = (s) => IPL_TEAMS[s] ?? s;
  const group = (prefix, key, value = name) =>
    rows
      .filter((r) => r.Grouping.startsWith(prefix))
      .map((r) => ({ [key]: value(r.Grouping.slice(prefix.length)), ...batting(r, source) }));
  const one = (grouping) => {
    const r = rows.find((x) => x.Grouping === grouping);
    return r ? batting(r, source) : null;
  };

  const firstOpponent = rows.findIndex((r) => r.Grouping.startsWith("v "));
  const data = {
    id,
    label,
    retrieved,
    summary,
    byTeam: rows.slice(0, firstOpponent).map((r) => ({ team: name(r.Grouping), ...batting(r, source) })),
    byYear: group("year ", "year", Number),
    byOpponent: group("v ", "opponent"),
    byHost: group("in ", "host").filter((r) => !CONTINENTS.includes(r.host)),
    venue: ["home", "away", "neutral"].flatMap((v) => (one(v) ? [{ venue: v, ...one(v) }] : [])),
    captaincy: { captain: one("is captain"), player: one("is not captain") },
  };

  // Statsguru omits the team rows when he played for one side only (Tests).
  const checked = ["byYear", "byOpponent", "byHost", "venue", ...(data.byTeam.length ? ["byTeam"] : [])];
  for (const key of checked) {
    mustSum(`${id}.${key}`, data[key], "runs", summary.runs);
    mustSum(`${id}.${key}`, data[key], "matches", summary.matches);
  }
  return data;
}

async function captainRecord(formatId, cls) {
  const source = player(PONTING, `captain=1;class=${cls};filter=advanced;orderby=default;template=results;type=batting`);
  const { tables } = await load(source);
  const total = overall(tables);
  // A result with no row on the page means no such match.
  const count = (g) => num(tables["Career summary"].find((r) => r.Grouping === g)?.Mat) ?? 0;
  const record = {
    format: formatId,
    span: total.Span,
    matches: num(total.Mat),
    won: count("won match"),
    lost: count("lost match"),
    drawn: count("drawn match"),
    tied: count("tied match"),
    noResult: count("no result"),
    source,
    verified: true,
  };
  const sum = record.won + record.lost + record.drawn + record.tied + record.noResult;
  if (sum !== record.matches) throw new Error(`captain ${formatId}: results add to ${sum}, matches ${record.matches}`);
  return record;
}

function teamRecord(r, source) {
  return {
    matches: num(r.Mat),
    won: num(r.Won),
    lost: num(r.Lost),
    tied: num(r.Tied),
    ...("Draw" in r ? { drawn: num(r.Draw) } : { noResult: num(r.NR) }),
    source,
    verified: true,
  };
}

// One entry per series Ponting played: his batting, Australia's record, and whether he was captain.
async function seriesList(cls, filter, captionWanted) {
  const q = (extra) => `${extra}class=${cls};filter=advanced;${filter}orderby=default;template=results;`;
  const playerUrl = player(PONTING, `${q("")}type=batting;view=series`);
  const captainUrl = player(PONTING, `${q("captain=1;")}type=batting;view=series`);
  const teamUrl = team(`${q("")}type=team;view=series`);
  const played = (await load(playerUrl)).tables["Series averages"].filter((r) => r.title.includes(captionWanted));
  // Match on title: a player's "Start Date" is his first match of the series, not the series start.
  const captained = new Set((await load(captainUrl)).tables["Series averages"].map((r) => r.title));
  const teamRows = (await load(teamUrl)).tables["Series record"];

  return played.map((r) => {
    const t = teamRows.find((x) => x.title === r.title);
    if (!t) throw new Error(`no team record for ${r.title}`);
    return {
      year: yearOf(t["Start Date"]),
      season: r.title.split(", ").pop(),
      title: r.title,
      startDate: t["Start Date"],
      winner: r.Winner,
      captain: captained.has(r.title),
      source: playerUrl,
      verified: true,
      batting: batting(r, playerUrl),
      team: teamRecord(t, teamUrl),
    };
  });
}

const COMPARE = [
  { id: "ponting", name: "Ricky Ponting", country: "Australia", sg: PONTING },
  { id: "tendulkar", name: "Sachin Tendulkar", country: "India", sg: 35320 },
  { id: "kallis", name: "Jacques Kallis", country: "South Africa", sg: 45789 },
  { id: "lara", name: "Brian Lara", country: "West Indies", sg: 52337 },
  { id: "kohli", name: "Virat Kohli", country: "India", sg: 253802 },
];

async function compare() {
  const players = [];
  for (const p of COMPARE) {
    const formats = [];
    for (const [cls, formatId] of [[1, "test"], [2, "odi"], [3, "t20i"]]) {
      const source = player(p.sg, `class=${cls};template=results;type=batting`);
      const { title, tables } = await load(source);
      const surname = p.name.split(" ").pop();
      if (!title.includes(surname)) throw new Error(`${source} is not ${p.name}: "${title}"`);
      const row = overall(tables);
      // No row means the player never appeared in that format.
      if (row) formats.push({ format: formatId, ...batting(row, source) });
    }
    players.push({ id: p.id, name: p.name, country: p.country, formats });
  }
  return { retrieved, players };
}

const write = (file, data) => {
  writeFileSync(`src/data/${file}`, JSON.stringify(data, null, 2) + "\n");
  console.log(`wrote src/data/${file}`);
};

const formats = [
  await format("test", "Test", "class=1;template=results;type=batting"),
  await format("odi", "ODI", "class=2;template=results;type=batting"),
  await format("t20i", "T20I", "class=3;template=results;type=batting"),
  await format("ipl", "IPL", "class=6;filter=advanced;orderby=default;template=results;trophy=117;type=batting"),
];
for (const f of formats) write(`${f.id}.json`, f);

const worldCups = await seriesList(2, "trophy=12;", "World Cup");
const wcUrl = player(PONTING, "class=2;filter=advanced;orderby=default;template=results;trophy=12;type=batting");
write("career-summary.json", {
  retrieved,
  formats: formats.map((f) => ({ id: f.id, label: f.label, ...f.summary })),
  worldCupMatches: batting(overall((await load(wcUrl)).tables), wcUrl),
});

write("captaincy.json", {
  retrieved,
  record: [await captainRecord("test", 1), await captainRecord("odi", 2), await captainRecord("t20i", 3)],
  batting: formats.slice(0, 3).map((f) => ({ format: f.id, label: f.label, ...f.captaincy })),
  worldCups,
  // Span filter keeps Australia's 150 years of Ashes series on one results page.
  ashes: await seriesList(1, "opposition=1;spanmin1=01+Jan+1997;spanval1=span;", "The Ashes"),
});

write("compare.json", await compare());
