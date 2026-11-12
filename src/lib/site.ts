import site from "@/data/site.json";

export { site };

// Vercel sets VERCEL_PROJECT_PRODUCTION_URL (host only) on every deployment.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
