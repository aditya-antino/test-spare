import axiosInstance from '@/lib/axiosInstance';

const getBookings = async (
    page: number,
    limit: number,
    status: 'upcoming' | 'cancelled' | 'completed',
) => {
    const response = await axiosInstance.get(
        `guest/my-bookings?page=${page}&limit=${limit}&status=${status}`,
    );
    return response;
};

export { getBookings };
