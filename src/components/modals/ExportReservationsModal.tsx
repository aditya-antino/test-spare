'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Download } from 'lucide-react';
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
import Image from 'next/image';
import { RangeDatePicker } from '../ui/rangePicker';
import { DateRange } from 'react-day-picker';

interface ExportReservationsModalProps {
    open: boolean;
    onClose: () => void;
    onExport?: (filters: { spaceId?: number; startDate?: string; endDate?: string }) => void;
    initialFilters?: { spaceId?: number; startDate?: string; endDate?: string };
}

export function ExportReservationsModal({
    open,
    onClose,
    onExport,
    initialFilters = {},
}: ExportReservationsModalProps) {
    const [spaceId, setSpaceId] = useState<string>();
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: initialFilters.startDate ? new Date(initialFilters.startDate) : undefined,
        to: initialFilters.endDate ? new Date(initialFilters.endDate) : undefined,
    });

    const { data: spaceData, isLoading: spacesLoading } = useGetSpaceList();
    const spaces: Space[] = spaceData?.data?.rows ?? [];

    useEffect(() => {
        if (open) {
            setSpaceId(initialFilters.spaceId?.toString() || '');
            setDateRange({
                from: initialFilters.startDate ? new Date(initialFilters.startDate) : undefined,
                to: initialFilters.endDate ? new Date(initialFilters.endDate) : undefined,
            });
        }
    }, [open, initialFilters]);

    const dateToFullUTCISO = (date: Date) => date?.toISOString();

    const handleRangeChange = (range?: DateRange) => {
        setDateRange(range);
    };

    const handleExportClick = useCallback(() => {
        onExport?.({
            spaceId: spaceId ? Number(spaceId) : undefined,
            startDate: dateRange?.from ? dateToFullUTCISO(dateRange.from) : undefined,
            endDate: dateRange?.to ? dateToFullUTCISO(dateRange.to) : undefined,
        });
        onClose();
    }, [spaceId, dateRange, onExport, onClose]);

    const handleReset = useCallback(() => {
        setSpaceId('');
        setDateRange({ from: undefined, to: undefined });
    }, []);

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Export Reservations"
            icon={<Download className="w-5 h-5" />}
            size="sm"
        >
            <div className="space-y-4">
                {/* Space Select */}
                <Select value={spaceId} onValueChange={setSpaceId} disabled={spacesLoading}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={spacesLoading ? 'Loading...' : 'Select a space'}>
                            {spaceId ? spaces.find((s) => s.id.toString() === spaceId)?.title : ''}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {spaces.map((space: Space) => (
                            <SelectItem key={space.id} value={space.id.toString()}>
                                <div className="flex items-center gap-3">
                                    {space.SpaceImages?.length ? (
                                        <Image
                                            src={space.SpaceImages[0].image_url}
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

                {/* Range Date Picker */}
                <div className="flex w-full">
                    <RangeDatePicker
                        value={dateRange}
                        onChange={handleRangeChange}
                        fromDate={new Date(2020, 0, 1)}
                        toDate={new Date(2030, 11, 31)}
                        className="w-full"
                    />
                </div>

                {/* Buttons */}
                <div className="space-y-3 pt-2">
                    <Button
                        variant="default"
                        className="w-full rounded-full py-3 cursor-pointer"
                        onClick={handleExportClick}
                    >
                        Export
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
