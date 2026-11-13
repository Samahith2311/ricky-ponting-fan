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

/** Australia's results over a run of matches. Which of drawn, tied and noResult appear depends on the source page. */
export type TeamResults = {
  matches: number;
  won: number;
  lost: number;
  drawn?: number;
  tied?: number;
  noResult?: number;
  source: string;
  verified: boolean;
};

export type CaptaincyRecord = TeamResults & { format: string; span: string };

/** One World Cup or Ashes series: his batting there and Australia's results. */
export type Tournament = {
  year: number;
  season: string;
  title: string;
  startDate: string;
  winner: string;
  captain: boolean;
  batting: BattingRow;
  team: TeamResults;
  source: string;
  verified: boolean;
};

export type CaptaincyBatting = {
  format: string;
  label: string;
  captain: BattingRow;
  /** null when he never played the format without the captaincy. */
  player: BattingRow | null;
};

/** Shape of captaincy.json (written by scripts/build-data.mjs). */
export type CaptaincyData = {
  retrieved: string;
  record: CaptaincyRecord[];
  worldCupRecord: CaptaincyRecord;
  batting: CaptaincyBatting[];
  worldCups: Tournament[];
  ashes: Tournament[];
};

/** One all-time list from rankings.json; `rank` and `value` are his own place and figure. */
export type Ranking = {
  id: string;
  title: string;
  measure: string;
  rank: number;
  value: number;
  leaders: { rank: number; player: string; value: number; source: string; verified: boolean }[];
  source: string;
  verified: boolean;
};

/** One entry of honours.json. Empty strings mean "not recorded". */
export type Honour = {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  when: string;
  value?: string;
  note: string;
  source: string;
  verified: boolean;
};

/** One entry of timeline.json. `date` is "YYYY", "YYYY-MM" or "YYYY-MM-DD". */
export type TimelineEvent = {
  id: string;
  date: string;
  title: string;
  text: string;
  href?: string;
  major: boolean;
  source: string;
  verified: boolean;
};
