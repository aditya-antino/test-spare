import React from 'react';
import { cn } from '@/lib/utils';

interface TabShimmerProps {
    count?: number;
    variant?: 'underline' | 'pill' | 'outline' | 'ghost';
    className?: string;
}

export const TabShimmer: React.FC<TabShimmerProps> = ({
    count = 4,
    variant = 'underline',
    className,
}) => {
    const baseClasses = 'flex gap-4 py-1 max-w-screen overflow-x-auto px-2';

    const variantClasses = {
        underline: 'border-gray-300',
        pill: 'gap-2',
        outline: 'gap-6',
        ghost: 'gap-4',
    };

    const shimmerBase = 'animate-pulse bg-gray-200 rounded-full';

    const getShimmerWidth = (i: number) => {
        const widths = ['w-16', 'w-20', 'w-24', 'w-28'];
        return widths[i % widths.length];
    };

    const getShimmerHeight = () => {
        switch (variant) {
            case 'pill':
            case 'outline':
            case 'ghost':
                return 'h-9';
            default:
                return 'h-7';
        }
    };

    return (
        <div className={cn(baseClasses, variantClasses[variant], className)}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={cn(shimmerBase, getShimmerWidth(i), getShimmerHeight())} />
            ))}
        </div>
    );
};
