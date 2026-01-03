'use client';

import { cn } from '@/lib/utils';

interface StarDecorationProps {
  size?: number;
  className?: string;
  animate?: boolean;
  style?: React.CSSProperties;
}

export function StarDecoration({
  size = 40,
  className,
  animate = false,
  style,
}: StarDecorationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={cn(
        animate && 'animate-pulse',
        className
      )}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M20 0L24.49 15.51L40 20L24.49 24.49L20 40L15.51 24.49L0 20L15.51 15.51L20 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Smaller 4-point star variant
export function StarSmall({
  size = 16,
  className,
  animate = false,
  style,
}: StarDecorationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={cn(
        animate && 'animate-pulse',
        className
      )}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M8 0L9.8 6.2L16 8L9.8 9.8L8 16L6.2 9.8L0 8L6.2 6.2L8 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Decorative star field for backgrounds
export function StarField({ className }: { className?: string }) {
  return (
    <div className={cn('absolute inset-0 pointer-events-none overflow-hidden', className)}>
      <StarDecoration
        size={20}
        className="absolute text-[#1A1A1A]/10 animate-pulse"
        style={{ top: '10%', left: '8%', animationDelay: '0s' }}
      />
      <StarSmall
        size={14}
        className="absolute text-[#D9F99D]/60 animate-pulse"
        style={{ top: '20%', right: '15%', animationDelay: '0.5s' }}
      />
      <StarDecoration
        size={16}
        className="absolute text-[#1A1A1A]/5 animate-pulse"
        style={{ bottom: '25%', left: '12%', animationDelay: '1s' }}
      />
      <StarSmall
        size={12}
        className="absolute text-[#D9F99D]/40 animate-pulse"
        style={{ top: '35%', left: '20%', animationDelay: '0.3s' }}
      />
      <StarDecoration
        size={18}
        className="absolute text-[#1A1A1A]/10 animate-pulse"
        style={{ bottom: '30%', right: '10%', animationDelay: '0.7s' }}
      />
    </div>
  );
}
