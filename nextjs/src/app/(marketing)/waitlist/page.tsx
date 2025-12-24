import { Metadata } from "next";
import { WaitlistForm } from "@/components/waitlist/waitlist-form";

export const metadata: Metadata = {
  title: "Join the Waitlist | Babe, What's for Dinner?",
  description:
    "Be the first to know when we launch. The meal planning app for couples and families.",
};

export default function WaitlistPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      {/* Logo/Icon placeholder */}
      <div className="mb-6 text-5xl">🍽️</div>

      {/* Headline */}
      <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
        No more &quot;what&apos;s for dinner?&quot; arguments
      </h1>

      {/* Subheadline */}
      <p className="mb-8 max-w-md text-lg text-muted-foreground">
        The meal planning app that knows whose turn it is to cook tonight.
        Built for couples and families.
      </p>

      {/* Form */}
      <WaitlistForm source="website" className="w-full max-w-md" />

      {/* Trust text */}
      <p className="mt-6 text-sm text-muted-foreground">
        We&apos;ll only email you when we launch. No spam, ever.
      </p>
    </div>
  );
}
