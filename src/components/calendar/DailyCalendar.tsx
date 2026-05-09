'use client';

import React from 'react';
import { Clock, User, Users, CheckCircle2 } from 'lucide-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { cn } from '@/lib/utils';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { SLOT_HEIGHT } from '@/constants';

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

interface Booking {
    id: number;
    startDatetime: string;
    endDatetime: string;
    status: 'confirmed' | 'cancelled' | 'pending' | 'blocked' | string;
    guestName?: string;
    attendees?: number;
    guest?: {
        firstName?: string;
        lastName?: string;
    };
}

interface DailyCalendarProps {
    bookings: Booking[];
    onStripClick: (hour: number, minute: number) => void;
    onColorStrip: (id: number) => void;
    onBlockStrip: (id: number) => void;
    operatingHours?: any;
    currentDate?: string;
}

export function DailyCalendar({
    bookings = [],
    onStripClick,
    onColorStrip,
    onBlockStrip,
    operatingHours,
    currentDate,
}: DailyCalendarProps) {


    const processedBookings =
        bookings
            ?.map((booking) => {
                // Parse exactly as the API provided it in local IST
                const start = dayjs.tz(booking.startDatetime, 'Asia/Kolkata');
                const end = dayjs.tz(booking.endDatetime, 'Asia/Kolkata');
                // console.log("hello ", start.format())

                const startMinutesFromMidnight = start.hour() * 60 + start.minute();
                const endMinutesFromMidnight = end.hour() * 60 + end.minute();

                const top = (startMinutesFromMidnight / 60) * SLOT_HEIGHT;
                const height =
                    ((endMinutesFromMidnight - startMinutesFromMidnight) / 60) * SLOT_HEIGHT;

                return {
                    ...booking,
                    start,
                    end,
                    top,
                    height,
                };
            })
            .filter((b) => b.height > 0) ?? [];

    const validDate = currentDate
        ? dayjs(currentDate).tz('Asia/Kolkata')
        : dayjs().tz('Asia/Kolkata');
    const dayName = validDate.format('dddd');

    const dayConfig = operatingHours?.[dayName] ?? {
        is_open: true,
        sessions: [{ from: '12:00 AM', to: '11:59 PM' }],
    };

    if (!dayConfig.is_open) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
                This space is closed on {dayName}s
            </div>
        );
    }

    const parseTimeToHour = (timeStr: string): number => {
        const match = timeStr?.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return 0;

        let hours = parseInt(match[1], 10);
        const period = match[3].toUpperCase();
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        return hours;
    };

    let earliestStart = 0;
    let latestEnd = 24;

    if (dayConfig.sessions?.length) {
        const sessionHours = dayConfig.sessions.flatMap((session: any) => {
            const startHour = parseTimeToHour(session.from);
            const endHour = parseTimeToHour(session.to);

            if (endHour <= startHour) return [startHour, endHour + 24];
            return [startHour, endHour];
        });

        earliestStart = Math.min(...sessionHours);
        latestEnd = Math.max(...sessionHours);

        if (latestEnd > 24) latestEnd = 24;
    }

    const timeSlots = Array.from(
        { length: latestEnd - earliestStart },
        (_, i) => earliestStart + i,
    ).map((hour) => ({
        hour: hour % 24,
        label: dayjs()
            .hour(hour % 24)
            .minute(0)
            .format('h A'),
    }));

    return (
        <div className="border border-gray-300 relative overflow-y-auto">
            <div className="relative">
                {timeSlots.map((slot) => (
                    <div
                        key={slot.hour}
                        className="flex border-t border-gray-300 hover:bg-gray-50 cursor-pointer relative"
                        style={{ height: SLOT_HEIGHT }}
                        onClick={(e) => {
                            if ((e.target as HTMLElement).closest('.booking-strip')) return;
                            onStripClick(slot.hour, 0);
                        }}
                    >
                        <div className="w-20 flex items-center justify-start border-r border-gray-300 px-2 text-xs text-gray-500">
                            {slot.label}
                        </div>
                        <div className="flex-1 border-l border-gray-100 relative"></div>
                    </div>
                ))}

                {processedBookings.map((booking) =>
                    booking.status !== 'blocked' ? (
                        <div
                            key={booking.id}
                            onClick={() => onColorStrip(booking.id)}
                            className={cn(
                                'absolute cursor-pointer border z-10 bg-[#FCECBA] border-[#FCECBA] rounded flex flex-col justify-center h-full px-2 py-1',
                            )}
                            style={{
                                left: '80px',
                                right: '16px',
                                top: `${booking.top - earliestStart * SLOT_HEIGHT}px`,
                                height: `${Math.max(booking.height, 20)}px`,
                            }}
                        >
                            <div className="flex flex-row h-full gap-1 pt-4 sm:pt-8">
                                <div className="text-xs text-gray-700 flex items-center gap-1">
                                    <CheckCircle2 className="h-4 w-4" />
                                    {booking.id}
                                </div>
                                <div className="text-xs text-gray-700 flex items-center gap-1 font-medium">
                                    <User className="h-4 w-4" />
                                    {booking.guest?.firstName} {booking.guest?.lastName}
                                </div>
                                <div className="text-xs text-gray-700 flex items-center gap-1">
                                    <Users className="h-4 w-4" /> {booking.attendees ?? 1} attendees
                                </div>
                                <div className="text-xs text-gray-700 flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {booking.start.format('hh:mm A')} →{' '}
                                    {booking.end.format('hh:mm A')}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div
                            key={booking.id}
                            onClick={() => onBlockStrip(booking.id)}
                            className="absolute cursor-pointer border flex items-center justify-center px-2 py-1 z-10 bg-gray-200 border-gray-300 text-xs text-gray-700 rounded"
                            style={{
                                left: '80px',
                                right: '16px',
                                top: `${booking.top - earliestStart * SLOT_HEIGHT}px`,
                                height: `${Math.max(booking.height, 20)}px`,
                            }}
                        >
                            Blocked
                        </div>
                    ),
                )}
            </div>
        </div>
    );
}
