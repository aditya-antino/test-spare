import axiosInstance from '@/lib/axiosInstance';

const getCategoriesData = async () => {
    const response = await axiosInstance(`guest/search/what`);
    return response;
};

const getPlacesData = async () => {
    const response = await axiosInstance(`guest/search/where`);
    return response;
};

export { getCategoriesData, getPlacesData };
