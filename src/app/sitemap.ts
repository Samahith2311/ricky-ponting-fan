import type { MetadataRoute } from "next";
import { retrieved } from "@/lib/data";
import { allInnings } from "@/lib/innings";
import { footerNav, siteUrl } from "@/lib/site";
import { statPages } from "@/lib/stats-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    ...footerNav.map((item) => item.href),
    ...allInnings().map((i) => `/innings/${i.id}`),
    ...statPages.map((p) => `/stats/${p.slug}`),
  ];
  // The figures change only when the data is rebuilt, so that date is the honest "last modified".
  return paths.map((path) => ({ url: `${siteUrl}${path}`, lastModified: retrieved }));
}
