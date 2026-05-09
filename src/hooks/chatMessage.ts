import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { fetchUsers } from '@/services/chatApi';
import { Conversation } from '@/types/chat';
import { getLastBooking } from '@/services/chatApi';

export const useChatUsers = (userId: number, search?: string) => {
    return useQuery<Conversation[]>({
        queryKey: ['chatUsers', userId, search || ''],
        queryFn: () => fetchUsers(userId, search),
        enabled: !!userId,
    });
};

import { fetchMessages, Message } from '@/services/chatApi';

export const useChatMessages = (
    senderId: number,
    receiverId: number,
    bookingId: number,
    page: number,
    limit: number,
) => {
    return useQuery<any>({
        queryKey: ['chatMessages', senderId, receiverId, bookingId, page, limit],
        queryFn: () => {
            const result = fetchMessages(senderId, receiverId, bookingId, page, limit);
            return result;
        },
        enabled: !!senderId && !!receiverId && !!bookingId && page >= 0,
    });
};

export const useLastBooking = (
    id: number,
    callbacks?: {
        onSuccess?: (data: LastBookingResponse) => void;
        onError?: (error: Error) => void;
    },
): UseQueryResult<LastBookingResponse, Error> => {
    const query = useQuery<LastBookingResponse, Error>({
        queryKey: ['lastBooking', id],
        queryFn: async () => {
            try {
                const data = await getLastBooking(id);
                callbacks?.onSuccess?.(data);
                return data;
            } catch (error) {
                callbacks?.onError?.(error as Error);
                throw error;
            }
        },
        enabled: !!id,
    });

    return query;
};

import { getMyBookings } from '@/services/chatApi';

export function useMyBookings() {
    return useQuery({
        queryKey: ['my-bookings'],
        queryFn: getMyBookings,
    });
}

import { getBookingMessages } from '@/services/chatApi';
export type LastBookingResponse = any;

export function useBookingMessages(isOnHost: boolean) {
    return useQuery({
        queryKey: [isOnHost ? 'booking-messages-host' : 'booking-messages-guest'],
        queryFn: () => getBookingMessages(isOnHost),
    });
}

// import { getBookingMessagesHost } from '@/services/chatApi';

// export function useBookingMessagesHost() {
//     return useQuery({
//         queryKey: ['booking-messages-host'], // 👈 correct key
//         queryFn: getBookingMessagesHost,
//     });
// }
