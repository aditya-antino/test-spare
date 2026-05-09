'use client';
import React, { useEffect, useState } from 'react';
import Typography from '@/components/ui/typoGraphy';
import ArrowScrollWrapper from '@/components/ui/arrowScrollWrapper';
import { Tabs } from '@/components/ui/tabs';
import BookingCard from '@/components/common/bookingCard/bookingCard';
import { getCitiesData, getHomeSpacesData } from '@/services/landing/cities.services';
import { handleApiError } from '@/hooks/handleApiError';
import { TabsSkeleton } from '../shimmers/TabsSkeleton';
import { BookingCardSkeleton } from '../shimmers/BookingCardSkeleton';
import { Space } from '@/services';
import AutoScrollContainer from '../ui/AutoScrollContainer';

interface City {
    id: number;
    city: string;
    state: string;
    total_bookings: string;
    last_space_added: string | null;
    tag: string;
}

interface SpacesByCity {
    [cityName: string]: {
        mostBooked: Space[];
        recentlyAdded: Space[];
    };
}

function mapApiToSpace(apiData: any): Space {
    let finalDiscountAmount = apiData.SpaceListing?.discountAmount || 0;

    if (apiData.SpaceListing?.isRefundable === true) {
        finalDiscountAmount = finalDiscountAmount + 10;
    }

    return {
        id: apiData.id,
        title: apiData.title,
        description: apiData.description,
        address: apiData.address ?? null,
        location: apiData.location ?? null,
        city: apiData.City?.city ?? null,
        City: {
            city: apiData.City?.city ?? '',
            state: apiData.City?.state ?? '',
        },
        capacity: apiData.capacity,
        category_id: apiData.CategoryMaster?.id ?? 0,
        state: apiData.City?.state ?? '',
        space_type_id: apiData.SpaceTypes?.[0]?.id ?? 0,
        status: apiData.status,
        height_ft: apiData.height_ft,
        size_sqft: apiData.size_sqft,
        created_at: apiData.created_at,
        updated_at: apiData.updated_at,
        discountAmount: finalDiscountAmount,
        SpaceImages: (apiData.SpaceImages || []).map((img) =>
            typeof img === 'string' ? img : img.image_url,
        ),

        price: apiData.SpaceListing?.price_per_hour
            ? Number(apiData.SpaceListing.price_per_hour)
            : undefined,
        rating: apiData.avg_rating ? apiData.avg_rating : undefined,
        reviews: apiData.total_reviews ? Number(apiData.total_reviews) : undefined,
        isWishlist: apiData.isWishlist ?? false,
        type: apiData.SpaceTypes?.map((t: any) => t.type).join(', ') ?? undefined,
        seats: apiData.capacity ?? undefined,
        SpaceType: apiData.SpaceTypes?.[0] ?? undefined,
        computed_status: apiData.computed_status,
        current_step: apiData.current_step,
        instantBooking: apiData.SpaceListing?.instant_booking ?? false,
        slug: apiData.slug,
    };
}

export default function ExploreSpaceInCities() {
    const [cityData, setCityData] = useState<City[]>([]);
    const [activeCity, setActiveCity] = useState<string | null>(null);
    const [spacesData, setSpacesData] = useState<SpacesByCity>({});
    const [loadingSpaces, setLoadingSpaces] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);

    const tabsData = (cityData || []).map((item) => ({ label: item.city, value: item.city }));

    useEffect(() => {
        fetchCities();
    }, []);

    useEffect(() => {
        if (activeCity && !spacesData[activeCity]) {
            const cityObj = cityData.find((c) => c.city === activeCity);
            if (cityObj) fetchSpaces(cityObj.id, activeCity);
        }
    }, [activeCity, cityData, spacesData]);

    async function fetchCities() {
        try {
            setLoadingCities(true);
            const response = await getCitiesData();
            if (response.status === 200) {
                const data = response.data.data;
                setCityData(data || []);
                setActiveCity(data[0]?.city || null);
            }
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoadingCities(false);
        }
    }

    async function fetchSpaces(cityId: number, cityName: string) {
        try {
            setLoadingSpaces(true);
            const response = await getHomeSpacesData(cityId);
            if (response.status === 200) {
                const mostBooked: Space[] = response.data.data.mostBookedSpaces || [];
                const recentlyAdded: Space[] = response.data.data.recentlyAddedSpaces || [];

                setSpacesData((prev) => ({
                    ...prev,
                    [cityName]: { mostBooked, recentlyAdded },
                }));
            }
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoadingSpaces(false);
        }
    }

    const currentCitySpaces = activeCity ? spacesData[activeCity] : null;

    if (loadingCities) return <TabsSkeleton />;
    if (!activeCity) return null;

    return (
        <section className="py-2 px-4 md:px-16 flex flex-col gap-10 bg-white relative">
            <div className="flex flex-col gap-3">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                    Explore <span className="text-[#F7CD29]">Spaces</span> in Your City
                </h2>
                <p className="text-black text-sm md:text-base font-medium max-w-lg">
                    Select a city and discover top-rated, instantly bookable spaces available right
                    near you.
                </p>
            </div>

            <Tabs
                tabs={tabsData}
                activeTab={activeCity}
                onTabChange={setActiveCity}
                variant="pill"
                className="overflow-x-auto"
                activeClass="shadow-md font-normal"
                inActiveClass=""
            />
            {currentCitySpaces &&
                Array.isArray(currentCitySpaces.mostBooked) &&
                currentCitySpaces.mostBooked.length > 0 && (
                    <div className="w-full">
                        <div className="mb-2 text-zinc-800 text-xl font-semibold">Most Booked</div>
                        <ArrowScrollWrapper arrowVariant="yellow">
                            {loadingSpaces && !currentCitySpaces
                                ? Array.from({ length: 3 }).map((_, i) => (
                                      <BookingCardSkeleton key={i} />
                                  ))
                                : currentCitySpaces?.mostBooked.map((space, index) => (
                                      <BookingCard
                                          key={index}
                                          space={mapApiToSpace(space)}
                                          isNotHomePage={false}
                                        //   bookDetail={undefined as any}
                                      />
                                  )) || <div className="text-gray-500">No spaces found</div>}
                        </ArrowScrollWrapper>
                    </div>
                )}

            {currentCitySpaces &&
                Array.isArray(currentCitySpaces.recentlyAdded) &&
                currentCitySpaces.recentlyAdded.length > 0 && (
                    <div className="w-full mt-4">
                        <div className="mb-2 text-zinc-800 text-xl font-semibold">
                            Recently Added
                        </div>
                        <ArrowScrollWrapper arrowVariant="yellow">
                            {loadingSpaces && !currentCitySpaces
                                ? Array.from({ length: 3 }).map((_, i) => (
                                      <BookingCardSkeleton key={i} />
                                  ))
                                : currentCitySpaces?.recentlyAdded.map((space, index) => (
                                      <BookingCard
                                          key={index}
                                          space={mapApiToSpace(space)}
                                          isNotHomePage={false}
                                        //   bookDetail={undefined as any}
                                      />
                                  )) || <div className="text-gray-500">No spaces found</div>}
                        </ArrowScrollWrapper>
                    </div>
                )}
        </section>
    );
}
