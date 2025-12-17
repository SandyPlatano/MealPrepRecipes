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
        "group relative p-6 md:p-8 rounded-2xl bg-clay-surface border border-clay-border",
        "shadow-clay-card transition-all duration-200 ease-out",
        "hover:shadow-clay-card-hover hover:-translate-y-1 hover:border-clay-border-hover",
        className
      )}
    >
      {/* Icon container */}
      <div className="mb-4 p-3 w-fit rounded-xl bg-coral-tint-50 text-primary transition-colors duration-200 group-hover:bg-coral-tint-100">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-clay-text mb-2">{title}</h3>

      {/* Description */}
      <p className="text-clay-muted text-sm leading-relaxed">{description}</p>

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
    <div className="flex flex-col items-center text-center p-6 rounded-xl bg-clay-surface border border-clay-border shadow-clay-sm hover:shadow-clay-md transition-all duration-200">
      <div className="p-3 rounded-xl bg-coral-tint-50 text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-clay-text mb-2">{title}</h3>
      <p className="text-sm text-clay-muted">{description}</p>
    </div>
  );
}
