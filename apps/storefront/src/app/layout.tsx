import type { Metadata } from "next";
import { Archivo, Cormorant_Garamond, Inter, Geist_Mono } from "next/font/google";

import "@/styles/theme.css";
import { ThemeProvider, Toaster, TooltipProvider } from "@likiya/ui";
import { PremiumLoader } from "@/components/motion/premium-loader";
import { Analytics } from "@likiya/analytics";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo/structured-data";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@likiya/config";
import { cn } from "@likiya/utils";

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const fontDisplay = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  display: "swap",
});

const fontSerif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const fontMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  ...buildMetadata({ title: `${siteConfig.fullName} | Considered Luxury Fashion` }),
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.fullName} | Considered Luxury Fashion`,
    template: `%s | ${siteConfig.name}`,
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        fontSans.variable,
        fontDisplay.variable,
        fontSerif.variable,
        fontMono.variable,
      )}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        {/* Storefront art direction is fixed (light: black-on-white with the
            brand pink), not user/OS-toggled — a fashion editorial identity
            shouldn't shift with someone's system dark-mode setting. */}
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
          <TooltipProvider delayDuration={200}>
            <PremiumLoader />
            {children}
            <Toaster position="bottom-right" />
          </TooltipProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
