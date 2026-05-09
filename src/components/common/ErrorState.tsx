import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import Typography from '@/components/ui/typoGraphy';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
    title?: string;
    description?: string;
    onRetry?: () => void;
    retryLabel?: string;
    className?: string;
}

export function ErrorState({
    title = 'Something went wrong',
    description = 'We encountered an error while loading the data. Please try again.',
    onRetry,
    retryLabel = 'Try Again',
    className,
}: ErrorStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center p-8 text-center min-h-[400px] w-full bg-red-50/30 rounded-2xl border border-red-100",
            className
        )}>
            <div className="mb-4 bg-red-100 rounded-full p-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <Typography size="xl" weight="semibold" color="text-red-900" className="mb-2">
                {title}
            </Typography>
            <Typography color="text-red-700" size="sm" className="mb-6 max-w-sm" align="center">
                {description}
            </Typography>
            {onRetry && (
                <Button onClick={onRetry} variant="destructive" className="rounded-full px-8 h-11">
                    {retryLabel}
                </Button>
            )}
        </div>
    );
}
