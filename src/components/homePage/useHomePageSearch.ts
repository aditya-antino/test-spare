'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { format } from 'date-fns';
import { RootState } from '@/store/store';
import {
    setDate,
    setStartTime,
    setEndTime,
    setSearchVal,
    setPlacesSearchVal,
    setSelectedCategories,
    setSelectedPlace,
    clearAll,
    setSelectedActivities,
} from '@/store/slice/homePageSearchSlice';
import { Item } from '@/types';

export const useHomePageSearch = (isSearchPage = false, onSearch?: any) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const {
        date: dateISO,
        startTime,
        endTime,
        searchVal,
        placesSearchVal,
        selectedCategories,
        selectedPlace,
        selectedActivities,
    } = useSelector((state: RootState) => state.homeSearchData);

    const [activeMobileInput, setActiveMobileInput] = useState<'category' | 'place' | null>(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isPlaceModalOpen, setIsPlacesModalOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const categoryDesktopDropDownRef = useRef<HTMLDivElement>(null);
    const placesDesktopDropDownRef = useRef<HTMLDivElement>(null);
    const mobileModalRef = useRef<HTMLDivElement>(null);

    const date = dateISO ? new Date(dateISO) : undefined;
    const selectedCategory = selectedCategories.length > 0 ? selectedCategories[0] : undefined;
    const selectedActivity = selectedActivities.length > 0 ? selectedActivities[0] : undefined;

    useEffect(() => {
        if (!isSearchPage) {
            dispatch(clearAll());
        }
    }, [isSearchPage, dispatch]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                categoryDesktopDropDownRef.current &&
                !categoryDesktopDropDownRef.current.contains(event.target as Node) &&
                !isMobile
            ) {
                setIsCategoryModalOpen(false);
            }
            if (
                placesDesktopDropDownRef.current &&
                !placesDesktopDropDownRef.current.contains(event.target as Node) &&
                !isMobile
            ) {
                setIsPlacesModalOpen(false);
            }

            if (
                isMobile &&
                activeMobileInput &&
                mobileModalRef.current &&
                !mobileModalRef.current.contains(event.target as Node)
            ) {
                setActiveMobileInput(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobile, activeMobileInput]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (selectedCategories.length === 0 && selectedActivities.length === 0) {
            dispatch(setSearchVal(''));
        } else if (selectedCategories.length > 0) {
            dispatch(setSearchVal(selectedCategories[0].item.name));
        } else if (selectedActivities.length > 0) {
            dispatch(setSearchVal(selectedActivities[0].name));
        }
    }, [selectedCategories, selectedActivities, dispatch]);

    const handleSelect = (item: Item, type: 'spaces' | 'activities') => {
        if (type === 'spaces') {
            dispatch(setSelectedCategories([{ item, type }]));
            dispatch(setSelectedActivities([]));
        } else {
            // Use full backend ids array from HeroDropdownTabs (item.ids) when present
            const allIds = (item as any).ids as number[] | undefined;
            dispatch(
                setSelectedActivities([
                    {
                        name: item.name,
                        ids: allIds && allIds.length ? allIds : [Number(item.id)],
                    },
                ]),
            );
            dispatch(setSelectedCategories([]));
        }
        dispatch(setSearchVal(item.name));
        setIsCategoryModalOpen(false);
        setActiveMobileInput(null);
    };

    const handleSelectPlaces = (item: Item) => {
        dispatch(setSelectedPlace(item));
        dispatch(setPlacesSearchVal(item.name));
        setIsPlacesModalOpen(false);
        setActiveMobileInput(null);
    };

    const handleSearchValChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        dispatch(setSearchVal(value));
        if (!value) {
            dispatch(setSelectedCategories([]));
            dispatch(setSelectedActivities([]));
        }
    };

    const handlePlacesSearchValChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        dispatch(setPlacesSearchVal(value));
        if (!value) dispatch(setSelectedPlace(undefined));
    };

    const handleMobileInputFocus = (type: 'category' | 'place') => {
        setActiveMobileInput(type);
        if (type === 'category') {
            setIsCategoryModalOpen(true);
        } else {
            setIsPlacesModalOpen(true);
        }
    };

    const handleCloseMobileModal = () => {
        setActiveMobileInput(null);
        setIsCategoryModalOpen(false);
        setIsPlacesModalOpen(false);
    };

    const handleDesktopInputFocus = (type: 'category' | 'place') => {
        if (type === 'category') {
            setIsCategoryModalOpen(true);
        } else {
            setIsPlacesModalOpen(true);
        }
    };

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (selectedDate) {
            dispatch(setDate(selectedDate.toISOString()));
        }
    };

    const handlePressSearch = () => {
        const filters = {
            date,
            startTime,
            endTime,
            selectedCategory: selectedCategory?.item || selectedActivity,
            selectedPlace,
        };

        if (isSearchPage && onSearch) {
            onSearch(filters);
            return;
        }

        router.push('/space-list');
    };

    const getDisplayText = (type: 'category' | 'place') => {
        if (type === 'category') {
            if (selectedCategories.length > 0) {
                return selectedCategories[0].item.name;
            } else if (selectedActivities.length > 0) {
                return selectedActivities[0].name;
            }
            return searchVal || 'Enter your activity';
        } else {
            return placesSearchVal || 'Enter name of city';
        }
    };

    return {
        date,
        startTime,
        endTime,
        searchVal,
        placesSearchVal,
        isCategoryModalOpen,
        isPlaceModalOpen,
        isMobile,
        categoryDesktopDropDownRef,
        placesDesktopDropDownRef,
        mobileModalRef,
        activeMobileInput,
        handleSelect,
        handleSelectPlaces,
        handleSearchValChange,
        handlePlacesSearchValChange,
        handleMobileInputFocus,
        handleCloseMobileModal,
        handleDesktopInputFocus,
        handleDateSelect,
        handlePressSearch,
        getDisplayText,
        clearAll: () => dispatch(clearAll()),
        setStartTime: (val: string) => dispatch(setStartTime(val)),
        setEndTime: (val: string) => dispatch(setEndTime(val)),
    };
};
