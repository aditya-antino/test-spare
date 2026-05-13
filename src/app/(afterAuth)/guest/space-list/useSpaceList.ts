'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedCategories, setSelectedActivities } from '@/store/slice/homePageSearchSlice';
import { RootState } from '@/store/store';
import {
    useGetSpaceTypes,
    useGetAmenities,
    useGetActivities,
    useGetSpaceGuestList,
    useAfterAuthGetSpaceGuestList,
    useGetPublicCategories,
} from '@/services';
import { getPlacesData } from '@/services/guest/categories.services';
import {
    setDate,
    setSelectedPlace,
    setPlacesSearchVal
} from '@/store/slice/homePageSearchSlice';
import { convert12to24 } from '@/lib/utils';
import { FilterSection } from '@/components/common/FilterDrawer';

export const toSlug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

interface FilterState {
    spaceTypeIds: number[];
    activityIds: number[];
    amenityIds: number[];
    instantBooking: boolean;
    attendees?: number;
    minPrice?: number;
    maxPrice?: number;
    date?: Date;
    startTime?: string;
    endTime?: string;
    cityId?: number | string;
    categoryIds?: number[];
}

export const useSpaceList = (initialSpaceData?: any) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch();
    const [initializedFromUrl, setInitializedFromUrl] = useState(false);

    const {
        selectedCategories,
        selectedActivities,
        selectedPlace,
        date: selectedDateFromStore,
    } = useSelector((state: RootState) => state.homeSearchData);
    const { isAuth } = useSelector((state: RootState) => state.auth);

    const [appliedFilters, setAppliedFilters] = useState<FilterState>({
        spaceTypeIds: [],
        activityIds: selectedActivities.flatMap((a) => a.ids) || [],
        amenityIds: [],
        instantBooking: false,
        categoryIds: selectedCategories.map((c) => Number(c.item.id)) || [],
        cityId: selectedPlace?.id,
        date: selectedDateFromStore ? new Date(selectedDateFromStore) : undefined,
    });

    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);
    const [filterSections, setFilterSections] = useState<FilterSection[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(10);

    const { data: categoriesData, isLoading: categoriesLoading } = useGetPublicCategories();
    const { data: spaceTypesData, isLoading: spaceTypesLoading } = useGetSpaceTypes();
    const { data: amenitiesData, isLoading: amenitiesLoading } = useGetAmenities();
    const { data: activitiesData, isLoading: activitiesLoading } = useGetActivities();

    const isSectionsLoading = spaceTypesLoading || amenitiesLoading || activitiesLoading;

    const filterParams = useMemo(() => {
        const getFormattedTime = (time: string | undefined) => {
            if (!time || !time.trim()) return undefined;
            return convert12to24(time);
        };

        const formattedStartTime = getFormattedTime(appliedFilters.startTime);
        const formattedEndTime = getFormattedTime(appliedFilters.endTime);

        return {
            ...(appliedFilters.date && { date: appliedFilters.date }),
            ...(formattedStartTime &&
                formattedStartTime.trim() && { startTime: formattedStartTime }),
            ...(formattedEndTime && formattedEndTime.trim() && { endTime: formattedEndTime }),
            cityId: appliedFilters.cityId || undefined,
            categoryIds: appliedFilters.categoryIds?.join(',') || undefined,
            spaceTypeIds: appliedFilters.spaceTypeIds.length
                ? appliedFilters.spaceTypeIds.join(',')
                : undefined,
            activityIds: appliedFilters.activityIds.length
                ? appliedFilters.activityIds.join(',')
                : undefined,
            amenityIds: appliedFilters.amenityIds.length
                ? appliedFilters.amenityIds.join(',')
                : undefined,
            attendees: appliedFilters.attendees || undefined,
            minPrice: appliedFilters.minPrice || undefined,
            maxPrice: appliedFilters.maxPrice || undefined,
            instantBooking: appliedFilters.instantBooking || undefined,
            page: currentPage,
            limit: limit,
        };
    }, [appliedFilters, currentPage, limit]);

    const guestListQuery = useGetSpaceGuestList(filterParams, { 
        enabled: !isAuth,
        initialData: !isAuth && initialSpaceData ? { success: true, data: initialSpaceData } : undefined
    });
    const afterAuthGuestListQuery = useAfterAuthGetSpaceGuestList(filterParams, { 
        enabled: isAuth,
        initialData: isAuth && initialSpaceData ? { success: true, data: initialSpaceData } : undefined
    });

    const spacesData = isAuth ? afterAuthGuestListQuery.data : guestListQuery.data;
    const spacesLoading = isAuth ? afterAuthGuestListQuery.isLoading : guestListQuery.isLoading;
    const refetch = isAuth ? afterAuthGuestListQuery.refetch : guestListQuery.refetch;

    useEffect(() => {
        const sections: FilterSection[] = [];
        if (spaceTypesData?.data?.spaceTypes) {
            sections.push({
                title: 'Choose Your',
                titleHighlighted: 'Space Type',
                key: 'space_types',
                options: spaceTypesData.data.spaceTypes.map((type) => ({
                    label: type.type,
                    ids: (type as any).ids,
                })),
            });
        }
        if (activitiesData?.data?.activities) {
            sections.push({
                title: 'Choose',
                titleHighlighted: 'Activities',
                key: 'activities',
                options: activitiesData.data.activities.map((activity) => ({
                    label: activity.activity,
                    ids: (activity as any).ids,
                })),
            });
        }
        if (amenitiesData?.data?.amenities) {
            sections.push({
                title: 'Choose from',
                titleHighlighted: 'Amenities',
                key: 'amenities',
                options: amenitiesData.data.amenities.map((amenity) => ({
                    label: amenity.name,
                    ids: (amenity as any).ids,
                })),
            });
        }
        setFilterSections(sections);
    }, [spaceTypesData, activitiesData, amenitiesData]);

    useEffect(() => {
        const resolvedActivityIds = selectedActivities.flatMap((active) => {
            if (active.ids && active.ids.length > 0) return active.ids;

            // Resolve by name if ids is empty (for static activities)
            const matchedActivity = activitiesData?.data?.activities?.find(
                (a) => a.activity.toLowerCase() === active.name.toLowerCase(),
            );
            if (matchedActivity) {
                return (matchedActivity as any).ids || [matchedActivity.id];
            }
            return [];
        });

        setAppliedFilters((prev) => ({
            ...prev,
            categoryIds: selectedCategories.map((c) => Number(c.item.id)) || [],
            activityIds: resolvedActivityIds.length > 0 ? resolvedActivityIds : prev.activityIds,
            cityId: selectedPlace?.id,
            date: selectedDateFromStore ? new Date(selectedDateFromStore) : undefined,
        }));
        setCurrentPage(1);
    }, [
        selectedCategories,
        selectedActivities,
        selectedPlace,
        selectedDateFromStore,
        activitiesData,
    ]);

    // Read URL -> Redux on load
    useEffect(() => {
        if (initializedFromUrl) return;
        if (categoriesLoading || activitiesLoading) return;

        const syncFromUrl = async () => {
            const spaceParam = searchParams.get('space');
            const activityParam = searchParams.get('activity');
            const locationParam = searchParams.get('location');
            const dateParam = searchParams.get('date');

            if (activityParam && activitiesData?.data?.activities) {
                const activitySlugs = activityParam.split(',');

                // Primary activities
                const matchedActivities = activitiesData.data.activities
                    .filter((a: any) => a.activity && activitySlugs.includes(toSlug(a.activity)))
                    .map((a: any) => ({
                        name: a.activity,
                        ids: a.ids
                    }));

                if (matchedActivities.length > 0) {
                    dispatch(setSelectedActivities(matchedActivities));
                }

                // Drawer activities & Amenities
                const drawerActivityIds = activitiesData.data.activities
                    .filter((a: any) => a.activity && activitySlugs.includes(toSlug(a.activity)))
                    .flatMap((a: any) => a.ids || [a.id]);


                setAppliedFilters(prev => ({
                    ...prev,
                    activityIds: Array.from(new Set([...prev.activityIds, ...drawerActivityIds])),
                }));
            }

            const amenitiesParam = searchParams.get('amenities');
            if (amenitiesParam && amenitiesData?.data?.amenities) {
                const amenitySlugs = amenitiesParam.split(',');
                const amenityIds = amenitiesData.data.amenities
                    .filter((am: any) => am.name && amenitySlugs.includes(toSlug(am.name)))
                    .flatMap((am: any) => am.ids || [am.id]);

                setAppliedFilters(prev => ({
                    ...prev,
                    amenityIds: Array.from(new Set([...prev.amenityIds, ...amenityIds])),
                }));
            }

            if (spaceParam && categoriesData?.data?.categories) {
                const spaceSlugs = spaceParam.split(',');

                // Primary Categories
                const matchedCategories = categoriesData.data.categories
                    .filter((c: any) => c.CategoryMaster?.name && spaceSlugs.includes(toSlug(c.CategoryMaster.name)))
                    .map((c: any) => ({
                        item: { id: String(c.categoryId), name: c.CategoryMaster?.name },
                        type: 'spaces'
                    }));

                if (matchedCategories.length > 0) {
                    dispatch(setSelectedCategories(matchedCategories));
                }

                // Space Types
                let spaceTypeIds: number[] = [];
                if (spaceTypesData?.data?.spaceTypes) {
                    spaceTypeIds = spaceTypesData.data.spaceTypes
                        .filter((st: any) => st.type && spaceSlugs.includes(toSlug(st.type)))
                        .flatMap((st: any) => st.ids || [st.id]);
                }

                setAppliedFilters(prev => ({
                    ...prev,
                    spaceTypeIds: Array.from(new Set([...prev.spaceTypeIds, ...spaceTypeIds])),
                }));
            }

            if (locationParam) {
                try {
                    const response = await getPlacesData();
                    if (response?.status === 200) {
                        const { categories: places } = response.data?.data || {};
                        const matchedPlace = places?.find((p: any) => toSlug(p.City?.location || '') === toSlug(locationParam));
                        if (matchedPlace) {
                            const placeObj = { id: String(matchedPlace.cityId), name: matchedPlace.City.location };
                            dispatch(setSelectedPlace(placeObj));
                            dispatch(setPlacesSearchVal(matchedPlace.City.location));
                        }
                    }
                } catch (error) {
                    console.error('Error fetching places for URL sync:', error);
                }
            }

            if (dateParam) {
                const parsedDate = new Date(dateParam);
                if (!isNaN(parsedDate.getTime())) {
                    dispatch(setDate(parsedDate.toISOString()));
                }
            }

            // Secondary filters
            const minPrice = searchParams.get('minPrice');
            const maxPrice = searchParams.get('maxPrice');
            const attendees = searchParams.get('attendees');
            const instant = searchParams.get('instant');

            setAppliedFilters(prev => ({
                ...prev,
                minPrice: minPrice ? parseFloat(minPrice) : prev.minPrice,
                maxPrice: maxPrice ? parseFloat(maxPrice) : prev.maxPrice,
                attendees: attendees ? parseInt(attendees) : prev.attendees,
                instantBooking: instant === 'true' ? true : prev.instantBooking,
            }));

            setInitializedFromUrl(true);
        };

        syncFromUrl();
    }, [categoriesData, activitiesData, categoriesLoading, activitiesLoading, searchParams, dispatch, initializedFromUrl]);

    // Sync State -> URL on changes
    useEffect(() => {
        if (!initializedFromUrl) return;

        const params = new URLSearchParams(searchParams.toString());
        let changed = false;

        // Categories + Space Types
        const categoryNames = selectedCategories.map((c: any) => c.item?.name).filter(Boolean);
        const spaceTypeNames: string[] = [];
        if (spaceTypesData?.data?.spaceTypes) {
            appliedFilters.spaceTypeIds.forEach(id => {
                const type = spaceTypesData.data.spaceTypes.find((t: any) => (t as any).ids?.includes(id) || t.id === id);
                if (type) spaceTypeNames.push(type.type);
            });
        }
        const spacesStr = Array.from(new Set([...categoryNames, ...spaceTypeNames])).map(toSlug).join(',');

        if (spacesStr) {
            if (params.get('space') !== spacesStr) { params.set('space', spacesStr); changed = true; }
        } else {
            if (params.has('space')) { params.delete('space'); changed = true; }
        }

        // Activities + Amenities
        const activityNames = selectedActivities.map((a: any) => a.name).filter(Boolean);
        const drawerActivityNames: string[] = [];
        if (activitiesData?.data?.activities) {
            appliedFilters.activityIds.forEach(id => {
                const act = activitiesData.data.activities.find((a: any) => (a as any).ids?.includes(id) || a.id === id);
                if (act) drawerActivityNames.push(act.activity);
            });
        }
        const activitiesStr = Array.from(new Set([...activityNames, ...drawerActivityNames])).map(toSlug).join(',');

        if (activitiesStr) {
            if (params.get('activity') !== activitiesStr) { params.set('activity', activitiesStr); changed = true; }
        } else {
            if (params.has('activity')) { params.delete('activity'); changed = true; }
        }

        // Amenities
        const amenityNames: string[] = [];
        if (amenitiesData?.data?.amenities) {
            appliedFilters.amenityIds.forEach(id => {
                const am = amenitiesData.data.amenities.find((a: any) => (a as any).ids?.includes(id) || a.id === id);
                if (am) amenityNames.push(am.name);
            });
        }
        const amenitiesStr = Array.from(new Set(amenityNames)).map(toSlug).join(',');

        if (amenitiesStr) {
            if (params.get('amenities') !== amenitiesStr) { params.set('amenities', amenitiesStr); changed = true; }
        } else {
            if (params.has('amenities')) { params.delete('amenities'); changed = true; }
        }

        const locationStr = selectedPlace?.name ? toSlug(selectedPlace.name) : '';
        if (locationStr) {
            if (params.get('location') !== locationStr) { params.set('location', locationStr); changed = true; }
        } else {
            if (params.has('location')) { params.delete('location'); changed = true; }
        }

        const dateStr = selectedDateFromStore ? selectedDateFromStore.split('T')[0] : '';
        if (dateStr) {
            if (params.get('date') !== dateStr) { params.set('date', dateStr); changed = true; }
        } else {
            if (params.has('date')) { params.delete('date'); changed = true; }
        }

        // Secondary filters
        if (appliedFilters.minPrice) {
            if (params.get('minPrice') !== String(appliedFilters.minPrice)) { params.set('minPrice', String(appliedFilters.minPrice)); changed = true; }
        } else if (params.has('minPrice')) { params.delete('minPrice'); changed = true; }

        if (appliedFilters.maxPrice) {
            if (params.get('maxPrice') !== String(appliedFilters.maxPrice)) { params.set('maxPrice', String(appliedFilters.maxPrice)); changed = true; }
        } else if (params.has('maxPrice')) { params.delete('maxPrice'); changed = true; }

        if (appliedFilters.attendees) {
            if (params.get('attendees') !== String(appliedFilters.attendees)) { params.set('attendees', String(appliedFilters.attendees)); changed = true; }
        } else if (params.has('attendees')) { params.delete('attendees'); changed = true; }

        if (appliedFilters.instantBooking) {
            if (params.get('instant') !== 'true') { params.set('instant', 'true'); changed = true; }
        } else if (params.has('instant')) { params.delete('instant'); changed = true; }

        if (changed) {
            router.replace(`?${params.toString()}`, { scroll: false });
        }
    }, [selectedCategories, selectedActivities, selectedPlace, selectedDateFromStore, appliedFilters, searchParams, router, initializedFromUrl]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    const handleSearchBarSearch = ({
        date,
        startTime,
        endTime,
        selectedCategory,
        selectedPlace,
    }) => {
        const isActivity = selectedCategory && 'ids' in selectedCategory;

        setAppliedFilters((prev) => {
            const nextFilters = {
                ...prev,
                cityId: selectedPlace?.id ? Number(selectedPlace.id) : prev.cityId,
                date: date || prev.date,
                startTime: startTime || prev.startTime,
                endTime: endTime || prev.endTime,
            };

            if (isActivity) {
                nextFilters.activityIds = selectedCategory.ids || [];
                nextFilters.categoryIds = [];
            } else if (selectedCategory?.id) {
                nextFilters.categoryIds = [Number(selectedCategory.id)];
                nextFilters.activityIds = [];
            }

            return nextFilters;
        });
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setAppliedFilters((prev) => ({
            ...prev,
            spaceTypeIds: [],
            activityIds: [],
            amenityIds: [],
            minPrice: undefined,
            maxPrice: undefined,
            attendees: undefined,
            categoryIds: [],
        }));
    };

    const drawerSelected = useMemo(() => {
        const selected: Record<string, string[]> = {
            space_types: [],
            activities: [],
            amenities: [],
            categories: selectedCategories.map((c: any) => c.item?.name).filter(Boolean),
        };

        if (spaceTypesData?.data?.spaceTypes) {
            appliedFilters.spaceTypeIds.forEach(id => {
                const type = spaceTypesData.data.spaceTypes.find((t: any) => (t as any).ids?.includes(id) || t.id === id);
                if (type) selected.space_types.push(type.type);
            });
        }

        if (activitiesData?.data?.activities) {
            appliedFilters.activityIds.forEach(id => {
                const act = activitiesData.data.activities.find((a: any) => (a as any).ids?.includes(id) || a.id === id);
                if (act) selected.activities.push(act.activity);
            });
        }

        if (amenitiesData?.data?.amenities) {
            appliedFilters.amenityIds.forEach(id => {
                const am = amenitiesData.data.amenities.find((a: any) => (a as any).ids?.includes(id) || a.id === id);
                if (am) selected.amenities.push(am.name);
            });
        }

        selected.space_types = Array.from(new Set(selected.space_types));
        selected.activities = Array.from(new Set(selected.activities));
        selected.amenities = Array.from(new Set(selected.amenities));

        return selected;
    }, [appliedFilters.spaceTypeIds, appliedFilters.activityIds, appliedFilters.amenityIds, spaceTypesData, activitiesData, amenitiesData]);

    const spaces = useMemo(() => {
        return (spacesData?.data?.records || []).map((space) => ({
            ...space,
            price: parseFloat(space.pricePerHour) || 0,
            rating: parseFloat(space.avgRating) || 0,
            reviews: parseInt(space.reviewCount) || 0,
            seats: space.capacity,
            discountAmount: space.discountAmount || 0,
            isWishlist: space.isWishlist,
            isRefundable: space.isRefundable,
        }));
    }, [spacesData]);

    return {
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
        activitiesLoading,
        spacesData,
        spacesLoading,
        refetch,
        isAuth,
        spaces,
        handleSearchBarSearch,
        clearFilters,
        router,
        spacesDataRaw: spacesData?.data?.records || [],
        selectedCategories,
        selectedActivities,
        drawerSelected,
    };
};