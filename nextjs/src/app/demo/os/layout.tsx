import { VT323, IBM_Plex_Mono } from "next/font/google";
import type { Metadata } from "next";

// ═══════════════════════════════════════════════════════════════════════════════
// MEAL PREP OS - Demo Layout
// Full-screen OS experience without marketing chrome
// ═══════════════════════════════════════════════════════════════════════════════

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-system",
});

export const metadata: Metadata = {
  title: "Meal Prep OS - Demo",
  description: "Experience meal planning like never before. A retro computing aesthetic for modern meal prep.",
};

export default function MealPrepOSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${vt323.variable} ${ibmPlexMono.variable}`}>
      {children}
    </div>
  );
}
