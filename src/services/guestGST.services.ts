import axiosInstance from '@/lib/axiosInstance';

const getGuestGST = async () => {
    const response = await axiosInstance.get(`auth/guest-gst`);
    return response.data;
};

const postGuestGST = async (gstData: unknown) => {
    const response = await axiosInstance.put(`auth/guest-gst/verify`, gstData);
    return response.data;
};

const deleteGuestGST = async () => {
    const response = await axiosInstance.delete(`auth/guest-gst`);
    return response.data;
};

export { getGuestGST, postGuestGST, deleteGuestGST };
