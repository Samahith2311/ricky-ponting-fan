// Builds one innings replay file in src/data/innings from a Cricsheet match file.
// Run: node scripts/build-innings.mjs <path to Cricsheet match .json>   (needs network for the cross-check)
// Data: Cricsheet (https://cricsheet.org), made available under the Open Data Commons Attribution License.
// The ball data decides every number. Statsguru is only used to check the totals, never to fill them in.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { getPage } from "./statsguru.mjs";

const BATTER = "RT Ponting"; // Cricsheet's name for him
const PONTING = 7133; // Statsguru ids
const AUSTRALIA = 2;
const CLASS = { ODI: 2 }; // Statsguru class by Cricsheet match type
const BASE = "https://stats.espncricinfo.com/ci/engine";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MILESTONES = [
  [50, "Fifty"],
  [100, "Hundred"],
  [150, "One-fifty"],
  [200, "Double hundred"],
  [250, "Two-fifty"],
];

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/build-innings.mjs <Cricsheet match .json>");
  process.exit(1);
}
const match = JSON.parse(readFileSync(file, "utf8"));
const { info } = match;
// Cite what was read: the archive the file came from (its README names the URL) and the file in it.
const archiveUrl = readFileSync(join(dirname(file), "README.txt"), "utf8").match(/https:\/\/cricsheet\.org\/downloads\/\S+?\.zip/)?.[0];
if (!archiveUrl) throw new Error(`no archive URL in README.txt beside ${file}`);
const source = `${archiveUrl} (${basename(file)}, data version ${match.meta.data_version})`;
const problems = [];
const check = (name, got, want) => {
  if (String(got) !== String(want)) problems.push(`${name}: ball data says ${got}, published figure is ${want}`);
};

if (!CLASS[info.match_type]) throw new Error(`match type ${info.match_type} has no Statsguru class in this script`);
if (!info.players.Australia?.includes(BATTER)) throw new Error(`${BATTER} did not play for Australia in ${file}`);

// 1. Walk the deliveries. A point is the state after each legal ball, from the moment he reaches the crease.
const innings = match.innings.find((i) =>
  i.overs.some((o) => o.deliveries.some((d) => d.batter === BATTER || d.non_striker === BATTER)),
);
if (!innings) throw new Error(`${BATTER} did not bat in ${file}`);

const s = { n: 0, team: 0, wickets: 0, runs: 0, balls: 0, fours: 0, sixes: 0 };
let out = false;
let totalByParts = 0;
const points = [];
let ended = false; // the points stop when the batter is out; the team tally carries on for the checks
const snap = () => ({ ...s });

for (const over of innings.overs) {
  for (const d of over.deliveries) {
    if (!ended && !points.length && (d.batter === BATTER || d.non_striker === BATTER)) points.push(snap());

    const extras = d.extras ?? {};
    const sum = Object.values(extras).reduce((a, b) => a + b, 0);
    if (d.runs.batter + sum !== d.runs.total) problems.push(`over ${over.over}: runs do not add up on a delivery`);
    totalByParts += d.runs.batter + sum;
    s.team += d.runs.total;
    if (d.batter === BATTER) {
      s.runs += d.runs.batter;
      if (!extras.wides) s.balls += 1; // a no-ball counts as a ball faced, a wide does not
      if (d.runs.batter === 4 && !d.runs.non_boundary) s.fours += 1;
      if (d.runs.batter === 6) s.sixes += 1;
    }
    let dismissed = false;
    for (const w of d.wickets ?? []) {
      if (w.kind.startsWith("retired")) continue;
      s.wickets += 1;
      if (w.player_out === BATTER) out = dismissed = true;
    }
    const legal = !extras.wides && !extras.noballs;
    if (legal) s.n += 1;
    if (!ended && points.length) {
      if (legal) points.push(snap());
      // His innings ends on this delivery, even if it was a no-ball (a run out).
      if (dismissed) {
        points[points.length - 1] = snap();
        ended = true;
      }
    }
  }
}
// Runs after the last legal ball (a trailing wide or no-ball) belong to the last point.
if (!ended) points[points.length - 1] = snap();
const last = points.at(-1);

// 2. Internal checks: the points must be a clean, non-decreasing run that ends on the final figures.
if (last.runs !== s.runs || last.balls !== s.balls) problems.push("his innings is not complete at the last point");
if (totalByParts !== s.team) problems.push(`parts add to ${totalByParts}, deliveries add to ${s.team}`);
for (const key of Object.keys(s)) {
  points.forEach((p, i) => {
    if (i && p[key] < points[i - 1][key]) problems.push(`${key} goes down at point ${i}`);
  });
}
points.forEach((p, i) => {
  if (i && p.n !== points[i - 1].n + 1) problems.push(`point ${i} skips a ball`);
});

// 3. External checks against the published figures (ESPNcricinfo Statsguru).
const [yyyy, mm, dd] = info.dates[0].split("-");
const day = `${Number(dd)}+${MONTHS[Number(mm) - 1]}+${yyyy}`;
const span = `spanmin1=${day};spanmax1=${day};spanval1=span`;
const cls = CLASS[info.match_type];
const batterUrl = `${BASE}/player/${PONTING}.html?class=${cls};filter=advanced;orderby=start;${span};template=results;type=batting;view=innings`;
const teamUrl = `${BASE}/team/${AUSTRALIA}.html?class=${cls};filter=advanced;orderby=start;${span};template=results;type=team;view=innings`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function load(url, attempt = 1) {
  await sleep(1500 * attempt);
  try {
    return await getPage(url);
  } catch (err) {
    if (attempt >= 4) throw err;
    return load(url, attempt + 1);
  }
}
const only = async (url) => {
  const rows = (await load(url)).tables["Innings by innings list"] ?? [];
  if (rows.length !== 1) throw new Error(`expected one innings on ${url}, found ${rows.length}`);
  return rows[0];
};

const bat = await only(batterUrl);
const team = await only(teamUrl);
const matchNo = Object.values(bat).join(" ").match(/# (\d+)/)?.[1];
check("match number", info.match_type_number, matchNo);
check("runs", s.runs, parseInt(bat.Runs, 10));
check("not out", !out, bat.Runs.endsWith("*"));
check("balls faced", s.balls, bat.BF);
check("fours", s.fours, bat["4s"]);
check("sixes", s.sixes, bat["6s"]);
check("team total", `${s.team}/${s.wickets}`, team.Score);
check("overs", `${Math.floor(s.n / info.balls_per_over)}.${s.n % info.balls_per_over}`, team.Overs);

if (problems.length) {
  console.error(`build-innings failed. The ball data does not match the published figures:\n  ${problems.join("\n  ")}`);
  process.exit(1);
}

// 4. Write the file. Every number sits in an object with source and verified (npm run check:data).
const stage = info.event?.stage;
const eventName = (info.event?.name ?? "").replace(/^ICC /, "");
const opponent = info.teams.find((t) => t !== "Australia");
const slug = [yyyy, eventName, stage ?? `v ${opponent}`]
  .join(" ")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");
const label = ([n, name]) => ({ runs: n, label: name, text: `${name} up.`, source, verified: true });
const [by, margin] = Object.entries(info.outcome?.by ?? {})[0] ?? [];

const data = {
  id: slug,
  title: [yyyy, eventName, stage?.toLowerCase() ?? `v ${opponent}`].join(" "),
  date: info.dates[0],
  venue: info.venue ?? info.city,
  batter: BATTER,
  team: "Australia",
  opponent,
  retrieved: new Date().toISOString().slice(0, 10),
  result: by ? { winner: info.outcome.winner, by, margin, source, verified: true } : null,
  final: {
    runs: s.runs,
    notOut: !out,
    balls: s.balls,
    fours: s.fours,
    sixes: s.sixes,
    // The team's figures when his innings ended (the checks above used the whole innings).
    teamRuns: last.team,
    teamWickets: last.wickets,
    legalBalls: last.n,
    ballsPerOver: info.balls_per_over,
    source,
    verified: true,
  },
  captions: {
    arrival: `${BATTER} comes to the crease.`,
    end: out ? `${BATTER} is dismissed.` : `${BATTER} finishes not out.`,
  },
  milestones: MILESTONES.filter(([n]) => n <= s.runs).map(label),
  credit: {
    name: "Cricsheet",
    url: "https://cricsheet.org/",
    licence: "Open Data Commons Attribution License",
    licenceUrl: "https://opendatacommons.org/licenses/by/1.0/",
    checkedAgainst: [batterUrl, teamUrl],
  },
  points: points.map((p) => ({ ...p, source, verified: true })),
};

mkdirSync("src/data/innings", { recursive: true });
writeFileSync(`src/data/innings/${slug}.json`, JSON.stringify(data, null, 2) + "\n");
console.log(`wrote src/data/innings/${slug}.json`);
console.log(
  `checks passed: ${s.runs}${out ? "" : "*"} off ${s.balls} (${s.fours} fours, ${s.sixes} sixes), team ${s.team}/${s.wickets} in ${Math.floor(s.n / info.balls_per_over)}.${s.n % info.balls_per_over} overs, ${points.length} points, ${out ? "out" : "not out"}`,
);
