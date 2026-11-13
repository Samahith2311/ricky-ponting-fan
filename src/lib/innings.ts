import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import type { Innings } from "./types";

const dir = join(process.cwd(), "src", "data", "innings");

function load(file: string): Innings {
  let innings: Innings;
  try {
    innings = JSON.parse(readFileSync(join(dir, file), "utf8"));
  } catch (error) {
    throw new Error(`src/data/innings/${file} could not be read: ${error instanceof Error ? error.message : error}`);
  }
  // The route is the id, so a file named one thing and labelled another would be a broken link.
  if (innings.id !== basename(file, ".json")) throw new Error(`src/data/innings/${file} has id "${innings.id}"; the id must match the file name`);
  return innings;
}

/** Every file in src/data/innings, oldest first. Add a file and the gallery and the routes pick it up. */
export const allInnings = (): Innings[] =>
  readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .map(load)
    .sort((a, b) => a.date.localeCompare(b.date));

export const findInnings = (id: string) => allInnings().find((i) => i.id === id);
