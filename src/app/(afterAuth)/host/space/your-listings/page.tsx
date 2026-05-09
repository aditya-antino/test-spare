'use client';
import BookingCard from '@/components/common/bookingCard/bookingCard';
import { Button } from '@/components/ui/button';
import Typography from '@/components/ui/typoGraphy';
import Pagination from '@/components/ui/CustomPagination';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/constants/path';
import {
    useGetCategories,
    useGetKYCDoc,
    useGetPayoutDetails,
    useGetSpaceListFilter,
} from '@/services';
import { Tabs } from '@/components/ui/tabs';
import Image from 'next/image';
import emptyPlaceHolder from '@/assets/emptyPlaceHolder.svg';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { SpaceListSkeleton } from '@/components/skeletons';
import { EmptyState } from '@/components/common';
import { useYourListings } from './useYourListings';
import { mapYourListingToSpace } from '@/utils/mappers';
import { useGetGuestBookingDetails } from '@/services';

const ITEMS_PER_PAGE = 10;


export default function YourListingsPage() {
    const {
        currentPage,
        setCurrentPage,
        activeTab,
        setActiveTab,
        spaceListResponse,
        isSpaceListLoading,
        spaceTypes,
        handleListSpace,
        handleSpaceClick,
    } = useYourListings(ITEMS_PER_PAGE);

    const { data: bookingDetails } = useGetGuestBookingDetails();

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex flex-col min-h-12 md:flex-row md:items-center md:justify-between gap-4 p-4 sm:p-6">
                <Typography size="4xl" weight="bold" color="text-[#F6CD28]" align="center">
                    Your Listings
                </Typography>
                {spaceListResponse?.data?.rows?.length >= 1 && (
                    <Button onClick={handleListSpace}>List a space</Button>
                )}
            </div>
            <div className="mt-6">
                <Tabs
                    variant="ghost"
                    tabs={spaceTypes?.map((data) => ({ value: String(data.id), label: data.name }))}
                    activeTab={String(activeTab)}
                    onTabChange={(e: any) => setActiveTab(e)}
                />
            </div>

            {isSpaceListLoading ? (
                <div className="mt-4">
                    <SpaceListSkeleton />
                </div>
            ) : spaceListResponse?.data?.rows?.length > 0 ? (
                <div className="grid gap-8 mt-4 grid-cols-[repeat(auto-fill,minmax(18rem,1fr))]">
                    {spaceListResponse?.data?.rows?.map((space: any, i: number) => (
                        <BookingCard
                            onClick={() => handleSpaceClick(space?.id)}
                            showWishlist={false}
                            key={i}
                            space={mapYourListingToSpace(space)}
                            className="max-w-lg"
                            // bookDetail={bookingDetails}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex h-[55vh] items-center justify-center">
                    <EmptyState
                        title="No Listing Found"
                        description="Looks like there are no listings on your profile, so kindly list your profile to get started"
                        actionLabel="List a Space"
                        onAction={handleListSpace}
                    />
                </div>
            )}

            <Pagination
                limit={ITEMS_PER_PAGE}
                count={(spaceListResponse?.data as any)?.totalRows || spaceListResponse?.data?.rows?.length || 1}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
