import axiosInstance from '@/lib/axiosInstance';

const getNotification = async (roleId: string | number) => {
    const response = await axiosInstance.get(`/notification`);

    return response.data;
};

const clearNotification = async (roleId: string | number) => {
    const response = await axiosInstance.delete(`/notification`);

    return response.data;
};

const getNotificationUnReadCount = async (roleId: string | number) => {
    const response = await axiosInstance.get(`/notification/unread-count`);

    return response.data;
};

export { getNotification, getNotificationUnReadCount, clearNotification };
