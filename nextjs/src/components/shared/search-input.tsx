'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// SEARCH INPUT - Shared Molecule
// Search input with icon and optional clear button
// ═══════════════════════════════════════════════════════════════════════════

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  showClear?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    {
      value,
      onChange,
      onClear,
      placeholder = 'Search...',
      className,
      showClear = true,
      ...props
    },
    ref
  ) {
    const handleClear = () => {
      onChange('');
      onClear?.();
    };

    return (
      <div className={cn('relative', className)}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={ref}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
          {...props}
        />
        {showClear && value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }
);
