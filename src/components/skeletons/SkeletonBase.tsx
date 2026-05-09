import { cn } from '@/lib/utils';

interface SkeletonBaseProps {
    className?: string;
    variant?: 'default' | 'circle' | 'rectangle';
}

export function SkeletonBase({ className, variant = 'default' }: SkeletonBaseProps) {
    return (
        <div
            className={cn(
                'animate-pulse bg-gray-200 dark:bg-gray-700',
                variant === 'circle' && 'rounded-full',
                variant === 'rectangle' && 'rounded-md',
                variant === 'default' && 'rounded',
                className
            )}
        />
    );
}
