import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantStyles = {
      default: 'bg-white',
      gradient: 'bg-linear-to-br from-white to-teal-50',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl shadow-xl p-8 border border-gray-100',
          variantStyles[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

export default Card;
