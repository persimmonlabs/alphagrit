import * as React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RatingProps {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: number; // Size of the stars
  color?: string; // Color of filled stars
  emptyColor?: string; // Color of empty stars
  className?: string; // Additional class names for the container
}

const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      value,
      max = 5,
      onChange,
      readOnly = false,
      size = 20, // Default size
      color = 'text-yellow-400', // Default filled color
      emptyColor = 'text-neutral-700', // Default empty color
      className,
      ...props
    },
    ref
  ) => {
    const stars = Array.from({ length: max }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= value;

      const handleClick = () => {
        if (!readOnly && onChange) {
          onChange(starValue);
        }
      };

      return (
        <Star
          key={index}
          size={size}
          className={cn(
            isFilled ? color : emptyColor,
            readOnly ? 'cursor-default' : 'cursor-pointer',
            'transition-colors duration-200'
          )}
          onClick={handleClick}
          fill={isFilled ? 'currentColor' : 'none'} // Fill the star if it's considered filled
        />
      );
    });

    return (
      <div ref={ref} className={cn('flex items-center gap-1', className)} {...props}>
        {stars}
      </div>
    );
  }
);
Rating.displayName = 'Rating';

export { Rating };
