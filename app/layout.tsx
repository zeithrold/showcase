import type { Metadata } from "next";
import "./globals.css";
import { ShowcaseI18nProvider } from "@/components/i18n-provider";

export const metadata: Metadata = {
  title: "zeithrold/showcase",
  description: "A personal collection of thoughtful interfaces and useful little tools by Zeithrold. First up: a clock that puts time in motion.",
  metadataBase: new URL("https://showcase.ztd.me"),
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "zeithrold/showcase",
    description: "Small tools. Thoughtful details. A personal collection of interfaces, starting with a clock in motion.",
    url: "https://showcase.ztd.me",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><ShowcaseI18nProvider>{children}</ShowcaseI18nProvider></body>
    </html>
  );
}
