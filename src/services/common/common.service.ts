import { useMutation, UseMutationOptions, useQuery } from '@tanstack/react-query';
import { Post } from '../api';
import { endpoints } from '../endPoints';
import { ApiResponse } from '@/types/common.types';
import { 
    clearNotification, 
    getNotification, 
    getNotificationUnReadCount 
} from '../notification.services';
import { getStaticPages } from '../staticPages.services';

// upload image
export const useUploadImage = (
    options?: UseMutationOptions<ApiResponse<{ url: string }>, unknown, FormData>,
) => {
    return useMutation({
        mutationKey: ['upload-image'],
        mutationFn: async (formData: FormData) => {
            return await Post<ApiResponse<{ url: string }>>(endpoints.UPLOAD_IMAGE, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        },
        ...options,
    });
};

// upload image with watermark
export const useUploadImageWithWatermark = (
    options?: UseMutationOptions<ApiResponse<{ url: string }>, unknown, FormData>,
) => {
    return useMutation({
        mutationKey: ['upload-image-watermark'],
        mutationFn: async (formData: FormData) => {
            return await Post<ApiResponse<{ url: string }>>(
                endpoints.UPLOAD_IMAGE_WITH_WATERMARK,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                },
            );
        },
        ...options,
    });
};

export function useNotification(roleId: string | number, options = {}) {
    return useQuery({
        queryKey: ['notification', roleId],
        queryFn: function () {
            return getNotification(roleId);
        },
        enabled: !!roleId,
        ...options,
    });
}

export function useNotificationUnReadCount(
    isLoggedIn: boolean,
    roleId: string | number,
    options = {},
) {
    return useQuery({
        queryKey: ['notification-unread-count', roleId],
        queryFn: () => getNotificationUnReadCount(roleId),
        enabled: !!roleId && isLoggedIn,
        refetchInterval: 12000,
        refetchIntervalInBackground: true,
        ...options,
    });
}

export function useClearAllNotification(roleId: string | number, options = {}) {
    return useMutation({
        mutationFn: () => clearNotification(roleId),
        ...options,
    });
}

export const useGetStaticPages = (id: 1 | 2 | 3) => {
    return useQuery({
        queryKey: ['static-pages', id],
        queryFn: () => getStaticPages(id),
        enabled: !!id,
    });
};
