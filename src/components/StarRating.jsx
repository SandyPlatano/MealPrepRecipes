import { Star } from 'lucide-react';
import { cn } from '../lib/utils';

export default function StarRating({ rating, onRatingChange, disabled = false, size = 'md' }) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const handleClick = (value) => {
    if (!disabled && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => handleClick(value)}
          disabled={disabled}
          className={cn(
            'transition-colors',
            disabled ? 'cursor-default' : 'cursor-pointer hover:scale-110',
            !rating || value > rating ? 'text-muted-foreground' : 'text-yellow-500'
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              rating && value <= rating ? 'fill-current' : ''
            )}
          />
        </button>
      ))}
    </div>
  );
}

