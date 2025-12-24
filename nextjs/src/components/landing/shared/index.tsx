import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// SectionWrapper - Container for landing page sections
// ─────────────────────────────────────────────────────────────

interface SectionWrapperProps {
  children: React.ReactNode;
  id?: string;
  bgClassName?: string;
  className?: string;
}

export function SectionWrapper({
  children,
  id,
  bgClassName,
  className,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn("py-16 md:py-24", bgClassName, className)}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// SectionHeader - Title + description for sections
// ─────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-12 text-center", className)}>
      <h2 className="font-mono text-3xl font-bold tracking-tight md:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
