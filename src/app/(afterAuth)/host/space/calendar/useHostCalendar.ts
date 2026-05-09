import { useState, useMemo, useCallback, useEffect } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { toast } from 'react-toastify';
import {
    Space,
    useDeleteBlockSlot,
    useGetBlockedTimeSlots,
    useGetCalender,
    useGetReservationList,
    useGetSpaceList,
} from '@/services';
import { convertUtcToIst } from '@/lib/dateUtils';

dayjs.extend(utc);
dayjs.extend(timezone);

interface TimeSlot {
    startMinutes: number;
    endMinutes: number;
}

export const useHostCalendar = () => {
    const [viewType, setViewType] = useState<'daily' | 'monthly'>('monthly');
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const [currentDate, setCurrentDate] = useState<string>(
        dayjs().tz('Asia/Kolkata').format('YYYY-MM-DD'),
    );

    const [isDeleteSlotModal, setIsDeleteSlotModal] = useState(false);
    const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
    const [isEditDrawer, setIsEditDrawer] = useState(false);
    const [isBlockTimeDrawer, setIsBlockTimeDrawer] = useState(false);
    const [isDetails, setIsDetails] = useState(false);
    const [selectedSpaceId, setSelectedSpaceId] = useState<number | null>(null);
    const [isFullDayBlockDrawer, setIsFullDayBlockDrawer] = useState(false);
    const [slotId, setSlotId] = useState<number | null>(null);
    const [clickedTime, setClickedTime] = useState<{ hour: number; minute: number } | null>(null);
    const [suggestedEndTime, setSuggestedEndTime] = useState<{
        hour: number;
        minute: number;
    } | null>(null);

    const [dateRange, setDateRange] = useState<{
        startDate: string;
        endDate: string;
    }>({
        startDate: dayjs().tz('Asia/Kolkata').startOf('month').toISOString(),
        endDate: dayjs().tz('Asia/Kolkata').endOf('month').toISOString(),
    });

    const { data: spaces, isLoading: isSpaceLoading } = useGetSpaceList();

    const { data: selectedSpaceData, isLoading: isSelectedSpaceDataLoading } =
        useGetReservationList({ bookingId: selectedSpaceId }, { enabled: !!selectedSpaceId });

    const { data: blockedSlots, refetch: refechBlockedSlots } = useGetBlockedTimeSlots({
        spaceId: selectedSpace?.id,
        startDate: convertUtcToIst(dateRange.startDate),
        endDate: convertUtcToIst(dateRange.endDate),
    });

    const { mutate: deleteBlockedSlot } = useDeleteBlockSlot({
        onSuccess: (res) => {
            toast.success(res?.data?.message);
            refechBlockedSlots();
            setIsDeleteSlotModal(false);
        },
        onError: (err) => {
            toast.error(err?.message);
        },
    });

    const { data: monthlyDataApi } = useGetCalender({
        startDatetime: convertUtcToIst(dateRange.startDate),
        endDatetime: convertUtcToIst(dateRange.endDate),
        spaceId: selectedSpace?.id,
    });

    const slots = monthlyDataApi?.data?.operatingHours;

    const isClosedDay = useMemo(() => {
        const closed = new Set<string>();
        if (slots && typeof slots === 'object') {
            Object.entries(slots).forEach(([weekday, cfg]: any) => {
                if (cfg?.is_open === false) closed.add(weekday);
            });
        }
        return (isoDate: string | Date) => {
            const weekday = dayjs(isoDate).format('dddd');
            return closed.has(weekday);
        };
    }, [slots]);

    useEffect(() => {
        if (viewType === 'daily') {
            const baseDate = selectedDate || dayjs().tz('Asia/Kolkata').format('YYYY-MM-DD');
            setCurrentDate(baseDate);
            setDateRange({
                startDate: dayjs(baseDate).startOf('day').toISOString(),
                endDate: dayjs(baseDate).endOf('day').toISOString(),
            });
        } else if (viewType === 'monthly') {
            const monthStart = dayjs().tz('Asia/Kolkata').startOf('month');
            const monthEnd = dayjs().tz('Asia/Kolkata').endOf('month');

            setDateRange({
                startDate: monthStart.toISOString(),
                endDate: monthEnd.toISOString(),
            });
            setCurrentDate(monthStart.format('YYYY-MM-DD'));
        }
    }, [viewType, selectedDate]);

    const handleDayClick = (date: string, isBookings: boolean) => {
        setSelectedDate(date);

        if (isBookings) {
            setViewType('daily');
        } else {
            setIsFullDayBlockDrawer(true);
        }
    };

    function convertAvailableToBlocked(slots: any[]): any[] {
        if (!slots || !Array.isArray(slots) || slots.length === 0) {
            return [];
        }

        return slots
            .map((slot) => {
                try {
                    const start = dayjs.tz(
                        `${slot.date} ${slot.availableFrom}`,
                        'YYYY-MM-DD HH:mm:ss',
                        'Asia/Kolkata',
                    );
                    const end = dayjs.tz(
                        `${slot.date} ${slot.availableTo}`,
                        'YYYY-MM-DD HH:mm:ss',
                        'Asia/Kolkata',
                    );

                    return {
                        id: slot.id,
                        startDatetime: start.toISOString(),
                        endDatetime: end.toISOString(),
                        status: 'blocked',
                        createdAt: slot.createdAt,
                        updatedAt: slot.updatedAt,
                        fromLabel: start.format('hh:mm A'),
                        toLabel: end.format('hh:mm A'),
                    };
                } catch (error) {
                    console.error('Error converting slot:', slot, error);
                    return null;
                }
            })
            .filter(Boolean);
    }

    const IsDayEnabledBlocked = useCallback(() => {
        if (!currentDate) return [];

        const dayName = dayjs(currentDate).format('dddd');
        const isBlocked = monthlyDataApi?.data?.operatingHours?.[dayName]?.is_open === false;

        if (!isBlocked) return [];

        return [
            {
                id: null,
                status: 'blocked',
                startDatetime: dayjs(currentDate).startOf('day').toISOString(),
                endDatetime: dayjs(currentDate).endOf('day').toISOString(),
            },
        ];
    }, [currentDate, monthlyDataApi?.data?.operatingHours]);

    function parseTimeToMinutes(timeStr: string): number {
        if (!timeStr) return -1;

        const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return -1;

        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const period = match[3].toUpperCase();

        if (period === 'PM' && hours !== 12) {
            hours += 12;
        } else if (period === 'AM' && hours === 12) {
            hours = 0;
        }

        return hours * 60 + minutes;
    }

    function findNextAvailableSlot(
        clickedHour: number,
        clickedMinute: number,
        blockedSlots: any[],
        operatingHours: any,
    ) {
        if (!operatingHours) return null;

        const clickedTimeMinutes = clickedHour * 60 + clickedMinute;
        const dayName = dayjs(currentDate).format('dddd');
        const dayConfig = operatingHours?.[dayName];

        if (!dayConfig?.is_open) {
            return null;
        }

        const blockedRanges: TimeSlot[] = (blockedSlots || [])
            .filter((slot) => slot?.status === 'blocked' || slot?.status === 'confirmed')
            .map((slot) => {
                try {
                    const start = dayjs(slot.startDatetime).tz('Asia/Kolkata');
                    const end = dayjs(slot.endDatetime).tz('Asia/Kolkata');
                    return {
                        startMinutes: start.hour() * 60 + start.minute(),
                        endMinutes: end.hour() * 60 + end.minute(),
                    };
                } catch (error) {
                    return null;
                }
            })
            .filter(Boolean)
            .sort((a, b) => a!.startMinutes - b!.startMinutes) as TimeSlot[];

        let currentSessionStart = -1;
        let currentSessionEnd = -1;

        for (const session of dayConfig.sessions || []) {
            const sessionStartMinutes = parseTimeToMinutes(session.from);
            const sessionEndMinutes = parseTimeToMinutes(session.to);

            if (sessionStartMinutes === -1 || sessionEndMinutes === -1) continue;

            let adjustedEndMinutes = sessionEndMinutes;
            if (sessionEndMinutes < sessionStartMinutes) {
                adjustedEndMinutes += 24 * 60;
            }

            if (
                clickedTimeMinutes >= sessionStartMinutes &&
                clickedTimeMinutes < adjustedEndMinutes
            ) {
                currentSessionStart = sessionStartMinutes;
                currentSessionEnd = adjustedEndMinutes;
                break;
            }
        }

        if (currentSessionEnd === -1) {
            return null;
        }

        let suggestedStartMinutes = clickedTimeMinutes;

        for (const blocked of blockedRanges) {
            if (
                clickedTimeMinutes >= blocked.startMinutes &&
                clickedTimeMinutes < blocked.endMinutes
            ) {
                suggestedStartMinutes = blocked.endMinutes;
                break;
            }
        }

        let suggestedEndMinutes = currentSessionEnd;

        for (const blocked of blockedRanges) {
            if (
                blocked.startMinutes > suggestedStartMinutes &&
                blocked.startMinutes < currentSessionEnd
            ) {
                suggestedEndMinutes = blocked.startMinutes;
                break;
            }
        }

        if (suggestedStartMinutes >= suggestedEndMinutes) {
            return null;
        }

        const startHour = Math.floor(suggestedStartMinutes / 60) % 24;
        const startMinute = suggestedStartMinutes % 60;
        const endHour = Math.floor(suggestedEndMinutes / 60) % 24;
        const endMinute = suggestedEndMinutes % 60;

        return {
            start: { hour: startHour, minute: startMinute },
            end: { hour: endHour, minute: endMinute },
        };
    }

    const handleStripClick = (hour: number, minute: number) => {
        if (!selectedSpace?.id) {
            toast.info('Please select a space');
            return;
        }

        const allSlots = [
            ...(IsDayEnabledBlocked() ?? []),
            ...(convertAvailableToBlocked(blockedSlots?.data?.bookingSlots) ?? []),
            ...(monthlyDataApi?.data?.calendar?.[0]?.bookings?.filter(
                (data: any) => data?.status !== 'cancelled',
            ) ?? []),
        ];

        const availableSlot = findNextAvailableSlot(
            hour,
            minute,
            allSlots,
            monthlyDataApi?.data?.operatingHours,
        );

        if (availableSlot) {
            setClickedTime(availableSlot.start);
            setSuggestedEndTime(availableSlot.end);
            setIsBlockTimeDrawer(true);
        } else {
            toast.info('No available time slots at this hour');
        }
    };

    const existingSlots = useMemo(() => {
        return [
            ...(IsDayEnabledBlocked() ?? []),
            ...(convertAvailableToBlocked(blockedSlots?.data?.bookingSlots ?? []) ?? []),
            ...(monthlyDataApi?.data?.calendar?.flatMap(
                (item) => item.bookings?.filter((data: any) => data?.status !== 'cancelled') ?? [],
            ) ?? []),
        ];
    }, [IsDayEnabledBlocked, blockedSlots, monthlyDataApi, currentDate]);

    return {
        viewType, setViewType,
        selectedDate, setSelectedDate,
        currentDate, setCurrentDate,
        isDeleteSlotModal, setIsDeleteSlotModal,
        selectedSpace, setSelectedSpace,
        isEditDrawer, setIsEditDrawer,
        isBlockTimeDrawer, setIsBlockTimeDrawer,
        isDetails, setIsDetails,
        selectedSpaceId, setSelectedSpaceId,
        isFullDayBlockDrawer, setIsFullDayBlockDrawer,
        slotId, setSlotId,
        clickedTime, setClickedTime,
        suggestedEndTime, setSuggestedEndTime,
        dateRange, setDateRange,
        spaces, isSpaceLoading,
        selectedSpaceData, isSelectedSpaceDataLoading,
        blockedSlots, refechBlockedSlots,
        deleteBlockedSlot,
        monthlyDataApi,
        isClosedDay,
        handleDayClick,
        handleStripClick,
        existingSlots,
        convertAvailableToBlocked
    };
};
