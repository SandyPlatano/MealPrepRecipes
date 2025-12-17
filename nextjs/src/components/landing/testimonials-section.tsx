"use client";

import { cn } from "@/lib/utils";
import { Quote } from "lucide-react";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  variant: "coral" | "sage" | "neutral";
}

const testimonials: Testimonial[] = [
  {
    quote:
      "We used to spend 30 minutes every night figuring out dinner. Now we plan Sunday, shop once, and just... cook.",
    author: "Marcus & Elena T.",
    role: "Working couple in Austin",
    variant: "coral",
  },
  {
    quote:
      "The AI import is magic. I screenshot a TikTok recipe and it's in my collection in seconds. Game changer.",
    author: "Priya S.",
    role: "Home cook & content creator",
    variant: "sage",
  },
  {
    quote:
      "Finally convinced my husband to meal prep. The shopping list feature alone saved our marriage. (Kidding. Mostly.)",
    author: "Rachel M.",
    role: "Mom of 2 in Denver",
    variant: "neutral",
  },
];

const variantStyles = {
  coral: "bg-primary/10 border-primary/20",
  sage: "bg-bold-green/10 border-bold-green/20",
  neutral: "bg-dark-accent border-dark-border",
};

export function TestimonialsSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-cream mb-4">
            Real people, real kitchens
          </h2>
          <p className="text-lg text-cream/60 max-w-2xl mx-auto">
            See what households are saying about Babe
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              {...testimonial}
              className={cn(
                index === 1 && "md:-translate-y-4" // Stagger middle card
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface TestimonialCardProps extends Testimonial {
  className?: string;
}

function TestimonialCard({
  quote,
  author,
  role,
  variant,
  className,
}: TestimonialCardProps) {
  return (
    <div
      className={cn(
        "relative p-6 md:p-8 rounded-2xl border transition-all duration-200",
        "hover:shadow-card-hover hover:-translate-y-1",
        variantStyles[variant],
        className
      )}
    >
      {/* Quote icon */}
      <Quote className="h-8 w-8 text-cream/20 mb-4" />

      {/* Quote text */}
      <blockquote className="text-cream text-base md:text-lg leading-relaxed mb-6">
        &ldquo;{quote}&rdquo;
      </blockquote>

      {/* Attribution */}
      <div className="mt-auto">
        <p className="font-semibold text-cream">{author}</p>
        <p className="text-sm text-cream/60">{role}</p>
      </div>
    </div>
  );
}
