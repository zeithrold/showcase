import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Showcase — Small tools, thoughtful details",
  description: "A personal collection of thoughtful interfaces and useful little tools by Zeithrold. First up: a clock that puts time in motion.",
  metadataBase: new URL("https://showcase.ztd.me"),
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Showcase by Zeithrold",
    description: "Small tools. Thoughtful details. A personal collection of interfaces, starting with a clock in motion.",
    url: "https://showcase.ztd.me",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
