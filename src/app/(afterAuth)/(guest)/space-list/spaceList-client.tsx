'use client';

import React from 'react';
import HomePageSearchBarTab from '@/components/homePage/HomePageSearchBarTab';
import BookingCard from '@/components/common/bookingCard/bookingCard';
import Footer from '@/components/layout/footer';
import { PATHS } from '@/constants/path';
import { Users, Filter, X, MapPin, Tag } from 'lucide-react';
import FilterPill from '@/components/common/FilterPills';
import SpaceMap from '@/components/common/SpaceMap';
import FiltersDrawerGeneric from '@/components/common/FilterDrawer';
import { SkeletonCardGrid, BannerSkeleton } from '@/components/skeletons';
import { EmptyState, ProudlyNotAi } from '@/components/common';
import Pagination from '@/components/ui/CustomPagination';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSpaceList, toSlug } from './useSpaceList';
import { useGetGuestBookingDetails } from '@/services';
import CategoryBanner from '@/components/common/CategoryBanner';
import { CATEGORY_BANNERS, DEFAULT_BANNER, BannerContent } from '@/constants/categoryBanners';

const transformCategoryData = (categories: any) => {
    if (!Array.isArray(categories)) {
        return [];
    }

    return categories.map((item: any) => ({
        id: String(item.categoryId),
        name: item?.CategoryMaster?.name ?? '',
    }));
};

interface SpaceListClientProps {
    initialSpaceData?: any;
}

const SpaceListClient = ({ initialSpaceData }: SpaceListClientProps) => {
    const {
        appliedFilters,
        setAppliedFilters,
        isFilterDrawerOpen,
        setIsFilterDrawerOpen,
        isMapDialogOpen,
        setIsMapDialogOpen,
        filterSections,
        currentPage,
        setCurrentPage,
        limit,
        categoriesData,
        categoriesLoading,
        isSectionsLoading,
        spacesData: fetchedSpacesData,
        spacesLoading,
        isAuth,
        spaces: fetchedSpaces,
        handleSearchBarSearch,
        clearFilters,
        router,
        activitiesLoading,
        spacesDataRaw: fetchedSpacesDataRaw,
        selectedCategories,
        selectedActivities,
        drawerSelected,
    } = useSpaceList(initialSpaceData);

    const spacesData = fetchedSpacesData || initialSpaceData;

    // We also need to map the raw spaces from our initial data if fetchedSpacesData is missing
    const spacesDataRaw = fetchedSpacesDataRaw?.length
        ? fetchedSpacesDataRaw
        : spacesData?.data?.records || [];

    const spaces = fetchedSpaces?.length
        ? fetchedSpaces
        : (spacesData?.data?.records || []).map((space: any) => ({
              ...space,
              price: parseFloat(space.pricePerHour) || 0,
              rating: parseFloat(space.avgRating) || 0,
              reviews: parseInt(space.reviewCount) || 0,
              seats: space.capacity,
              discountAmount: space.discountAmount || 0,
              isWishlist: space.isWishlist,
              isRefundable: space.isRefundable,
          }));

    const categories = categoriesData?.data?.categories || [];

    const mainHeading = React.useMemo(() => {
        const space = selectedCategories?.[0]?.item?.name || '';
        const activity = selectedActivities?.[0]?.name || '';
        return space || activity || '';
    }, [selectedActivities, selectedCategories]);

    const handleSpaceClick = (slug: string) => {
        router.push(`${PATHS.GUEST_SPACE_DETAILS}/${slug}`);
    };

    return (
        <div className="relative min-h-screen">
            {/* Search Bar - Always Visible */}
            <div className="flex flex-col items-center mx-auto my-4 w-full max-w-6xl px-4">
                <HomePageSearchBarTab isSearchPage onSearch={handleSearchBarSearch} />
            </div>

            {/* Dynamic Hero Banner for Space/Activity */}
            <div className="w-full max-w-6xl mx-auto px-4 md:my-6">
                {categoriesLoading || activitiesLoading ? (
                    <BannerSkeleton />
                ) : (
                    (() => {
                        const slug = mainHeading ? toSlug(mainHeading) : '';
                        const bannerContent = CATEGORY_BANNERS[slug] || DEFAULT_BANNER;
                        return <CategoryBanner content={bannerContent} />;
                    })()
                )}
            </div>


            <div className="flex md:hidden px-4 w-full justify-start items-center border-b pb-4 mb-2">
                <ProudlyNotAi variant="pill" popoverAlign="right" />
            </div>

            {/* Main container with filters + listings on left, map on right */}
            <div className="px-4 md:px-16">
                {/* all 3 Filters together */}
                <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-between md:items-center w-full">
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide py-1 pl-1">
                        <FilterPill
                            triggerMode="custom"
                            placeholder="Price"
                            custom={{
                                type: 'price',
                                value: {
                                    min: appliedFilters.minPrice,
                                    max: appliedFilters.maxPrice,
                                },
                                onApply: (newPrice) => {
                                    setAppliedFilters((prev) => ({
                                        ...prev,
                                        minPrice: newPrice.min,
                                        maxPrice: newPrice.max,
                                    }));
                                },
                            }}
                            className="flex-shrink-0 px-2"
                        />

                        <FilterPill
                            triggerMode="custom"
                            placeholder="Attendees"
                            leftIcon={<Users className="h-4 w-4" />}
                            custom={{
                                type: 'attendees',
                                value: appliedFilters.attendees,
                                onApply: (newAttendees) => {
                                    setAppliedFilters((prev) => ({
                                        ...prev,
                                        attendees: newAttendees,
                                    }));
                                },
                            }}
                            className="flex-shrink-0"
                        />

                        <FilterPill
                            triggerMode="external"
                            placeholder="Filter"
                            leftIcon={<Filter className="h-4 w-4" />}
                            onTrigger={() => setIsFilterDrawerOpen(true)}
                            className="flex-shrink-0"
                        />
                    </div>

                    {/* Proudly Not AI Filter Pill Badge & Info Popover */}
                    <div className="hidden md:block ">
                        <ProudlyNotAi variant="pill" popoverAlign="left" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-4 pt-6 items-stretch">
                    {/* Left container: 2 Listings */}
                    <div className="lg:col-span-2">
                        {/* First 2 Listings */}
                        {spacesLoading ? (
                            <SkeletonCardGrid
                                count={2}
                                gridClassName="grid-cols-1 md:grid-cols-2"
                            />
                        ) : spaces.length === 0 ? (
                            <EmptyState
                                title="No spaces found"
                                description="We couldn't find any spaces matching your criteria. Try adjusting your filters or search location."
                                actionLabel="Clear Filters"
                                onAction={clearFilters}
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full justify-items-center">
                                {spaces.slice(0, 2).map((spaceItem) => (
                                    <BookingCard
                                        key={spaceItem.id}
                                        showWishlist={isAuth}
                                        space={spaceItem as any}
                                        // bookDetail={bookingDetails}
                                        onClick={() => handleSpaceClick(spaceItem.slug)}
                                        className="w-full"
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right container: Map */}
                    <div className="hidden lg:block lg:col-span-2 sticky top-4 min-h-[450px]">
                        <SpaceMap
                            spaces={spacesDataRaw.map((space) => ({
                                id: space.id,
                                title: space.title,
                                slug: space.slug,
                                location: space.location,
                                pricePerHour: space.pricePerHour,
                                discountAmount:
                                    space.discountAmount ?? space.SpaceListing?.discountAmount ?? 0,
                                isRefundable:
                                    space.isRefundable ?? space.SpaceListing?.isRefundable ?? false,
                            }))}
                            onSpaceClick={handleSpaceClick}
                            className="h-full"
                        />
                    </div>
                </div>
            </div>

            {/* 4 col listings */}
            {spacesLoading ? (
                <div className="px-4 md:px-16 py-4">
                    <SkeletonCardGrid
                        count={4}
                        gridClassName="grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
                    />
                </div>
            ) : (
                spaces.length > 2 && (
                    <div className="px-4 md:px-16 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
                            {spaces.slice(2).map((spaceItem) => (
                                <BookingCard
                                    key={spaceItem.id}
                                    showWishlist={isAuth}
                                    space={spaceItem as any}
                                    onClick={() => handleSpaceClick(spaceItem.slug)}
                                    className="w-full"
                                    // bookDetail={bookingDetails}
                                />
                            ))}
                        </div>
                    </div>
                )
            )}

            <div className="md:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
                <button
                    onClick={() => setIsMapDialogOpen(true)}
                    className="bg-primary-p1 hover:bg-primary-p2 text-gray-800 font-semibold py-4 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 border border-primary-p1"
                >
                    <MapPin className="h-5 w-5" />
                    <span>Show Map</span>
                </button>
            </div>

            <Dialog open={isMapDialogOpen} onOpenChange={setIsMapDialogOpen}>
                <DialogContent className="max-w-none w-full h-full m-0 flex items-center justify-center p-4 bg-transparent border-none outline-none shadow-none">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                    <button
                        onClick={() => setIsMapDialogOpen(false)}
                        className="absolute top-2 right-2 z-50 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200 hover:scale-110 transition-all duration-200"
                    >
                        <X className="h-5 w-5 text-gray-700" />
                    </button>
                    <div className="relative w-full h-full max-w-4xl max-h-[90vh] bg-transparent rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl mt-10">
                        <div className="w-full h-full rounded-2xl overflow-hidden">
                            <SpaceMap
                                spaces={spacesDataRaw.map((space) => ({
                                    id: space.id,
                                    title: space.title,
                                    slug: space.slug,
                                    location: space.location,
                                    pricePerHour: space.pricePerHour,
                                    image: space.spaceImages?.[0] || '',
                                    discountAmount:
                                        space.discountAmount ??
                                        space.SpaceListing?.discountAmount ??
                                        0,
                                    isRefundable:
                                        space.isRefundable ??
                                        space.SpaceListing?.isRefundable ??
                                        false,
                                }))}
                                onSpaceClick={handleSpaceClick}
                                className="w-full h-full rounded-2xl"
                            />
                        </div>

                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                            <Button onClick={() => setIsMapDialogOpen(false)} variant="default">
                                Show Listings
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <FiltersDrawerGeneric
                sections={filterSections}
                optionCols={2}
                open={isFilterDrawerOpen}
                onOpenChange={setIsFilterDrawerOpen}
                initialSelected={drawerSelected}
                enableCategorySelection
                categories={transformCategoryData(categories) as any}
                categoriesLoading={categoriesLoading}
                sectionsLoading={isSectionsLoading}
                onCategoryChange={(categoryIds) => {
                    setAppliedFilters((prev) => ({
                        ...prev,
                        categoryIds: categoryIds,
                    }));
                }}
                onApply={(selectedIds) => {
                    setAppliedFilters((prev) => ({
                        ...prev,
                        spaceTypeIds: (selectedIds['space_types'] as number[]) || [],
                        activityIds: (selectedIds['activities'] as number[]) || [],
                        amenityIds: (selectedIds['amenities'] as number[]) || [],
                        instantBooking: !!selectedIds.instantBooking,
                    }));
                    setIsFilterDrawerOpen(false);
                }}
            />

            {!spacesLoading && spaces.length > 0 && spacesData?.data?.count && (
                <div className="px-4 py-8 md:py-12">
                    <Pagination
                        limit={limit}
                        count={spacesData.data.count}
                        currentPage={currentPage}
                        onPageChange={(page) => {
                            setCurrentPage(page);
                        }}
                    />
                </div>
            )}
            <Footer />
        </div>
    );
};

export default SpaceListClient;
