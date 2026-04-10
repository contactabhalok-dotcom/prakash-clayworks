import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-terracotta text-white hover:bg-terracotta/90 shadow-md hover:shadow-lg focus-visible:ring-terracotta',
        secondary:
          'bg-clay-brown text-white hover:bg-clay-brown/90 shadow-md hover:shadow-lg focus-visible:ring-clay-brown',
        outline:
          'border-2 border-terracotta text-terracotta bg-transparent hover:bg-terracotta hover:text-white focus-visible:ring-terracotta',
        ghost:
          'text-clay-brown hover:bg-warm-beige focus-visible:ring-clay-brown',
        link: 'text-terracotta underline-offset-4 hover:underline',
        gold: 'bg-gold text-clay-brown hover:bg-gold/90 shadow-md hover:shadow-lg focus-visible:ring-gold',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-lg px-8 text-base',
        xl: 'h-14 rounded-xl px-10 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
