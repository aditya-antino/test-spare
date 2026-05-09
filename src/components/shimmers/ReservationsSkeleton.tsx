import React from 'react';

export const ReservationsSkeleton: React.FC = () => {
    return (
        <div className="flex-1 flex flex-col gap-6 animate-pulse">
            {/* Table Skeleton (Desktop) */}
            <div className="hidden sm:flex flex-col gap-4 h-full">
                <div className="w-full h-12 bg-gray-100 rounded-t-xl" />
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-full h-16 bg-gray-50 rounded-lg border border-gray-100" />
                ))}
            </div>

            {/* Cards Skeleton (Mobile) */}
            <div className="sm:hidden flex flex-col gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="w-full h-64 bg-gray-50 rounded-2xl border border-gray-100 p-4 space-y-4">
                        <div className="flex justify-between">
                            <div className="h-6 w-32 bg-gray-200 rounded" />
                            <div className="h-6 w-8 bg-gray-200 rounded-full" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {Array.from({ length: 6 }).map((_, j) => (
                                <div key={j} className="space-y-2">
                                    <div className="h-3 w-16 bg-gray-200 rounded" />
                                    <div className="h-4 w-24 bg-gray-200 rounded" />
                                </div>
                            ))}
                        </div>
                        <div className="h-10 w-full bg-gray-200 rounded-lg pt-4" />
                    </div>
                ))}
            </div>
        </div>
    );
};
