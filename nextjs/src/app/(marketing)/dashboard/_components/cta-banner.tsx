import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="bg-primary py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Text */}
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-mono font-bold text-white md:text-3xl">
              Ready to recover lost revenue?
            </h2>
            <p className="mt-2 text-lg text-white/80">
              Start your free trial today. No credit card required.
            </p>
          </div>

          {/* CTA */}
          <Button
            size="lg"
            className="bg-white px-8 text-primary hover:bg-white/90"
          >
            Get Started Free
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
