import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono, Caveat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import SiteFooter from "@/components/SiteFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.thinkdifferent.sale'),
  title: "Think Different",
  description: "Fostering creativity, celebrating individuality, and encouraging unique ideas. Created to create.",
  icons: {
    icon: '/favicon.ico?v=2', // Cache busting - increment when favicon changes
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const h = await headers();
  const locked = h.get("x-td-locked") === "1";

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} antialiased`}
      >
        {!locked && <Navigation />}
        <div className={locked ? "" : "pt-16"}>{children}</div>
        {!locked && <SiteFooter />}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
