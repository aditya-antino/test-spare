'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
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
        <html>
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                    <h2 className="text-3xl font-bold mb-4 text-zinc-900">Something went wrong!</h2>
                    <p className="text-gray-600 mb-8 max-w-md text-center">
                        A critical error occurred. Please try again later.
                    </p>
                    <Button onClick={() => reset()} className="bg-primary hover:bg-primary/90">
                        Try again
                    </Button>
                </div>
            </body>
        </html>
    );
}
