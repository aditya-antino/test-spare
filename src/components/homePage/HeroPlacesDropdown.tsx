'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getPlacesData } from '@/services/guest/categories.services';
import { handleApiError } from '@/hooks/handleApiError';
import { RootState } from '@/store/store';
import { setSelectedPlace } from '@/store/slice/homePageSearchSlice';
import { cn } from '@/lib/utils';

type Item = {
    id: string;
    name: string;
};

interface HeroDropdownTabsProps {
    isOpen: boolean;
    searchVal: string;
    onSelect: (item: Item) => void;
    onClose: () => void;
}

function ShimmerList() {
    return (
        <div>
            {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="h-6 w-full bg-gray-200 rounded-md mb-2 animate-pulse" />
            ))}
        </div>
    );
}

export default function HeroPlacesDropdown({
    isOpen,
    searchVal,
    onSelect,
    onClose,
}: HeroDropdownTabsProps) {
    const dispatch = useDispatch();
    const selectedPlace = useSelector((state: RootState) => state.homeSearchData.selectedPlace);

    const [places, setPlaces] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPlacesData();
    }, []);

    async function fetchPlacesData() {
        try {
            setLoading(true);
            const response = await getPlacesData();
            if (response?.status === 200) {
                const { categories } = response.data?.data || {};
                const data: Item[] =
                    categories?.map((item: any) => ({
                        id: String(item.cityId),
                        name: item?.City?.location ?? '',
                    })) || [];
                setPlaces(data);
            } else {
                setPlaces([]);
            }
        } catch (error) {
            handleApiError(error);
            setPlaces([]);
        } finally {
            setLoading(false);
        }
    }

    function handleSelect(item: Item) {
        onSelect(item);
        dispatch(setSelectedPlace(item));
        onClose();
    }

    function RenderOptions() {
        return (
            <div className="p-2">
                {places.map((item) => {
                    const isSelected = selectedPlace?.id === item.id;
                    const isMatch =
                        searchVal.trim() &&
                        item.name.toLowerCase().includes(searchVal.toLowerCase());

                    return (
                        <div
                            key={item.id}
                            onClick={() => handleSelect(item)}
                            className={cn(
                                "group px-4 py-3 cursor-pointer rounded-xl transition-all flex items-center justify-between mb-1 last:mb-0",
                                isSelected ? "bg-[#F6CD28]/10" : "hover:bg-gray-50"
                            )}
                        >
                            <span
                                className={cn(
                                    "text-sm transition-colors",
                                    isSelected ? "font-bold text-gray-900" : "text-gray-700 group-hover:text-gray-900",
                                    isMatch && !isSelected && "font-semibold text-[#F6CD28]"
                                )}
                            >
                                {item.name}
                            </span>
                            {isSelected && (
                                <div className="w-2 h-2 rounded-full bg-[#F6CD28]" />
                            )}
                            {isMatch && !isSelected && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F6CD28]">
                                    Match
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    if (!isOpen) return null;

    return (
        <div className="max-h-96 overflow-y-auto">
            <div className="fixed inset-0" onClick={onClose} />
            <div
                className="w-full sm:w-80 bg-white border shadow-lg rounded-2xl overflow-hidden relative z-50"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 max-h-72 overflow-y-auto">
                    {loading ? (
                        <ShimmerList />
                    ) : places.length > 0 ? (
                        <div>
                            {searchVal && (
                                <div className="text-sm text-gray-500 mb-2 px-3">
                                    Showing all matches for "{searchVal}"
                                </div>
                            )}
                            <RenderOptions />
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 px-3">No places found</p>
                    )}
                </div>
            </div>
        </div>
    );
}
