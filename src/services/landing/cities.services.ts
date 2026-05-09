import axiosInstance from '@/lib/axiosInstance';

const getCitiesData = async () => {
    const response = await axiosInstance.get(`guest/cities`);
    return response;
};

const getHomeSpacesData = async (id: number | string) => {
    const response = await axiosInstance.get(`guest/home-spaces?city=${id}&limit=10`);
    return response;
};

export { getCitiesData, getHomeSpacesData };
