'use client';
import React, { useRef } from 'react';
import BookingCard from '@/components/common/bookingCard/bookingCard';
import { SkeletonCardGrid } from '@/components/skeletons/SkeletonCard';
import { useInfiniteGetRecommendedSpaces } from '@/services/spaces/spaces.service';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

interface RecommendedSpacesProps {
    spaceId?: string | number;
}

const RecommendedSpaces: React.FC<RecommendedSpacesProps> = ({ spaceId }) => {
    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteGetRecommendedSpaces(spaceId, 10);
    const navigationPrevRef = useRef<HTMLButtonElement>(null);
    const navigationNextRef = useRef<HTMLButtonElement>(null);

    if (isLoading) {
        return (
            <div className="mt-12 mb-8 w-full">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 px-2 md:px-0">
                    Similar Spaces You Might Like
                </h2>
                <SkeletonCardGrid
                    count={5}
                    gridClassName="flex overflow-hidden gap-5 px-2 md:px-0"
                    cardClassName="min-w-[100%] sm:min-w-[calc(50%-10px)] md:min-w-[calc(33.333%-13.33px)] lg:min-w-[calc(25%-15px)] xl:min-w-[calc(20%-16px)]"
                />
            </div>
        );
    }

    let recommendedSpaces: any[] = [];
    if (data?.pages) {
        data.pages.forEach((response: any) => {
            let pageSpaces: any[] = [];
            const res: any = response;
            if (Array.isArray(res)) {
                pageSpaces = res;
            } else if (res?.data && Array.isArray(res.data)) {
                pageSpaces = res.data;
            } else if (res?.data?.records && Array.isArray(res.data.records)) {
                pageSpaces = res.data.records;
            } else if (res?.records && Array.isArray(res.records)) {
                pageSpaces = res.records;
            }
            recommendedSpaces = [...recommendedSpaces, ...pageSpaces];
        });
    }

    if (recommendedSpaces.length === 0) {
        return null;
    }

    const mappedSpaces = recommendedSpaces.map((space: any) => ({
        ...space,
        seats: space.capacity || space.seats,
        price: space.pricePerHour || space.location?.pricePerHour || space.price,
        rating: space.avgRating || space.rating,
        reviews: space.reviewCount || space.reviews,
    }));

    return (
        <div className="mt-12 mb-8 w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 px-2 md:px-0">
                Similar Spaces You Might Like
            </h2>

            <div className="relative px-2 md:px-0 group">
                <Swiper
                    modules={[Navigation]}
                    spaceBetween={20}
                    slidesPerView={1}
                    navigation={{
                        prevEl: navigationPrevRef.current,
                        nextEl: navigationNextRef.current,
                    }}
                    onBeforeInit={(swiper) => {
                        // @ts-ignore
                        swiper.params.navigation.prevEl = navigationPrevRef.current;
                        // @ts-ignore
                        swiper.params.navigation.nextEl = navigationNextRef.current;
                    }}
                    onReachEnd={(swiper) => {
                        if (hasNextPage && !isFetchingNextPage) {
                            fetchNextPage();
                        }
                    }}
                    onSlideChange={(swiper) => {
                        if (swiper.isEnd && hasNextPage && !isFetchingNextPage) {
                            fetchNextPage();
                        }
                    }}
                    observer={true}
                    observeParents={true}
                    breakpoints={{
                        640: { slidesPerView: 2 },
                        768: { slidesPerView: 3 },
                        1024: { slidesPerView: 4 },
                        1280: { slidesPerView: 5 },
                    }}
                    className="!pb-4"
                >
                    {mappedSpaces.map((space) => (
                        <SwiperSlide key={space.id} className="h-auto">
                            <div className="h-full w-full flex justify-center">
                                <BookingCard space={space} isNotHomePage={false} showWishlist={true} className="!max-w-none !min-w-0" />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                <button
                    ref={navigationPrevRef}
                    className="absolute left-2 sm:-left-5 top-1/2 -translate-y-1/2 z-10 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-full p-2.5 text-gray-800 hover:bg-gray-50 transition-all disabled:opacity-0 disabled:cursor-not-allowed flex"
                    aria-label="Previous spaces"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <button
                    ref={navigationNextRef}
                    onClick={() => {
                        if (hasNextPage && !isFetchingNextPage) {
                            fetchNextPage();
                        }
                    }}
                    className="absolute right-2 sm:-right-5 top-1/2 -translate-y-1/2 z-10 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-full p-2.5 text-gray-800 hover:bg-gray-50 transition-all disabled:opacity-0 disabled:cursor-not-allowed flex"
                    aria-label="Next spaces"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default RecommendedSpaces;
