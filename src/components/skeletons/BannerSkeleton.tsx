import React from 'react';

export const BannerSkeleton: React.FC = () => {
    return (
        <div className="w-full border-y py-8 md:py-12 mb-6 relative overflow-hidden flex flex-col items-center text-center px-4">
            <div className="relative z-10 max-w-4xl w-full animate-pulse">
                {/* Title Skeleton */}
                <div className="h-10 md:h-14 bg-gray-100 rounded-lg w-3/4 mx-auto mb-4" />

                <div className="flex flex-col items-center gap-4">
                    {/* Description Skeleton */}
                    <div className="space-y-3 w-full max-w-2xl mx-auto">
                        <div className="h-4 md:h-6 bg-gray-50 rounded w-full" />
                        <div className="h-4 md:h-6 bg-gray-50 rounded w-5/6 mx-auto" />
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                        <div className="h-px w-12 bg-gray-100" />
                        <div className="w-2 h-2 rounded-full bg-gray-100" />
                        <div className="h-px w-12 bg-gray-100" />
                    </div>
                </div>

                {/* Footer Skeleton */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 border-t border-gray-100 pt-6">
                    <div className="h-4 w-32 bg-gray-50 rounded" />
                    <div className="h-4 w-32 bg-gray-50 rounded hidden sm:block" />
                    <div className="h-4 w-40 bg-gray-50 rounded hidden sm:block" />
                </div>
            </div>
        </div>
    );
};
