import axiosInstance from '@/lib/axiosInstance';

const getHeaderNotification = async () => {
    const response = await axiosInstance.get(`host/get-status`);
    return response;
};

export { getHeaderNotification };
