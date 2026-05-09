import { useMutation, UseMutationOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { Post, Get, Patch, Put, Delete } from '@/services/api';
import { endpoints } from '@/services/endPoints';
import { ApiResponse } from '@/types/common.types';
import { UserProfile, HostProfileParams } from '@/types/user.types';
import { DdlData } from '@/types/common.types';
import { deleteGuestGST, getGuestGST, postGuestGST } from '@/services/guestGST.services';

export const useGetProfile = () => {
    const isClient = typeof window !== 'undefined';

    return useQuery<ApiResponse<UserProfile>>({
        queryKey: ['get-profile'],
        queryFn: async () => await Get(endpoints.AUTH_PROFILE),
        enabled: isClient && localStorage.getItem('accessToken') !== null,
    });
};

export const useGetCities = () => {
    return useQuery<ApiResponse<DdlData[]>>({
        queryKey: ['get-cities'],
        queryFn: async () => await Get(endpoints.GET_CITIES),
        enabled: true,
    });
};

export const useGetLanguages = () => {
    return useQuery<ApiResponse<DdlData[]>>({
        queryKey: ['get-languages'],
        queryFn: async () => await Get(endpoints.GET_LANGUAGES),
        enabled: true,
    });
};

export const useEditProfile = (
    props?: UseMutationOptions<any, any, { bookingId: string; reasonId: string }>,
) => {
    return useMutation({
        mutationKey: ['edit-profile'],
        mutationFn: async (data: { bookingId: string; reasonId: string }) =>
            await Patch(endpoints.HOST_CANCEL_BOOKING, data),
        ...props,
    });
};

export const useVerifyKYC = (props?: UseMutationOptions<any, any, any>) => {
    return useMutation({
        mutationKey: ['verify-kyc'],
        mutationFn: async (data: any) => await Post(endpoints.VERIFY_KYC, data),
        ...props,
    });
};

export const useGetKYCDoc = () => {
    return useQuery<ApiResponse<any>>({
        queryKey: ['get-kyc-doc'],
        queryFn: async () => await Get(`${endpoints.GET_KYC_DOCS}`),
        enabled: true,
    });
};

export const usePayoutDetails = (props?: UseMutationOptions<any, any, any>) => {
    return useMutation({
        mutationKey: ['payout-details'],
        mutationFn: async (data: any) => await Put(endpoints.PAYOUT_DETAILS, data),
        ...props,
    });
};

export const useGetPayoutDetails = () => {
    return useQuery<ApiResponse<any>>({
        queryKey: ['get-payoyt-details'],
        queryFn: async () => await Get(`${endpoints.PAYOUT_DETAILS}`),
        enabled: true,
    });
};

export const useGetHostProfile = (params: HostProfileParams) => {
    const { page = 1, limit = 3, categoryId, hostId } = params;

    const enabled = !!hostId;
    const queryParams = new URLSearchParams();
    if (hostId) queryParams.append('hostId', hostId.toString());
    if (categoryId) queryParams.append('categoryId', categoryId.toString());
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    const endpoint = `${endpoints.GUEST_HOST_PROFILE}?${queryParams.toString()}`;

    return useQuery({
        queryKey: ['host-profile', hostId, categoryId, page, limit],
        queryFn: async () => await Get(endpoint),
        enabled,
    });
};

export const useGetHostProfileSpaceData = (params: HostProfileParams) => {
    const { page = 1, limit = 3, categoryId, hostId } = params;

    const enabled = !!hostId && categoryId != null;
    const queryParams = new URLSearchParams();
    if (hostId) queryParams.append('hostId', hostId.toString());
    if (categoryId) queryParams.append('categoryId', categoryId.toString());
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    const endpoint = `${endpoints.GUEST_HOST_PROFILE}?${queryParams.toString()}`;

    return useQuery({
        queryKey: ['host-profile', hostId, categoryId, page, limit],
        queryFn: async () => await Get(endpoint),
        enabled,
    });
};

export function useGetGSTDetails(options = {}) {
    return useQuery({
        queryKey: ['gst-details'],
        queryFn: getGuestGST,
        retry: 2,
        staleTime: 5 * 60 * 1000,
        retryDelay: 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: false,
        ...options,
    });
}

export const useDeleteGSTDetails = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteGuestGST,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gstDetails'] });
        },
    });
};

export function usePostGSTDetails(options = {}) {
    return useMutation({
        mutationFn: postGuestGST,
        retry: 1,
        ...options,
    });
}
