import axiosInstance from '@/lib/axiosInstance';

const postContactUSQuery = async (payload: unknown) => {
    const response = await axiosInstance.post(`guest/contact-us`, payload);
    return response;
};

export { postContactUSQuery };
