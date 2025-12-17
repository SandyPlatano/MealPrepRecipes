"use client";

import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  className,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group relative p-6 md:p-8 rounded-2xl bg-dark-accent border border-dark-border",
        "shadow-card transition-all duration-200 ease-out",
        "hover:shadow-card-hover hover:-translate-y-1 hover:border-primary/30",
        className
      )}
    >
      {/* Icon container */}
      <div className="mb-4 p-3 w-fit rounded-xl bg-primary/20 text-primary transition-colors duration-200 group-hover:bg-primary/30">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-cream mb-2">{title}</h3>

      {/* Description */}
      <p className="text-cream/60 text-sm leading-relaxed">{description}</p>

      {/* Subtle accent border on hover */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-b-2xl" />
    </div>
  );
}

// Quick feature card for compact displays
interface QuickFeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function QuickFeatureCard({ icon, title, description }: QuickFeatureProps) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-xl bg-dark-accent border border-dark-border shadow-card hover:shadow-card-hover transition-all duration-200">
      <div className="p-3 rounded-xl bg-primary/20 text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-cream mb-2">{title}</h3>
      <p className="text-sm text-cream/60">{description}</p>
    </div>
  );
}
