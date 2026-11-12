import site from "@/data/site.json";

export { site };

// Vercel sets VERCEL_PROJECT_PRODUCTION_URL (host only) on every deployment.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const nav = [
  { href: "/test", label: "Test" },
  { href: "/odi", label: "ODI" },
  { href: "/t20i", label: "T20I" },
  { href: "/ipl", label: "IPL" },
  { href: "/captaincy", label: "Captaincy" },
  { href: "/records", label: "Records" },
  { href: "/compare", label: "Compare" },
  { href: "/fan-zone", label: "Fan Zone" },
];

export const footerNav = [...nav, { href: "/timeline", label: "Timeline" }, { href: "/innings", label: "Innings" }];
