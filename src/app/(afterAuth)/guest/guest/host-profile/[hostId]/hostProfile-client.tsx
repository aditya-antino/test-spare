'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Star, MessageCircle, Calendar, Home, CheckCircle, UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Footer from '@/components/layout/footer';
import BookingCard from '@/components/common/bookingCard/bookingCard';
import Reviews from '@/components/common/Reviews';
import Pagination from '@/components/ui/CustomPagination';
import { PATHS } from '@/constants/path';
import BecameHostBanner from '@/components/homePage/BecameHostBanner';
import imgSvg from '@/assets/img.svg';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useHostProfileLogic } from './useHostProfile';
import { useGetGuestBookingDetails } from '@/services';
import { capitalizeWord } from '@/utils';
import { SkeletonCardGrid, SkeletonBase, HostProfileSidebarSkeleton } from '@/components/skeletons';
import { cn } from '@/lib/utils';
import { ErrorState } from '@/components/common/ErrorState';

const HostProfileClient = () => {
    const router = useRouter();
    const {
        activeTab,
        setActiveTab,
        setUserHasClickedTab,
        showAllSpaces,
        reviews,
        reviewPagination,
        categoriesData,
        categoriesLoading,
        hostProfileData,
        isHostLoading,
        isSpacesLoading,
        error,
        spaceData,
        reviewsLoading,
        refetchReviews,
        handleSeeMoreReviews,
        handleSpaceClick,
        handleShowMoreSpaces,
        handlePageChange,
        hostData,
    } = useHostProfileLogic();

    const apiData = hostProfileData as any;

    const { data: bookingDetails } = useGetGuestBookingDetails();

    if (error)
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <ErrorState
                    title="Could not load host profile"
                    description="We're having trouble reaching our servers. This could be due to a connection issue or a temporary server error."
                    onRetry={() => window.location.reload()}
                    className="max-w-2xl"
                />
            </div>
        );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 relative">
                    {isHostLoading ? (
                        <HostProfileSidebarSkeleton />
                    ) : (
                        <Card className="p-6 sticky top-8">
                            <div className="inline-block">
                                <div className="relative w-16 h-16 mx-auto">
                                    {hostData?.avatar ? (
                                        <Avatar className="w-16 h-16 rounded-full">
                                            <AvatarImage
                                                src={hostData?.avatar || ''}
                                                alt={hostData?.name || 'Host'}
                                                className="object-cover"
                                            />
                                            <AvatarFallback className="text-sm bg-gray-200 text-gray-600">
                                                {hostData?.name
                                                    ?.split(' ')
                                                    .map((n) => n[0])
                                                    .join('')
                                                    .toUpperCase() || '-'}
                                            </AvatarFallback>
                                        </Avatar>
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                                            <UserIcon className="w-8 h-8 text-gray-400" />
                                        </div>
                                    )}

                                    {hostData?.isVerified && (
                                        <CheckCircle className="absolute top-0 right-0 w-4 h-4 text-yellow-500 bg-white rounded-full shadow-sm" />
                                    )}
                                </div>
                            </div>
                            <div className="mt-3 space-y-2 text-center">
                                <h1 className="text-xl font-semibold text-gray-900 -mb-1">
                                    {hostData?.name}
                                </h1>

                                {hostData.jobTitle && (
                                    <div className="flex items-center justify-center gap-3 text-gray-600">
                                        <span className="text-sm">
                                            {capitalizeWord(hostData.jobTitle)}
                                        </span>
                                    </div>
                                )}

                                {Number(hostData?.avg_rating) > 0 && (
                                    <div className="flex items-center justify-center gap-1">
                                        <Star className="w-4 h-4 text-[#F6CD28] fill-current" />
                                        <span className="text-gray-700 text-sm font-medium">
                                            {Number(hostData?.avg_rating).toFixed(2)}
                                            {hostData?.review_count > 0 &&
                                                ` (${hostData?.review_count} reviews)`}
                                        </span>
                                    </div>
                                )}

                                {hostData?.bio && (
                                    <p className="text-gray-600 text-sm leading-snug mt-4">
                                        {hostData.bio}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                    <Home className="w-4 h-4" />
                                    <span>{hostData?.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                    <MessageCircle className="w-4 h-4" />
                                    <span>{hostData?.languages.join(', ')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                    <Calendar className="w-4 h-4" />
                                    <span>Joined in {hostData?.joinedDate}</span>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                <div className="lg:col-span-2">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            {isHostLoading ? <SkeletonBase className="h-8 w-40" /> : hostData?.name}{' '}
                            <span className="text-[#F6CD28]">Spaces</span> listing
                        </h2>

                        <div className="flex gap-0 mb-6 w-fit">
                            {categoriesLoading ? (
                                <div className="flex gap-2">
                                    <SkeletonBase className="h-9 w-20 rounded-full" />
                                    <SkeletonBase className="h-9 w-24 rounded-full" />
                                    <SkeletonBase className="h-9 w-20 rounded-full" />
                                </div>
                            ) : (
                                categoriesData?.categories?.map((category: any) => (
                                    <button
                                        key={category.id}
                                        onClick={() => {
                                            setActiveTab(category.id);
                                            setUserHasClickedTab(true);
                                        }}
                                        className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${activeTab === category.id ? 'bg-[#F6CD28] text-black rounded-full' : 'text-gray-600 hover:text-gray-900'}`}
                                    >
                                        {category.name}
                                    </button>
                                ))
                            )}
                        </div>

                        <div
                            className={cn(
                                'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 justify-items-center',
                                isSpacesLoading && 'opacity-50',
                            )}
                        >
                            {isSpacesLoading && !spaceData?.spaces.length ? (
                                <SkeletonCardGrid
                                    count={3}
                                    gridClassName="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 col-span-full"
                                    cardClassName="w-full min-w-0"
                                />
                            ) : spaceData?.spaces.length ? (
                                spaceData.spaces.map((space: any) => (
                                    <BookingCard
                                        key={space.id}
                                        space={space}
                                        // bookDetail={bookingDetails}
                                        showWishlist
                                        isInGuestMode={true}
                                        className={'w-full min-w-0'}
                                        onClick={() => handleSpaceClick(space.title)}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-8 text-gray-500">
                                    No spaces found for this category.
                                </div>
                            )}
                        </div>

                        {apiData?.data?.pagination &&
                            apiData.data.pagination.totalProperties > 3 &&
                            !showAllSpaces && (
                                <div className=" flex items-center justify-center">
                                    <Button
                                        variant="outline"
                                        className="w-50"
                                        onClick={handleShowMoreSpaces}
                                    >
                                        Show me more
                                    </Button>
                                </div>
                            )}

                        {showAllSpaces && apiData?.data?.pagination && (
                            <Pagination
                                limit={apiData.data.pagination.limit}
                                count={apiData.data.pagination.totalProperties}
                                currentPage={apiData.data.pagination.currentPage}
                                onPageChange={handlePageChange}
                                totalPage={apiData.data.pagination.totalPages}
                            />
                        )}
                    </div>

                    {reviews && reviews?.length > 0 && (
                        <Reviews
                            reviews={reviews}
                            pagination={reviewPagination}
                            onReviewUpdate={refetchReviews}
                            onViewMore={handleSeeMoreReviews}
                            isLoadingMore={reviewsLoading}
                            isGuestMode={false}
                        />
                    )}

                    <BecameHostBanner
                        customButtonText="Become a host"
                        customImageSrc={imgSvg}
                        customImageAlt="Become a host"
                        customButtonTextSize="text-lg font-semibold"
                        showArrow
                        useDefaultFlow={false}
                        customOnButtonClick={() => router.replace(PATHS.YOUR_LISTING)}
                    />
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default HostProfileClient;
