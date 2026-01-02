import { Metadata } from "next";
import { WaitlistForm } from "@/components/waitlist/waitlist-form";
import { Navigation } from "@/components/landing/navigation";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Join the Waitlist | Babe, What's for Dinner?",
  description:
    "Be the first to know when we launch. The meal planning app for couples and families.",
};

export default function WaitlistPage() {
  return (
    <main className="min-h-screen bg-[#FFFCF6]">
      <Navigation />

      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4 pt-24">
        {/* Logo/Icon placeholder */}
        <div className="mb-6 text-5xl">🍽️</div>

        {/* Headline */}
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl text-[#1A1A1A]">
          No more &quot;what&apos;s for dinner?&quot; arguments
        </h1>

        {/* Subheadline */}
        <p className="mb-8 max-w-md text-lg text-gray-600">
          The meal planning app that knows whose turn it is to cook tonight.
          Built for couples and families.
        </p>

        {/* Form */}
        <WaitlistForm source="website" className="w-full max-w-md" />

        {/* Trust text */}
        <p className="mt-6 text-sm text-gray-500">
          We&apos;ll only email you when we launch. No spam, ever.
        </p>
      </div>

      <Footer />
    </main>
  );
}
