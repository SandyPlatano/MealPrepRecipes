'use client';

import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TAG LIST - Shared Molecule
// Displays a list of tags with optional remove functionality
// ═══════════════════════════════════════════════════════════════════════════

interface Tag {
  id: string;
  label: string;
}

interface TagListProps {
  tags: Tag[];
  onRemove?: (id: string) => void;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'md';
  className?: string;
  maxVisible?: number;
}

export function TagList({
  tags,
  onRemove,
  variant = 'secondary',
  size = 'sm',
  className,
  maxVisible,
}: TagListProps) {
  const visibleTags = maxVisible ? tags.slice(0, maxVisible) : tags;
  const hiddenCount = maxVisible ? Math.max(0, tags.length - maxVisible) : 0;

  if (tags.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {visibleTags.map((tag) => (
        <Badge
          key={tag.id}
          variant={variant}
          className={cn(
            'transition-colors',
            size === 'sm' && 'text-xs px-2 py-0.5',
            size === 'md' && 'text-sm px-3 py-1',
            onRemove && 'pr-1'
          )}
        >
          {tag.label}
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(tag.id)}
              className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
              aria-label={`Remove ${tag.label}`}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </Badge>
      ))}
      {hiddenCount > 0 && (
        <Badge variant="outline" className="text-xs px-2 py-0.5">
          +{hiddenCount} more
        </Badge>
      )}
    </div>
  );
}
