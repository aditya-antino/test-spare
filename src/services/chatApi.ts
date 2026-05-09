import axiosInstance from '@/lib/axiosInstance';

export const fetchUsers = async (userId: number, search?: string) => {
    try {
        const { data } = await axiosInstance.get(`/chat/users/${userId}`, {
            params: search ? { search } : undefined,
        });

        // Handle different possible response structures
        if (data && data.data) {
            return data.data;
        } else if (Array.isArray(data)) {
            return data;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
};

export interface Message {
    id: number;
    senderId: number;
    receiverId: number;
    content: string;
    createdAt: string;
}

export const fetchMessages = async (
    senderId: number,
    receiverId: number,
    bookingId: number,
    page: number,
    limit: number,
): Promise<Message[]> => {
    if (!senderId || !receiverId) {
        console.log('API: Missing senderId or receiverId, returning empty array');
        return [];
    }

    try {
        const res = await axiosInstance.get(`/chat/messages`, {
            params: { senderId, receiverId, bookingId, page },
        });

        // Handle different possible response structures
        if (res.data && res.data.data) {
            return res.data.data;
        } else if (Array.isArray(res.data)) {
            return res.data;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
};

export const getLastBooking = async (id: number) => {
    try {
        const response = await axiosInstance.get(`/host/last-booking/${id}`);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error;
    }
};

export const getMyBookings = async () => {
    const res = await axiosInstance.get('/guest/my-bookings');
    return res.data;
};

export const getBookingMessages = async (isOnHost: boolean) => {
    const res = await axiosInstance.get(
        isOnHost ? '/host/booking-message' : '/guest/booking-message',
    );
    return res.data;
};

export const sendMessageToHost = async (payload: unknown) => {
    const response = await axiosInstance.post(`guest/create-booking-from-chat`, payload);
    return response;
};
