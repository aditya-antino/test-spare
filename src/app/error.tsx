'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
            <h2 className="text-2xl font-semibold mb-4 text-zinc-800">Something went wrong!</h2>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
                We encountered an error while loading this page.
            </p>
            <div className="flex gap-4">
                <Button onClick={() => reset()} variant="default">
                    Try again
                </Button>
                <Button onClick={() => window.location.href = '/'} variant="outline">
                    Go Home
                </Button>
            </div>
        </div>
    );
}
