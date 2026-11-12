import type { Metadata } from "next";
import { Big_Shoulders, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site, siteUrl } from "@/lib/site";

const display = Big_Shoulders({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  // next/font has no fallback metrics for Big Shoulders; a condensed system face keeps layout shift small.
  adjustFontFallback: false,
  fallback: ["Impact", "Arial Narrow", "sans-serif"],
});

const body = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // "dark" is the server default; next-themes swaps the class before paint if the visitor chose light.
    <html lang="en" className={`dark ${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        {/* Without JS the counters never scroll "into view", so show their final digits. */}
        <noscript>
          <style>{`.digit-strip{transform:translateY(calc(var(--d) * -10%)) !important}`}</style>
        </noscript>
      </head>
      <body className="flex min-h-dvh flex-col">
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
