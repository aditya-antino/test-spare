import axiosInstance from '@/lib/axiosInstance';

const rateGuest = async (
    bookingId: string | number,
    guestId: string | number,
    comments: string,
    rating: number | string,
) => {
    const payload = {
        bookingId: bookingId,
        guestId: guestId,
        comments: comments,
        rating: rating,
    };
    const response = await axiosInstance.post(`host/review`, payload);
    return response;
};

const rateSpace = async (bookingId: string | number, comments: string, rating: number | string) => {
    const payload = {
        bookingId: bookingId,
        comments: comments,
        rating: rating,
    };
    const response = await axiosInstance.post(`guest/review`, payload);
    return response;
};

const getGuestRatingAndDetails = async (guestID: string | number, page: number | string) => {
    const response = await axiosInstance.get(
        `host/guest-review?guestId=${guestID}&page=${page}&limit=5`,
    );
    return response;
};

const getHostRatingAndDetails = async (hostID: string | number, page: number | string) => {
    const response = await axiosInstance.get(
        `guest/host-review?hostId=${hostID}&page=${page}&limit=5`,
    );
    return response;
};

export { rateGuest, rateSpace, getGuestRatingAndDetails, getHostRatingAndDetails };
