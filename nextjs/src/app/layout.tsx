import type { Metadata } from "next";
import { Space_Mono, Work_Sans, Caveat, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { CookieConsent } from "@/components/cookie-consent";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "700"],
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-handwritten",
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://babewfd.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Babe, What's for Dinner? | Meal Planning Made Simple",
    template: "%s | Babe, What's for Dinner?",
  },
  description:
    "Finally, an answer. Plan meals, save recipes, and generate shopping lists. AI-powered meal suggestions for couples and families.",
  keywords: [
    "meal planning",
    "recipes",
    "dinner",
    "cooking",
    "family meals",
    "shopping list",
    "meal prep",
    "weekly menu",
    "recipe organizer",
  ],
  authors: [{ name: "Babe, What's for Dinner?" }],
  creator: "Babe, What's for Dinner?",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Babe, What's for Dinner?",
    title: "Babe, What's for Dinner? | Meal Planning Made Simple",
    description:
      "Finally, an answer. Plan meals, save recipes, and generate shopping lists. AI-powered meal suggestions for couples and families.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Babe, What's for Dinner? - Meal Planning App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Babe, What's for Dinner? | Meal Planning Made Simple",
    description:
      "Finally, an answer. Plan meals, save recipes, and generate shopping lists.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "What's 4 Dinner",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (document.documentElement) {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#F56565" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body
        className={`${workSans.variable} ${spaceMono.variable} ${caveat.variable} ${playfair.variable} font-body antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <Toaster />
          <CookieConsent />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
