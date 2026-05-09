'use client';
import React from 'react';
import { SearchIcon, X } from 'lucide-react';
import { Input } from '../ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Calendar } from '../ui/calendar';
import HeroTimeSelector from './HeroTimeSelector';
import HeroSpacesDropdown from './HeroDropdownTabs';
import HeroPlacesDropdown from './HeroPlacesDropdown';
import { Button } from '../ui/button';
import { format } from 'date-fns';
import { useHomePageSearch } from './useHomePageSearch';
import LightIcon from '../icons/LightIcon';
import LocationIcon from '../icons/LocationIcon';
import CalendarViewIcon from '../icons/CalendarIcon';

interface HomePageSearchBarTabProps {
    className?: string;
    isSearchPage?: boolean;
    onSearch?: (filters: {
        date?: Date;
        startTime?: string;
        endTime?: string;
        selectedCategory?: any;
        selectedPlace?: any;
    }) => void;
}

const HomePageSearchBarTab = ({
    className,
    isSearchPage = false,
    onSearch,
}: HomePageSearchBarTabProps) => {
    const {
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
        clearAll,
        setStartTime,
        setEndTime,
    } = useHomePageSearch(isSearchPage, onSearch);

    return (
        <>
            <div
                className={`hidden md:flex w-full rounded-[130px] shadow-lg items-center justify-between px-4 pb-2 pt-2 bg-white/95 ${className}`}
            >
                <div
                    className="relative flex items-center justify-center gap-3 pl-4"
                    ref={categoryDesktopDropDownRef}
                >
                    <LightIcon />
                    <div className="flex flex-col w-full relative mt-2">
                        <p className="text-black text-lg font-bold">What are you planning?</p>
                        <Input
                            value={searchVal}
                            onChange={handleSearchValChange}
                            onFocus={() => handleDesktopInputFocus('category')}
                            placeholder="Enter your activity"
                            className="border-none placeholder:text-sm rounded-none shadow-none outline-0 bg-transparent p-0 h-auto text-sm text-slate-700 placeholder:text-black focus-visible:ring-0"
                        />

                        {!isMobile && isCategoryModalOpen && (
                            <div className="absolute top-[120%] left-0 w-80 bg-white border border-slate-100 shadow-xl rounded-2xl z-50">
                                <div className="p-4">
                                    <HeroSpacesDropdown
                                        isOpen={isCategoryModalOpen}
                                        searchVal={searchVal}
                                        onSelect={handleSelect}
                                        onClose={() => {}}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div
                    className="flex items-center justify-center gap-3 border-l pl-7"
                    ref={placesDesktopDropDownRef}
                >
                    <LocationIcon />
                    <div className="flex flex-col w-full relative mt-2">
                        <p className="text-black text-lg font-bold">Where</p>

                        <Input
                            value={placesSearchVal}
                            onChange={handlePlacesSearchValChange}
                            onFocus={() => handleDesktopInputFocus('place')}
                            placeholder="Enter name of city"
                            className="border-none placeholder:text-sm rounded-none shadow-none outline-0 bg-transparent p-0 h-auto text-sm text-slate-700 placeholder:text-black focus-visible:ring-0"
                        />

                        {!isMobile && isPlaceModalOpen && (
                            <div className="absolute top-[120%] left-0 z-50">
                                <div className="p-4 bg-white border border-slate-100 shadow-xl rounded-2xl">
                                    <HeroPlacesDropdown
                                        isOpen={isPlaceModalOpen}
                                        searchVal={placesSearchVal}
                                        onSelect={handleSelectPlaces}
                                        onClose={() => {}}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-center gap-3 border-l pl-7">
                    <CalendarViewIcon />
                    <div className="flex flex-col mt-2">
                        <p className="text-black text-lg font-bold">When</p>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center justify-center gap-3 cursor-pointer select-none">
                                    <div className="text-slate-700 text-sm font-normal">
                                        {date && startTime && endTime ? (
                                            `${format(date, 'dd MMM yyyy')} | ${startTime} - ${endTime}`
                                        ) : date ? (
                                            `${format(date, 'dd MMM yyyy')}`
                                        ) : (
                                            <span className="text-black">Select date and time</span>
                                        )}
                                    </div>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="start"
                                className="w-fit p-0 shadow-xl border border-slate-100 rounded-lg mt-2"
                            >
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={handleDateSelect}
                                    disablePastDates={true}
                                />
                                {date && (
                                    <div className="mt-2 flex flex-col gap-2 p-3 pb-4">
                                        <HeroTimeSelector
                                            label="From"
                                            value={startTime}
                                            onChange={setStartTime}
                                        />
                                        <HeroTimeSelector
                                            label="To"
                                            value={endTime}
                                            onChange={setEndTime}
                                        />
                                    </div>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <div className="flex items-center justify-between gap-6 relative cursor-pointer outline-none">
                    <div>
                        <Button
                            size="sm"
                            variant="outline"
                            className="px-2.5 py-1.5 w-fit mx-auto text-slate-500 rounded-full text-xs sm:text-sm md:text-base border-slate-200"
                            onClick={clearAll}
                        >
                            Clear all
                        </Button>
                    </div>

                    <Button
                        variant={null as any}
                        className="w-16 h-16 rounded-full bg-[#F7CD29] shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 group p-0 flex items-center justify-center border-none"
                        onClick={handlePressSearch}
                    >
                        <SearchIcon className="w-6 h-6 text-white transition-transform duration-200 group-hover:scale-110" />
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:hidden rounded-3xl mt-3 bg-white/80 shadow backdrop-blur-[32px]">
                <div
                    className="relative flex items-center gap-3 w-full px-6 py-4 border-b border-gray-100"
                    onClick={() => handleMobileInputFocus('category')}
                >
                    <LightIcon />
                    <div className="flex flex-col items-start w-full">
                        <div className="text-gray-900 text-base font-semibold mb-1">
                            What are you planning?
                        </div>
                        <div className="text-zinc-800 text-sm font-normal min-h-[20px]">
                            {getDisplayText('category')}
                        </div>
                    </div>
                </div>

                <div
                    className="relative flex items-center justify-between gap-3 w-full px-6 py-4 border-b border-gray-100"
                    onClick={() => handleMobileInputFocus('place')}
                >
                    <LocationIcon />
                    <div className="flex flex-col items-start w-full">
                        <div className="text-gray-900 text-base font-semibold mb-1">Where</div>
                        <div className="text-zinc-800 text-sm font-normal min-h-[20px]">
                            {getDisplayText('place')}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3 w-full px-6 py-4 border-t">
                    <CalendarViewIcon />
                    <div className="flex flex-col items-start w-full">
                        <div className="text-gray-900 text-base font-semibold mb-1">When</div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center justify-center gap-3 cursor-pointer select-none">
                                    <div className="text-zinc-800 text-sm font-normal">
                                        {date && startTime && endTime
                                            ? `${format(date, 'dd MMM yyyy')} | ${startTime} - ${endTime}`
                                            : date
                                              ? `${format(date, 'dd MMM yyyy')}`
                                              : 'Select date and time'}
                                    </div>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="center"
                                className="w-fit p-0 border-0 shadow-none"
                            >
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={handleDateSelect}
                                    className="rounded-md border"
                                    disablePastDates={true}
                                />
                                {date && (
                                    <div className="mt-2 flex flex-col gap-2 px-3 pb-3">
                                        <HeroTimeSelector
                                            label="From"
                                            value={startTime}
                                            onChange={setStartTime}
                                        />
                                        <HeroTimeSelector
                                            label="To"
                                            value={endTime}
                                            onChange={setEndTime}
                                        />
                                    </div>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {isMobile && activeMobileInput === 'category' && (
                <div className="fixed inset-0 z-[9999] bg-white flex flex-col" ref={mobileModalRef}>
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <button onClick={handleCloseMobileModal} className="p-2">
                            <X className="w-5 h-5" />
                        </button>
                        <div className="text-lg font-semibold">What are you planning?</div>
                        <div className="w-9"></div>
                    </div>

                    <div className="p-4 border-b border-gray-200">
                        <Input
                            value={searchVal}
                            onChange={handleSearchValChange}
                            placeholder="Search activities..."
                            className="w-full"
                            autoFocus
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <HeroSpacesDropdown
                            isOpen={true}
                            searchVal={searchVal}
                            onSelect={handleSelect}
                            onClose={handleCloseMobileModal}
                        />
                    </div>
                </div>
            )}

            {isMobile && activeMobileInput === 'place' && (
                <div className="fixed inset-0 z-[9999] bg-white flex flex-col" ref={mobileModalRef}>
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <button onClick={handleCloseMobileModal} className="p-2">
                            <X className="w-5 h-5" />
                        </button>
                        <div className="text-lg font-semibold">Where</div>
                        <div className="w-9"></div>
                    </div>

                    <div className="p-4 border-b border-gray-200">
                        <Input
                            value={placesSearchVal}
                            onChange={handlePlacesSearchValChange}
                            placeholder="Search cities..."
                            className="w-full"
                            autoFocus
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <HeroPlacesDropdown
                            isOpen={true}
                            searchVal={placesSearchVal}
                            onSelect={handleSelectPlaces}
                            onClose={handleCloseMobileModal}
                        />
                    </div>
                </div>
            )}

            {!activeMobileInput && (
                <>
                    <Button
                        size="sm"
                        variant="outline"
                        className="px-2.5 md:hidden mt-4 py-1.5 w-fit mx-auto text-gray-700"
                        onClick={clearAll}
                    >
                        Clear all
                    </Button>
                    <Button
                        variant={null as any}
                        className="w-full md:hidden h-12 !bg-primary-p1 hover:!bg-primary-p2 rounded-full shadow-md mt-3 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center border-none"
                        onClick={handlePressSearch}
                    >
                        <SearchIcon className="w-5 h-5 text-black" />
                    </Button>
                </>
            )}
        </>
    );
};

export default HomePageSearchBarTab;
