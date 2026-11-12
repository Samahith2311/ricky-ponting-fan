// Hard rule 2: every number in src/data/**/*.json must sit directly inside an
// object that has `source` (non-empty string) and `verified` (boolean).
// Numeric-looking strings ("140*", "51.85") count as numbers.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = "src/data";
const numeric = /^\d+(\.\d+)?\*?$/;
const errors = [];
const unverified = [];

function walk(node, path, parent) {
  if (typeof node === "number" || (typeof node === "string" && numeric.test(node))) {
    const sourced =
      parent &&
      !Array.isArray(parent) &&
      typeof parent.source === "string" &&
      parent.source !== "" &&
      typeof parent.verified === "boolean";
    if (!sourced) errors.push(path);
  } else if (Array.isArray(node)) {
    node.forEach((v, i) => walk(v, `${path}[${i}]`, node));
  } else if (node && typeof node === "object") {
    if (node.verified === false) unverified.push(path);
    for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`, node);
  }
}

const files = readdirSync(dir, { recursive: true }).filter((f) => f.endsWith(".json"));
for (const f of files) walk(JSON.parse(readFileSync(join(dir, f), "utf8")), f, null);

if (errors.length) {
  console.error(`check:data failed. Numbers without source + verified:\n  ${errors.join("\n  ")}`);
  process.exit(1);
}
console.log(`check:data ok (${files.length} files, ${unverified.length} unverified entries)`);
// node scripts/check-data.mjs --unverified   lists what still needs checking by hand
if (process.argv.includes("--unverified")) for (const path of unverified) console.log(`  ${path}`);
