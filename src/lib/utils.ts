export { cn } from "cn"

/** Two decimals; null stays null so callers choose their own dash. */
export const fixed = (n: number | null) => (n === null ? null : n.toFixed(2));

const ordinalRules = new Intl.PluralRules("en", { type: "ordinal" });
const SUFFIX: Record<string, string> = { one: "st", two: "nd", few: "rd", other: "th" };
export const ordinal = (n: number) => `${n}${SUFFIX[ordinalRules.select(n)]}`;
