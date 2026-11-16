import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { formatStat } from "@/components/stat-card";
import { site } from "@/lib/site";

// Shared by every opengraph-image.tsx: `export { alt, contentType, size } from "@/lib/og"`.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.name}: ${site.tagline}`;

export type Plate = { label: string; value: string | number | null };

// The dark theme from globals.css. Share cards are always the night board.
const C = { board: "#0a120e", card: "#101a15", rule: "#23342b", chalk: "#f1eee4", muted: "#9aa79f", gold: "#ffcd00", green: "#00843d" };

const font = readFile(join(process.cwd(), "src/assets/BigShoulders-ExtraBold.ttf"));

/** A 1200x630 share card: site name, a title, an optional line under it and up to four number plates. */
export async function ogCard({ title, kicker, plates = [] }: { title: string; kicker?: string; plates?: Plate[] }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 56,
          background: C.board,
          color: C.chalk,
          fontFamily: "Big Shoulders",
          textTransform: "uppercase",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingBottom: 16,
            borderBottom: `2px solid ${C.rule}`,
            fontSize: 30,
            letterSpacing: 2,
            color: C.muted,
          }}
        >
          <span style={{ color: C.chalk }}>{site.name}</span>
          <span>{site.tagline}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: title.length > 17 ? 96 : 128, lineHeight: 0.95 }}>{title}</div>
          {kicker && <div style={{ marginTop: 16, fontSize: 38, color: C.muted }}>{kicker}</div>}
        </div>

        <div style={{ display: "flex", gap: 2, background: C.rule, borderBottom: `10px solid ${C.green}` }}>
          {plates.map((p) => (
            <div key={p.label} style={{ display: "flex", flexDirection: "column", flex: 1, padding: "18px 24px", background: C.card }}>
              <span style={{ fontSize: 28, letterSpacing: 2, color: C.muted }}>{p.label}</span>
              <span style={{ fontSize: 92, lineHeight: 1, color: C.gold }}>{formatStat(p.value)}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Big Shoulders", data: await font, weight: 800, style: "normal" }] },
  );
}

/** The card for a page whose title is in site.json and whose one-line summary is in the homepage list. */
export const pageCard = (key: keyof typeof site.pages) =>
  ogCard({ title: site.pages[key].title, kicker: site.explore.find((item) => item.href === `/${key}`)?.text });

/** The scoreboard mark from icon.svg as a PNG, for the web app manifest and the Apple touch icon. */
export function iconImage(px: number) {
  const u = px / 32;
  const bar = (x: number, y: number, w: number, h: number, fill: string) => (
    <div style={{ position: "absolute", left: x * u, top: y * u, width: w * u, height: h * u, background: fill }} />
  );
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: C.board }}>
        {bar(8, 10, 3, 16, C.gold)}
        {bar(14.5, 10, 3, 16, C.gold)}
        {bar(21, 10, 3, 16, C.gold)}
        {bar(7, 6.5, 8.5, 2, C.chalk)}
        {bar(16.5, 6.5, 8.5, 2, C.chalk)}
      </div>
    ),
    { width: px, height: px },
  );
}
