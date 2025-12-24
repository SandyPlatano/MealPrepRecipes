import { SectionWrapper } from "@/components/landing/shared";
import { TESTIMONIAL } from "../_data/landing-data";
import { Quote } from "lucide-react";

export function TestimonialSection() {
  return (
    <SectionWrapper bgClassName="bg-muted/30">
      <div className="mx-auto max-w-4xl text-center">
        {/* Quote icon */}
        <div className="mb-6 inline-flex rounded-xl bg-primary/10 p-4 text-primary">
          <Quote className="size-8" />
        </div>

        {/* Quote text */}
        <blockquote className="text-2xl font-medium leading-relaxed tracking-tight md:text-3xl lg:text-4xl">
          &ldquo;{TESTIMONIAL.quote}&rdquo;
        </blockquote>

        {/* Author */}
        <div className="mt-8 flex flex-col items-center gap-4">
          {/* Avatar placeholder */}
          <div className="flex size-14 items-center justify-center rounded-full bg-primary text-xl font-mono font-bold text-primary-foreground">
            {TESTIMONIAL.author
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>

          <div>
            <p className="font-mono font-semibold">{TESTIMONIAL.author}</p>
            <p className="text-sm text-muted-foreground">
              {TESTIMONIAL.title}, {TESTIMONIAL.company}
            </p>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
