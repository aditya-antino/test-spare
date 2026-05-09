import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva('flex items-center justify-center rounded-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-70', {
    variants: {
        variant: {
            default:
                'text-zinc-800 bg-[#f6cd28] hover:bg-[#F6CD28] rounded-full shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]',
            destructive:
                'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
            outline:
                'border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 outline',
            secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
            ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
            link: 'text-primary ',
            disabled:
                'border border-input bg-gray-200 cursor-not-allowed shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
            pill: 'rounded-full bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 px-5 py-2',
            lightOutline:
                'border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-full',
            yellow: 'bg-primary-p1 hover:bg-yellow-500 text-black font-semibold',
            yellowOutline:
                'border border-[#F6CD28] bg-white hover:bg-yellow-50 text-yellow-600 font-medium',
            tableAction:
                'bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-3 py-1.5 rounded-md',
        },
        size: {
            default: 'px-4 py-2  has-[>svg]:px-4 text-base',
            sm: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5',
            lg: 'px-6 has-[>svg]:px-4',
            icon: 'size-9',
            xs: 'h-6 px-2 py-1 text-xs',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'default',
    },
});

function Button({
    className,
    variant,
    size = 'default',
    asChild = false,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            data-slot="button"
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { Button, buttonVariants };
