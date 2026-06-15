import type { Metadata, Viewport } from "next";
import { Inter, Spectral, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { BRAND } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const spectral = Spectral({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-serif",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} — ${BRAND.tagline}`,
    template: `%s · ${BRAND.name}`,
  },
  description:
    "MOUS is an anonymous storytelling platform. Write real personal stories, confessions, and life-changing moments — and receive real engagement without ever revealing who you are.",
  keywords: [
    "anonymous stories",
    "confessions",
    "storytelling",
    "personal stories",
    "MOUS",
  ],
  openGraph: {
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: "Anonymous stories from real people. No names. Just truth.",
    siteName: BRAND.name,
    type: "website",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
};

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spectral.variable} ${mono.variable} font-sans`}
      >
        <Providers>
          <div className="relative flex min-h-dvh flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
