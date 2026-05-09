import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Post, Get, Delete } from '@/services/api';
import { endpoints } from '@/services/endPoints';
import {
    MonthlyCalendarData,
    BlockedSlotsResponse,
    DeleteBlockedSlotsPayload,
    getCalendarProps,
    GuestBookingCalendarResponse,
    GuestTimeSlotsResponse
} from '@/types/calendar.types';

export const useGetCalender = (params: getCalendarProps) => {
    return useQuery<MonthlyCalendarData>({
        queryKey: ['get-calendar', params],
        queryFn: async () =>
            await Get(`${endpoints.GET_CALENDAR}`, {
                params,
            }),
        enabled: !!params.spaceId,
    });
};

export const useGetBlockedTimeSlots = (params: {
    startDate: string;
    endDate: string;
    spaceId: number;
}) => {
    return useQuery<BlockedSlotsResponse>({
        queryKey: ['get-blocked-slots', params],
        queryFn: async () =>
            await Get(`${endpoints.GET_BLOCK_TIME_SLOTS}`, {
                params,
            }),
        enabled: !!params.spaceId,
    });
};

export const useDeleteBlockSlot = (
    props?: UseMutationOptions<any, any, DeleteBlockedSlotsPayload>,
) => {
    return useMutation({
        mutationFn: async (data: { slotId: number }) => {
            return await Delete(`${endpoints.DELETE_BLOCK_TIME_SLOT}`, data);
        },
        ...props,
    });
};

// Get blocked dates for calendar
export const useGetGuestBookingCalendar = (
    spaceId: number,
    options?: UseQueryOptions<GuestBookingCalendarResponse>,
) => {
    return useQuery<GuestBookingCalendarResponse>({
        queryKey: ['guest-booking-calendar', spaceId],
        queryFn: async () => {
            const endpoint = endpoints.GUEST_BOOKING_CALENDAR.replace(
                '{spaceId}',
                spaceId.toString(),
            );
            return await Get<GuestBookingCalendarResponse>(endpoint);
        },
        enabled: !!spaceId && (options?.enabled ?? true),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    });
};

// Get time slots for selected date
export const useGetGuestTimeSlots = (
    spaceId: number,
    selectedDate: string,
    startTime?: string,
    endTime?: string,
    options?: UseQueryOptions<GuestTimeSlotsResponse>,
) => {
    return useQuery<GuestTimeSlotsResponse>({
        queryKey: ['guest-time-slots', spaceId, selectedDate, startTime, endTime],
        queryFn: async () => {
            const endpoint = endpoints.GUEST_BOOKING_TIME_SLOTS.replace(
                '{spaceId}',
                spaceId.toString(),
            );
            const params: any = { date: selectedDate };
            if (startTime) params.startTime = startTime;
            if (endTime) params.endTime = endTime;
            return await Get<GuestTimeSlotsResponse>(endpoint, { params });
        },
        enabled: !!spaceId && !!selectedDate && (options?.enabled ?? true),
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    });
};
