import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  /** Icon - pass emoji string or pre-rendered Lucide icon */
  icon: ReactNode;
  /** Main title text */
  title: string;
  /** Description text */
  description: string;
  /** Action button(s) - passed as ReactNode for flexibility */
  action?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Display variant */
  variant?: "default" | "card" | "compact";
  /** Size variant */
  size?: "sm" | "default" | "lg";
}

const sizeConfig = {
  sm: {
    padding: "py-8 px-4",
    iconWrapper: "mb-3",
    title: "text-sm font-medium mb-1",
    description: "text-xs mb-4",
  },
  default: {
    padding: "py-12 px-4",
    iconWrapper: "mb-4 text-5xl",
    title: "text-lg font-semibold mb-2",
    description: "text-sm mb-6",
  },
  lg: {
    padding: "py-16 px-6",
    iconWrapper: "mb-5 text-6xl",
    title: "text-xl font-bold mb-3",
    description: "text-base mb-8",
  },
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  variant = "default",
  size = "default",
}: EmptyStateProps) {
  const config = sizeConfig[size];

  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center animate-slide-up-fade",
        config.padding,
        className
      )}
    >
      {/* Icon rendering - accepts emoji string or pre-rendered Lucide icons */}
      {icon && <div className={config.iconWrapper}>{icon}</div>}

      <h3 className={config.title}>{title}</h3>
      <p className={cn("text-muted-foreground max-w-sm", config.description)}>
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );

  // Card variant wraps content in a Card
  if (variant === "card") {
    return (
      <Card className={className}>
        <CardContent className="p-0">{content}</CardContent>
      </Card>
    );
  }

  // Compact variant for inline/minimal display
  if (variant === "compact") {
    return (
      <div className={cn("text-center py-6 text-muted-foreground", className)}>
        <p className="text-sm">{title}</p>
      </div>
    );
  }

  return content;
}
