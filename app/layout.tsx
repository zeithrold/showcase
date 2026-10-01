import type { Metadata } from "next";
import "./globals.css";
import { ShowcaseI18nProvider } from "@/components/i18n-provider";
import { PreferencesProvider } from "@/components/preferences-provider";

export const metadata: Metadata = {
  title: "zeithrold/showcase",
  description: "Explore Zeithrold's collection of frontend design experiments and useful everyday tools, one page at a time.",
  metadataBase: new URL("https://showcase.ztd.me"),
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "zeithrold/showcase",
    description: "Explore Zeithrold's collection of frontend design experiments and useful everyday tools, one page at a time.",
    url: "https://showcase.ztd.me",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><ShowcaseI18nProvider><PreferencesProvider>{children}</PreferencesProvider></ShowcaseI18nProvider></body>
    </html>
  );
}
