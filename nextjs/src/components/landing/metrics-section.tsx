"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Metric {
  value: number;
  suffix?: string;
  label: string;
  sublabel: string;
}

const metrics: Metric[] = [
  {
    value: 12847,
    label: "recipes imported",
    sublabel: "and counting",
  },
  {
    value: 4.2,
    suffix: " hrs",
    label: "saved weekly",
    sublabel: "per household",
  },
  {
    value: 127,
    suffix: "$",
    label: "saved monthly",
    sublabel: "on groceries",
  },
];

export function MetricsSection() {
  return (
    <section className="py-20 md:py-24 bg-clay-bg">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {metrics.map((metric, index) => (
              <MetricItem key={index} {...metric} delay={index * 100} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

interface MetricItemProps extends Metric {
  delay?: number;
}

function MetricItem({ value, suffix, label, sublabel, delay = 0 }: MetricItemProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);

            // Delay start of animation
            setTimeout(() => {
              const duration = 1500; // ms
              const steps = 60;
              const increment = value / steps;
              let current = 0;

              const timer = setInterval(() => {
                current += increment;
                if (current >= value) {
                  setDisplayValue(value);
                  clearInterval(timer);
                } else {
                  setDisplayValue(current);
                }
              }, duration / steps);
            }, delay);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value, delay, hasAnimated]);

  // Format the number based on whether it's a decimal or integer
  const formatNumber = (num: number) => {
    if (suffix === "$") {
      return `$${Math.round(num).toLocaleString()}`;
    }
    if (Number.isInteger(value)) {
      return Math.round(num).toLocaleString();
    }
    return num.toFixed(1);
  };

  return (
    <div ref={ref} className="text-center space-y-2">
      <div className="flex items-baseline justify-center gap-1">
        <span className="text-4xl md:text-5xl lg:text-6xl font-mono font-bold text-clay-text">
          {formatNumber(displayValue)}
        </span>
        {suffix && suffix !== "$" && (
          <span className="text-2xl md:text-3xl font-mono font-bold text-primary">
            {suffix}
          </span>
        )}
      </div>
      <p className="text-base md:text-lg font-medium text-clay-text">{label}</p>
      <p className="text-sm text-clay-muted">{sublabel}</p>
    </div>
  );
}
