import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// --background of the dark theme in globals.css.
const BOARD = "#0a120e";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.shortName,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: BOARD,
    theme_color: BOARD,
    icons: [192, 512].map((px) => ({ src: `/pwa-icon/${px}`, sizes: `${px}x${px}`, type: "image/png" })),
  };
}
