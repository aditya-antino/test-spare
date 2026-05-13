'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import BookingCard from '@/components/common/bookingCard/bookingCard';
import { Tabs } from '@/components/ui/tabs';
import { TabShimmer } from '@/components';
import { AppErrorBoundary } from '@/components/errors/AppErrorBoundary';
import { SkeletonCard } from '@/components/skeletons/SkeletonCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Heart } from 'lucide-react';

import { useWishlist } from './useWishlist';
import { PATHS } from '@/constants/path';

const WishlistsClient = () => {
    const {
        activeTab,
        setActiveTab,
        tabOptions,
        pagination,
        wishListData,
        loading,
        tabLoading,
        handleLoadMore,
        refetchWishlist,
        router,
    } = useWishlist();

    return (
        <AppErrorBoundary>
            <div className="px-4 sm:px-6 md:px-12 lg:px-20 py-6 sm:py-10">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F6CD28]">
                    My Wishlist
                </div>

                {tabLoading ? (
                    <TabShimmer count={6} className="my-6" />
                ) : (
                    <Tabs
                        tabs={tabOptions}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        variant="pill"
                        className="mt-6 sm:mt-8"
                        activeClass="shadow-md font-normal"
                        inActiveClass=""
                    />
                )}

                <div className="grid gap-6 sm:gap-8 mt-8 sm:mt-12 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {tabLoading || (loading && wishListData.length === 0) ? (
                        Array.from({ length: 8 }).map((_, idx) => <SkeletonCard key={idx} />)
                    ) : wishListData.length > 0 ? (
                        wishListData.map((space) => (
                            <BookingCard
                                key={space.id}
                                space={space}
                                className="w-full"
                                onWishlistToggle={refetchWishlist}
                            />
                        ))
                    ) : (
                        !loading && (
                            <div className="col-span-full">
                                <EmptyState
                                    title="No items in wishlist"
                                    description="Explore spaces and save your favorites here."
                                    icon={<Heart className="h-12 w-12" />}
                                    action={
                                        <Button
                                            variant="default"
                                            className="text-black mt-4"
                                            onClick={() => router.push(PATHS.SPACE_LISTING_PAGE_GUEST)}
                                        >
                                            Explore Spaces
                                        </Button>
                                    }
                                />
                            </div>
                        )
                    )}
                </div>

                {pagination.currPage < pagination.totalPage && wishListData.length > 0 && (
                    <div className="w-fit mx-auto mt-8 sm:mt-10">
                        <Button
                            variant="outline"
                            className="rounded-full px-5 sm:px-6 py-2 text-gray-600 border-gray-400"
                            onClick={handleLoadMore}
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'See More'}
                        </Button>
                    </div>
                )}
            </div>
        </AppErrorBoundary>
    );
};

export default WishlistsClient;
