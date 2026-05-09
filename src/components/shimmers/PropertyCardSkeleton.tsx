import React from 'react';

export const PropertyCardSkeleton = () => {
    return (
        <div className="w-full sm:w-[48%] md:w-[31%] lg:w-[23%] rounded-3xl overflow-hidden border border-neutral-300 animate-pulse">
            <div className="w-full h-44 sm:h-48 md:h-56 bg-gray-200" />
            <div className="p-4 pb-6 space-y-3">
                <div className="h-6 bg-gray-200 rounded-md w-3/4" />
                <div className="h-4 bg-gray-200 rounded-md w-1/2" />
            </div>
        </div>
    );
};
