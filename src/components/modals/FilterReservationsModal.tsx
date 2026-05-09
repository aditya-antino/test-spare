'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Funnel } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Space, useGetSpaceList } from '@/services';
import type { ReservationFilters } from '@/types/reservations';
import Image from 'next/image';
import { RangeDatePicker } from '../ui/rangePicker';
import { DateRange } from 'react-day-picker';

type Props = {
    open: boolean;
    onClose: () => void;
    onApply?: (filters: ReservationFilters) => void;
    initialFilters?: ReservationFilters;
};

export function FilterReservationsModal({ open, onClose, onApply, initialFilters = {} }: Props) {
    const [filters, setFilters] = useState<ReservationFilters>(initialFilters);

    const [range, setRange] = React.useState<DateRange | undefined>({
        from: filters.startDate ? new Date(filters.startDate) : undefined,
        to: filters.endDate ? new Date(filters.endDate) : undefined,
    });

    const handleRangeChange = (newRange?: DateRange) => {
        setRange(newRange);
        handleDateChange('startDate', newRange?.from);
        handleDateChange('endDate', newRange?.to);
    };

    // Fetch spaces
    const { data: spacesData, isLoading: spacesLoading } = useGetSpaceList();
    const spaces = spacesData?.data?.rows || [];

    useEffect(() => {
        if (open) {
            setFilters(initialFilters);
        }
    }, [open, initialFilters]);

    const handleSpaceChange = useCallback((spaceId: string) => {
        setFilters((prev) => ({ ...prev, spaceId: Number(spaceId) }));
    }, []);

    const dateToFullUTCISO = (date: Date) => {
        if (!date) return undefined;
        return date.toISOString();
    };

    const handleDateChange = useCallback((key: 'startDate' | 'endDate', date: Date | undefined) => {
        setFilters((prev) => ({
            ...prev,
            [key]: date ? dateToFullUTCISO(date) : undefined,
        }));
    }, []);

    const handleApply = useCallback(() => {
        onApply?.(filters);
        onClose();
    }, [filters, onApply, onClose]);

    const handleReset = useCallback(() => {
        const resetFilters: ReservationFilters = {};
        setFilters(resetFilters);
        onApply?.(resetFilters);
        onClose();
    }, [onApply, onClose]);

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Filter Reservations"
            icon={<Funnel className="w-5 h-5" />}
            size="sm"
        >
            <div className="space-y-4">
                {/* Space Select */}
                <Select
                    value={filters.spaceId?.toString() || ''}
                    onValueChange={handleSpaceChange}
                    disabled={spacesLoading}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={spacesLoading ? 'Loading...' : 'Select a space'}>
                            {filters.spaceId
                                ? spaces.find((s) => s.id.toString() === filters.spaceId.toString())
                                      ?.title
                                : ''}
                        </SelectValue>
                    </SelectTrigger>

                    <SelectContent>
                        {spaces.map((space: Space) => (
                            <SelectItem key={space.id} value={space.id.toString()}>
                                <div className="flex items-center gap-3">
                                    {space.SpaceImages?.length ? (
                                        <Image
                                            src={space.SpaceImages[0].image_url} // use first image
                                            alt={space.title}
                                            width={64}
                                            height={48}
                                            className="rounded-lg object-cover shrink-0"
                                        />
                                    ) : (
                                        <div className="w-16 h-12 rounded-lg bg-gray-200 shrink-0" />
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{space.title}</span>
                                        <span className="text-xs text-gray-500">
                                            Capacity: {space.capacity} people
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {space.address}
                                        </span>
                                    </div>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <p className="text-sm text-gray-600">
                    Reservations that start or end within the following dates.
                </p>

                <div className="flex w-full">
                    <RangeDatePicker
                        value={range}
                        onChange={handleRangeChange}
                        fromDate={new Date(2020, 0, 1)}
                        toDate={new Date(2030, 11, 31)}
                        className="w-full"
                    />
                </div>

                <div className="space-y-3 pt-2">
                    <Button
                        variant="default"
                        className="w-full rounded-full py-3 cursor-pointer"
                        onClick={handleApply}
                    >
                        Apply
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full rounded-full py-3 cursor-pointer"
                        onClick={handleReset}
                    >
                        Reset
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
