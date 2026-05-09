'use client';

import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Space } from '@/services';
import dayjs from 'dayjs';
import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';

interface CalendarHeaderProps {
    currentDate: string;
    selectedSpace?: Space;
    viewType: 'daily' | 'monthly';
    onDateChange: (date: { startDate: any; endDate: any }) => void;
    onSpaceChange: (space: Space) => void;
    onViewTypeChange: (viewType: 'daily' | 'monthly') => void;
    onEditListing?: (space: Space) => void;
    spaces: Array<Space>;
    isLoading: boolean;
}

export function CalendarHeader({
    currentDate,
    selectedSpace,
    viewType,
    onDateChange,
    onSpaceChange,
    onViewTypeChange,
    onEditListing,
    spaces = [],
    isLoading,
}: CalendarHeaderProps) {
    // helper to calculate start/end ISO strings
    const getRange = (date: string, type: 'daily' | 'monthly') => {
        const d = dayjs(date);
        if (type === 'daily') {
            return {
                startDate: d.startOf('day').toISOString(), // e.g. 2025-08-19T00:00:00.000Z
                endDate: d.endOf('day').toISOString(), // e.g. 2025-08-19T23:59:59.999Z
            };
        }
        return {
            startDate: d.startOf('month').toISOString(),
            endDate: d.endOf('month').toISOString(), // e.g. 2025-08-31T23:59:59.999Z
        };
    };

    const handleToday = () => {
        onDateChange(getRange(dayjs().toISOString(), viewType));
    };

    const handlePrevious = () => {
        const newDate =
            viewType === 'daily'
                ? dayjs(currentDate).subtract(1, 'day')
                : dayjs(currentDate).subtract(1, 'month');
        onDateChange(getRange(newDate.toISOString(), viewType));
    };

    const handleNext = () => {
        const newDate =
            viewType === 'daily'
                ? dayjs(currentDate).add(1, 'day')
                : dayjs(currentDate).add(1, 'month');
        onDateChange(getRange(newDate.toISOString(), viewType));
    };

    const formatDisplayDate = () => {
        return viewType === 'daily'
            ? dayjs(currentDate).format('DD MMM YYYY dddd')
            : dayjs(currentDate).format('MMMM YYYY');
    };

    useEffect(() => {
        if (!selectedSpace && spaces.length > 0) {
            onSpaceChange(spaces[0]); // set first space as default
        }
    }, [spaces, selectedSpace, onSpaceChange]);

    return (
        <div className="flex flex-col items-center justify-between mb-6 px-4 gap-4">
            <div className="flex flex-col sm:flex-row md:items-center gap-4 mt-4 sm:mt-0 justify-between w-full">
                <h1 className="text-4xl font-bold text-[#F6CD28]">Calendar</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="viewType"
                                value="daily"
                                checked={viewType === 'daily'}
                                onChange={() => {
                                    const today = new Date();
                                    const dateString = dayjs(today).format('YYYY-MM-DD');
                                    onDateChange(getRange(dateString, viewType));
                                    onViewTypeChange('daily');
                                }}
                            />
                            <span className="text-sm font-medium">Daily Overview</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="viewType"
                                value="monthly"
                                checked={viewType === 'monthly'}
                                onChange={() => onViewTypeChange('monthly')}
                            />
                            <span className="text-sm font-medium">Monthly Overview</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-4 sm:gap-6 w-full">
                <div className="flex items-center gap-3">
                    {viewType === 'daily' && (
                        <Button
                            variant="yellow"
                            className="rounded-full px-4 py-2"
                            onClick={handleToday}
                        >
                            Today
                        </Button>
                    )}

                    <div className="flex w-full justify-between items-center gap-4">
                        <span className="text-lg text-nowrap font-medium text-gray-900 min-w-[120px] text-center">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button className="border-0 shadow-none" variant="outline">
                                        {formatDisplayDate()}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        onSelect={(date) =>
                                            onDateChange(getRange(date.toISOString(), viewType))
                                        }
                                    />
                                </PopoverContent>
                            </Popover>
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handlePrevious}
                                className="p-2 cursor-pointer"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleNext}
                                className="p-2 cursor-pointer"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Select
                        value={selectedSpace?.id ? String(selectedSpace.id) : ''}
                        onValueChange={(value) => {
                            const selected = spaces.find((s: Space) => String(s.id) === value);
                            if (selected) {
                                onSpaceChange(selected); // pass full object to parent if you want
                            }
                        }}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="w-80 cursor-pointer">
                            <SelectValue
                                placeholder={isLoading ? 'Loading...' : 'Select a space'}
                            />
                        </SelectTrigger>

                        <SelectContent>
                            {spaces?.map((space: Space) => (
                                <SelectItem key={space.id} value={String(space.id)}>
                                    <div className="flex items-center gap-3 cursor-pointer">
                                        {space?.SpaceImages?.length > 0 ? (
                                            <Image
                                                src={space.SpaceImages[0].image_url}
                                                alt={space.title}
                                                width={32}
                                                height={32}
                                                className="rounded-full w-8 h-8 object-cover shrink-0"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                                        )}

                                        <span
                                            className="
        block
        text-sm text-gray-800 leading-snug
        overflow-hidden
        text-ellipsis
        whitespace-normal
        [display:-webkit-box]
        [-webkit-line-clamp:2]
        [-webkit-box-orient:vertical]
        max-w-[180px] sm:max-w-[220px]
        cursor-pointer
      "
                                        >
                                            {space.title}
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        variant={selectedSpace ? 'outline' : 'disabled'}
                        disabled={!selectedSpace}
                        className="rounded-full text-nowrap w-fit"
                        onClick={() => onEditListing(selectedSpace)}
                    >
                        Edit Listing
                    </Button>
                </div>
            </div>
        </div>
    );
}
