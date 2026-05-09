import axiosInstance from '@/lib/axiosInstance';

const cancelBooking = async (bookingId: string | number) => {
    const response = await axiosInstance.post(`guest/cancel-booking`, {
        bookingId: bookingId,
        reasonId: 1,
    });
    return response;
};

export { cancelBooking };
