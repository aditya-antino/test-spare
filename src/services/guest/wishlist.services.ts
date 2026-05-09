import axiosInstance from '@/lib/axiosInstance';

const getWishList = async (page: number, categoryId: number) => {
    const response = await axiosInstance.get(`guest/wishlist?page=${page}&limit=8`, {
        params: { categoryId: categoryId },
    });
    return response;
};

const toggleWishlistItem = async (id: number | string) => {
    const response = await axiosInstance.patch(`guest/wishlist`, { spaceId: id });
    return response;
};

export { getWishList, toggleWishlistItem };
