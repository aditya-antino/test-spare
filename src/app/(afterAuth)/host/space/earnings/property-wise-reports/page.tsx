'use client';

import React from 'react';
import Typography from '@/components/ui/typoGraphy';
import { EarningsPagination, PropertyCardSkeleton } from '@/components';
import { ErrorState } from '@/components/common';
import { usePropertyWiseReports } from './usePropertyWiseReports';
import { PropertyWiseReportsCard } from './PropertyWiseReportsCard';

const Page = () => {
    const {
        setPage,
        listings,
        pagination,
        isLoading,
        error,
        handleCardClick,
    } = usePropertyWiseReports();

    if (isLoading) {
        return (
            <div className="flex flex-wrap justify-start gap-4 sm:gap-6 md:gap-8 w-full px-2 sm:px-4 md:px-6 lg:px-8 py-6">
                {[...Array(8)].map((_, i) => (
                    <PropertyCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 h-full flex flex-col">
                <ErrorState
                    title="Failed to load property reports"
                    description="We couldn't fetch your property reports at this time. Please check your connection and try again."
                    onRetry={() => setPage(1)}
                />
            </div>
        );
    }

    if (listings.length === 0) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Typography size="lg" color="text-gray-500">
                    No property reports available.
                </Typography>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-stretch w-full px-2 sm:px-4 md:px-6 lg:px-8 py-6">
            <div className="flex flex-wrap justify-start gap-4 sm:gap-6 md:gap-8 w-full">
                {listings.map((item) => (
                    <PropertyWiseReportsCard
                        key={item.id}
                        id={item.id}
                        images={item.SpaceImages}
                        title={item.title}
                        onClick={handleCardClick}
                    />
                ))}
            </div>

            {pagination.totalPages > 1 && (
                <div className="flex justify-end">
                    <EarningsPagination
                        page={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPrev={() => setPage((prev: number) => Math.max(prev - 1, 1))}
                        onNext={() => setPage((prev: number) => Math.min(prev + 1, pagination.totalPages))}
                    />
                </div>
            )}
        </div>
    );
};

export default Page;
