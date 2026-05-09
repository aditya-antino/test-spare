'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

interface ApiBooking {
    guestName: string;
    attendees: number;
    id: string;
    guest?: { firstName: string; avatar?: string };
}

interface ApiDay {
    date: string;
    id?: number;
    bookingCount: number;
    bookings: ApiBooking[];
}

interface MonthlyCalendarProps {
    apiData: ApiDay[];
    blockedData: any[];
    onDayClick: (date: string, isBookings: boolean) => void;
    selectedDate?: string;
    onBlockStrip: (date: string, id: number) => void;
    month?: string; // 'YYYY-MM'
    isClosedDay?: (date: string | Date) => boolean;
}

export function MonthlyCalendar({
    apiData,
    onDayClick,
    selectedDate,
    month,
    blockedData,
    onBlockStrip,
    isClosedDay,
}: MonthlyCalendarProps) {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    function getBlockInfoForDay(date: string, blocks: any[]) {
        const dayBlocks = blocks?.filter((block) => {
            if (!block?.startDatetime || !block?.endDatetime) return false;

            const blockStart = dayjs(block.startDatetime);
            const blockEnd = dayjs(block.endDatetime);
            const currentDate = dayjs(date);

            const blockStartDate = blockStart.startOf('day');
            const blockEndDate = blockEnd.endOf('day');

            return (
                (currentDate.isAfter(blockStartDate) && currentDate.isBefore(blockEndDate)) ||
                currentDate.isSame(blockStartDate, 'day') ||
                currentDate.isSame(blockEndDate, 'day')
            );
        });

        if (!dayBlocks?.length) {
            return { hasBlock: false, isFullDay: false, time: null, id: null };
        }

        const block = dayBlocks[0];
        const blockStart = dayjs(block.startDatetime);
        const blockEnd = dayjs(block.endDatetime);

        const isFullDayBlock =
            blockStart.format('HH:mm') === '00:00' &&
            (blockEnd.format('HH:mm') === '23:59' || blockEnd.format('HH:mm') === '00:00');

        return {
            hasBlock: true,
            isFullDay: isFullDayBlock,
            time: isFullDayBlock
                ? null
                : `${blockStart.format('hh:mm A')} - ${blockEnd.format('hh:mm A')}`,
            id: block.id,
        };
    }

    const monthStart = dayjs(month || dayjs()).startOf('month');
    const monthEnd = dayjs(month || dayjs()).endOf('month');
    const startDate = monthStart.startOf('week');
    const endDate = monthEnd.endOf('week');

    const calendarDays: Array<{
        date: string;
        id?: number;
        dayNumber: number;
        isCurrentMonth: boolean;
        isToday: boolean;
        totalBookings: number;
        events: ApiBooking[];
    }> = [];

    let current = startDate;
    while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
        const dateStr = current.format('YYYY-MM-DD');
        const apiDay = apiData?.find((d) => d.date === dateStr);

        calendarDays.push({
            date: dateStr,
            id: apiDay?.id,
            dayNumber: current.date(),
            isCurrentMonth: current.month() === monthStart.month(),
            isToday: current.isSame(dayjs(), 'day'),
            totalBookings: apiDay?.bookingCount || 0,
            events: apiDay?.bookings || [],
        });

        current = current.add(1, 'day');
    }

    return (
        <div className="bg-white rounded-lg">
            <div className="hidden sm:grid grid-cols-7 gap-1 p-4 border-b">
                {weekDays.map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 border">
                {calendarDays.map((day) => {
                    const blockInfo = getBlockInfoForDay(day.date, blockedData || []);
                    const closedByOperatingHours = isClosedDay?.(day.date) === true;

                    return (
                        <div
                            key={day.date}
                            className={cn(
                                closedByOperatingHours || blockInfo.hasBlock
                                    ? 'opacity-40 cursor-not-allowed'
                                    : 'cursor-pointer',
                                'min-h-[85px] relative md:min-h-[120px] border p-2.5 sm:p-2 transition',
                                day.isCurrentMonth ? 'bg-gray-50' : 'bg-white',
                                day.isToday && 'bg-amber-200 ring-2 ring-amber-500 font-bold',
                                blockInfo.hasBlock && blockInfo.isFullDay && 'bg-red-100',
                                blockInfo.hasBlock && !blockInfo.isFullDay && 'bg-amber-100',
                                closedByOperatingHours && 'bg-gray-100/70',
                                selectedDate === day.date && 'ring-2 ring-amber-500 bg-yellow-50',
                                'hover:bg-gray-200',
                            )}
                            onClick={() => {
                                if (closedByOperatingHours) {
                                    toast.warn('This day is closed', {
                                        toastId: 'day-closed-warning',
                                    });
                                    return;
                                }

                                // FIXED: Call onBlockStrip when clicking on a fully blocked day
                                if (blockInfo.hasBlock && blockInfo.isFullDay) {
                                    onBlockStrip(day.date, blockInfo.id);
                                    return;
                                }

                                // For partially blocked days or normal days, use onDayClick
                                onDayClick(day.date, day.totalBookings > 0);
                            }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span
                                    className={cn(
                                        'text-sm font-medium',
                                        day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400',
                                        day.isToday && 'font-bold',
                                        (blockInfo.hasBlock || closedByOperatingHours) &&
                                        'text-red-600',
                                    )}
                                >
                                    {day.dayNumber}
                                </span>

                                {/* Full Day Blocked */}
                                {blockInfo.hasBlock && blockInfo.isFullDay && (
                                    <>
                                        <div className="opacity-80 hidden px-1 text-white text-sm bg-red-600 rounded-full md:flex justify-center items-center">
                                            Blocked
                                        </div>
                                        <div className="opacity-80 px-1 text-white text-xs bg-red-600 rounded-full md:hidden flex justify-center items-center absolute bottom-3 min-w-5 mt-auto left-1/2 -translate-x-1/2">
                                            Blk
                                        </div>
                                    </>
                                )}

                                {/* Partial Day Blocked */}
                                {blockInfo.hasBlock && !blockInfo.isFullDay && (
                                    <>
                                        <div className="opacity-80 hidden px-1 text-white text-sm bg-amber-600 rounded-full md:flex justify-center items-center">
                                            {blockInfo.time}
                                        </div>
                                        <div className="opacity-80 px-1 text-white text-xs bg-amber-600 rounded-full md:hidden flex justify-center items-center absolute bottom-3 min-w-5 mt-auto left-1/2 -translate-x-1/2">
                                            Part
                                        </div>
                                    </>
                                )}

                                {/* Closed by Operating Hours */}
                                {!blockInfo.hasBlock && closedByOperatingHours && (
                                    <>
                                        <div className="opacity-80 hidden px-1 text-white text-sm bg-neutral-800 rounded-full md:flex justify-center items-center">
                                            Closed
                                        </div>
                                        <div className="opacity-80 px-1 text-white text-sm bg-neutral-800 rounded-full md:hidden flex justify-center items-center absolute bottom-3 min-w-5 mt-auto left-1/2 -translate-x-1/2">
                                            Clo...
                                        </div>
                                    </>
                                )}

                                {/* Bookings Count */}
                                {day.totalBookings > 0 &&
                                    !blockInfo.hasBlock &&
                                    !closedByOperatingHours && (
                                        <>
                                            <div className="text-[#F6CD28] hidden sm:flex text-sm px-1 bg-zinc-800 rounded-full justify-center items-center gap-2.5">
                                                {day.totalBookings} Bookings
                                            </div>
                                            <div className="text-[#F6CD28] absolute bottom-3 sm:hidden min-w-5 mt-auto text-sm px-1 bg-zinc-800 rounded-[100px] inline-flex justify-center items-center gap-2.5">
                                                {day.totalBookings}
                                            </div>
                                        </>
                                    )}
                            </div>

                            {/* Guest Avatars */}
                            {day.events.length > 0 &&
                                !blockInfo.hasBlock &&
                                !closedByOperatingHours && (
                                    <div className="hidden md:flex -space-x-9 mb-2">
                                        {day.events.slice(0, 4).map((event) => (
                                            <div
                                                key={event.id}
                                                className="w-16 h-16 rounded-full bg-gray-300 border-2 border-white overflow-hidden flex items-center justify-center"
                                            >
                                                {event?.guest?.avatar ? (
                                                    <img
                                                        className="w-full rounded-full h-full object-cover"
                                                        src={event?.guest?.avatar}
                                                        alt=""
                                                    />
                                                ) : (
                                                    <span className="text-xs text-gray-600">
                                                        {event?.guest?.firstName[0].toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                        {day.events.length > 4 && (
                                            <div className="w-16 h-16 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center">
                                                <span className="text-xs text-white">
                                                    +{day.events.length - 4}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
