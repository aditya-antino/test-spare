import axiosInstance from '@/lib/axiosInstance';

const subscribeMail = async (email: string) => {
    const response = await axiosInstance.post(`guest/subscribe-email`, {
        email: email,
    });
    return response;
};

export { subscribeMail };
