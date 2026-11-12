/** One Statsguru batting line. Every row says where it came from (hard rule 2). */
export type BattingRow = {
  span?: string;
  matches: number;
  innings: number;
  notOuts: number;
  runs: number;
  highestScore: string | null;
  average: number | null;
  ballsFaced: number | null;
  strikeRate: number | null;
  hundreds: number;
  fifties: number;
  ducks: number;
  fours: number | null;
  sixes: number | null;
  source: string;
  verified: boolean;
};

export type FormatSummary = BattingRow & { id: string; label: string };

/** Shape of test.json, odi.json, t20i.json and ipl.json (written by scripts/build-data.mjs). */
export type FormatData = {
  id: string;
  label: string;
  retrieved: string;
  summary: BattingRow;
  byTeam: (BattingRow & { team: string })[];
  byYear: (BattingRow & { year: number })[];
  byOpponent: (BattingRow & { opponent: string })[];
  byHost: (BattingRow & { host: string })[];
  venue: (BattingRow & { venue: string })[];
  captaincy: { captain: BattingRow | null; player: BattingRow | null };
};
