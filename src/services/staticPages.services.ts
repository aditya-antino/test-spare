import axiosInstance from '@/lib/axiosInstance';

const getStaticPages = async (id: 1 | 2 | 3) => {
    const response = await axiosInstance.get(`admin/static-pages?id=${id}`);
    return response;
};

export { getStaticPages };
