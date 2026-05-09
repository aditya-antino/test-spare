import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Post, Get, Put, Delete } from '@/services/api';
import { endpoints } from '@/services/endPoints';
import { ApiResponse } from '@/types/common.types';
import { DdlData } from '@/types/common.types';
import {
    Space,
    SpaceDetailsInterface,
    SpaceFilter,
    SpaceListResponse,
    CategoriesResponse,
    SpaceTypeResponse,
    AmenitiesData,
    ActivitiesResponse,
    RulesData,
    SpaceListStep1,
    EditSpaceStep1Payload,
    SpaceListStep2,
    SpaceListStep3,
    SpaceStep4Payload,
    UpdateSpaceStep5Payload,
    SpaceListStep6,
    SpaceStep7Payload,
    Step8Payload,
    Step9Payload,
    EditListingPayload
} from '@/types/spaces.types';
import { BlockBookingSlots } from '@/types/calendar.types';

// Get property by ID
export const useProperty = (id: string, options?: UseQueryOptions<ApiResponse<Space>>) => {
    return useQuery({
        queryKey: ['property', id],
        queryFn: async () =>
            await Get<ApiResponse<Space>>(endpoints.GET_PROPERTY.replace(':id', id)),
        enabled: !!id,
        ...options,
    });
};

// Get space by ID
export const useSpace = (id: string, options?: UseQueryOptions<ApiResponse<Space>>) => {
    return useQuery({
        queryKey: ['space', id],
        queryFn: async () => await Get<ApiResponse<Space>>(endpoints.GET_SPACE.replace(':id', id)),
        enabled: !!id,
        staleTime: 10 * 60 * 1000, // 10 minutes
        ...options,
    });
};

// Get space details
export const useGetSpaceDetails = (
    params: { spaceId?: number; [key: string]: any },
    options?: Partial<UseQueryOptions<ApiResponse<SpaceDetailsInterface>>>,
) => {
    return useQuery<ApiResponse<SpaceDetailsInterface>>({
        queryKey: options?.queryKey ?? ['get-space-details', params],
        queryFn: async () =>
            await Get<ApiResponse<SpaceDetailsInterface>>(endpoints.GET_SPACE_SPACE_DETAILS, {
                params,
            }),
        enabled: !!params.spaceId && (options?.enabled ?? true),
        ...options,
    });
};

// Get host space list
export const useGetSpaceList = () => {
    return useQuery<SpaceListResponse>({
        queryKey: ['host-space-list'],
        queryFn: async () => {
            const response = await Get(endpoints.HOST_SPACE_LIST);
            return response as SpaceListResponse;
        },
        enabled: true,
    });
};

// Get host space list with filter
export const useGetSpaceListFilter = (params) => {
    return useQuery<{ data: { count: number; rows: Array<SpaceFilter> } }>({
        queryKey: ['host-space-list-filter', params],
        queryFn: async () => {
            const response = await Get(endpoints.HOST_SPACE_LIST_FILTER, { params });
            return response as { data: { count: number; rows: Array<SpaceFilter> } };
        },
        enabled: true,
    });
};

// Get categories
export const useGetCategories = (params?: any) => {
    return useQuery<CategoriesResponse>({
        queryKey: ['get-categories', params],
        queryFn: async () => await Get(endpoints.GET_CATEGORIES, { params }),
        enabled: true,
    });
};

export const useGetPublicCategories = (params?: any) => {
    return useQuery<CategoriesResponse>({
        queryKey: ['get-public-categories', params],
        queryFn: async () => await Get(endpoints.GET_PUBLIC_CATEGORIES, { params }),
        enabled: true,
    });
};

// Get space types
export const useGetSpaceTypes = (id?: number, options?: { enabled?: boolean }) => {
    return useQuery<SpaceTypeResponse>({
        queryKey: ['get-space-types', id],
        queryFn: async () => await Get(endpoints.GET_SPACE_TYPES(id)),
        ...options,
    });
};

// Get form cities
export const useGetFormCities = () => {
    return useQuery<ApiResponse<DdlData[]>>({
        queryKey: ['get-form-cities'],
        queryFn: async () => await Get(endpoints.GET_FORM_CITIES),
        enabled: true,
    });
};

// Get amenities
export const useGetAmenities = (id?: number, options?: { enabled?: boolean }) => {
    return useQuery<ApiResponse<AmenitiesData>>({
        queryKey: ['get-amenities', id],
        queryFn: async () => await Get(endpoints.GET_AMENITIES(id)),
        ...options,
    });
};

// Get activities
export const useGetActivities = (id?: number, options?: { enabled?: boolean }) => {
    return useQuery<ApiResponse<ActivitiesResponse>>({
        queryKey: ['get-activities', id],
        queryFn: async () => await Get(endpoints.GET_ACTIVITIES(id)),
        ...options,
    });
};

// Get rules
export const useGetRules = () => {
    return useQuery<ApiResponse<RulesData>>({
        queryKey: ['get-rules'],
        queryFn: async () => await Get(endpoints.GET_RULES),
        enabled: true,
    });
};

// --- Space Creation / Editing Mutations ---

// STEP 1
export const useUpdateSpaceListStep1 = (props?: UseMutationOptions<any, any, SpaceListStep1>) => {
    return useMutation({
        mutationKey: ['create-space-step-1'],
        mutationFn: async (data: SpaceListStep1) => await Post(endpoints.SPACE_STEP_1, data),
        ...props,
    });
};

export const useEditSpaceListStep1 = (
    props?: UseMutationOptions<any, any, EditSpaceStep1Payload>,
) => {
    return useMutation({
        mutationKey: ['edit-space-step-1'],
        mutationFn: async ({ spaceId, body }: EditSpaceStep1Payload) => {
            const url = `${endpoints.EDIT_SPACE_STEP_1}/${spaceId}`;
            return await Put(url, body);
        },
        ...props,
    });
};

// STEP 2
export const useUpdateSpaceListStep2 = (props?: UseMutationOptions<any, any, SpaceListStep2>) => {
    return useMutation<void, unknown, SpaceListStep2>({
        mutationKey: ['update-space-step-2'],
        mutationFn: async (data: SpaceListStep2) => await Put(endpoints.SPACE_STEP_2, data),
        ...props,
    });
};

// STEP 3
export const useUpdateSpaceListStep3 = (props?: UseMutationOptions<any, any, SpaceListStep3>) => {
    return useMutation({
        mutationKey: ['update-space-step-3'],
        mutationFn: async (data: SpaceListStep3) => {
            return await Put(endpoints.SPACE_STEP_3, data);
        },
        ...props,
    });
};

// STEP 4
export const useUpdateSpaceListStep4 = (
    props?: UseMutationOptions<any, any, SpaceStep4Payload>,
) => {
    return useMutation({
        mutationKey: ['update-space-step-4'],
        mutationFn: async (data: SpaceStep4Payload) => await Put(endpoints.SPACE_STEP_4, data),
        ...props,
    });
};

// STEP 5
export const useUpdateSpaceListStep5 = (
    props?: UseMutationOptions<any, any, UpdateSpaceStep5Payload>,
) => {
    return useMutation({
        mutationKey: ['update-space-step-5'],
        mutationFn: async (data: UpdateSpaceStep5Payload) =>
            await Put(endpoints.SPACE_STEP_5, data),
        ...props,
    });
};

// STEP 6
export const useUpdateSpaceListStep6 = (props?: UseMutationOptions<any, any, SpaceListStep6>) => {
    return useMutation({
        mutationKey: ['update-space-step-6'],
        mutationFn: async (data: SpaceListStep6) => await Put(endpoints.SPACE_STEP_6, data),
        ...props,
    });
};

// STEP 7
export const useUpdateSpaceListStep7 = (
    props?: UseMutationOptions<any, any, SpaceStep7Payload>,
) => {
    return useMutation({
        mutationKey: ['update-space-step-7'],
        mutationFn: async (data: SpaceStep7Payload) => await Put(endpoints.SPACE_STEP_7, data),
        ...props,
    });
};

// STEP 8
export const useUpdateSpaceListStep8 = (props?: UseMutationOptions<any, any, Step8Payload>) => {
    return useMutation({
        mutationKey: ['update-space-step-8'],
        mutationFn: async (data: Step8Payload) => await Put(endpoints.SPACE_STEP_8, data),
        ...props,
    });
};

// STEP 9
export const useUpdateSpaceListStep9 = (props?: UseMutationOptions<any, any, Step9Payload>) => {
    return useMutation({
        mutationKey: ['update-space-step-9'],
        mutationFn: async (data: Step9Payload) => await Put(endpoints.SPACE_STEP_9, data),
        ...props,
    });
};

// --- Space Management ---

export const useEditListing = (props?: UseMutationOptions<any, any, EditListingPayload>) => {
    return useMutation({
        mutationKey: ['edit-listing'],
        mutationFn: async (data: EditListingPayload) => await Put(endpoints.EDIT_LISITNG, data),
        ...props,
    });
};

export const useAddBlockSlots = (props?: UseMutationOptions<any, any, BlockBookingSlots>) => {
    return useMutation({
        mutationKey: ['book-block-slots'],
        mutationFn: async (data: BlockBookingSlots) => await Post(endpoints.ADD_BLOCK_SLOT, data),
        ...props,
    });
};

export const useDeactivateSpace = (
    props?: UseMutationOptions<any, any, { spaceIds: Array<number>; deactivate: boolean }>,
) => {
    return useMutation({
        mutationKey: ['deactivate-space'],
        mutationFn: async (data: { spaceIds: Array<number>; deactivate: boolean }) =>
            await Put(endpoints.DEACTIVATE_SPACE, data),
        ...props,
    });
};

export const useDeleteSpace = (
    props?: UseMutationOptions<any, any, { spaceIds: Array<number> }>,
) => {
    return useMutation({
        mutationKey: ['delete-space'],
        mutationFn: async (data: { spaceIds: Array<number> }) =>
            await Delete(endpoints.DELETE_SPACE, data),
        ...props,
    });
};

export const useSharePrices = (props?: UseMutationOptions<any, any, number>) => {
    return useMutation({
        mutationFn: async (id: number) => {
            return await Get(endpoints.GET_SPARE_PRICES(id));
        },
        ...props,
    });
};

export const useGetHostSpaces = (enabled = true) => {
    return useQuery<ApiResponse<any>>({
        queryKey: ['get-host-spaces'],
        queryFn: async () => await Get(endpoints.GET_HOST_SPACES),
        enabled,
    });
};

// --- Guest Space API ---
export const useGetSpaceGuestList = (params?: any, options?: { enabled?: boolean; initialData?: any }) => {
    return useQuery<{ data: { count: number; records: Array<Space> } }>({
        queryKey: ['get-space-guest-list', params],
        queryFn: async () => {
            const response = await Get(endpoints.GUEST_SPACE_LIST, { params });
            return response as { data: { count: number; records: Array<Space> } };
        },
        enabled: options?.enabled !== false,
        ...options,
    });
};

export const useGetGuestSpaceDetails = (
    params: { slug?: string; [key: string]: any },
    options?: Partial<UseQueryOptions<ApiResponse<any>>>,
) => {
    return useQuery<ApiResponse<any>>({
        queryKey: ['get-guest-space-details', params],
        queryFn: async () => {
            const endpoint = endpoints.GUEST_SPACE_DETAILS.replace(
                ':slug',
                params.slug?.toString() || '',
            );
            return await Get<ApiResponse<any>>(endpoint);
        },
        enabled: !!params.slug && (options?.enabled ?? true),
        staleTime: 10 * 60 * 1000,
        ...options,
    });
};

export const useGetAuthGuestSpaceDetails = (
    params: { slug?: string; [key: string]: any },
    options?: Partial<UseQueryOptions<ApiResponse<any>>>,
) => {
    return useQuery<ApiResponse<any>>({
        queryKey: ['get-guest-space-details', params],
        queryFn: async () => {
            const endpoint = endpoints.GUEST_AUTH_SPACE_DETAILS.replace(
                ':slug',
                params.slug?.toString() || '',
            );
            return await Get<ApiResponse<any>>(endpoint);
        },
        enabled: !!params.slug && (options?.enabled ?? true),
        staleTime: 10 * 60 * 1000,
        ...options,
    });
};

export const useGetGuestSpaceCategories = (
    hostId?: number,
    isForListing?: boolean,
    isHostProfile?: boolean,
    options?: UseQueryOptions<any>,
) => {
    const endpoint = hostId
        ? isHostProfile
            ? `${endpoints.GET_CATEGORIES}?hostId=${hostId}&isForListing=${isForListing}&isHostProfile=true`
            : `${endpoints.GET_CATEGORIES}?hostId=${hostId}&isForListing=${isForListing}`
        : endpoints.GUEST_SPACE_CATEGORIES;

    return useQuery<any>({
        queryKey: hostId ? ['guest-space-categories', hostId] : ['guest-space-categories'],
        queryFn: async () => await Get<any>(endpoint),
        enabled: !!hostId, // only fetch if hostId exists
        staleTime: 10 * 60 * 1000, // 10 minutes
        ...options,
    });
};

export const useAfterAuthGetSpaceGuestList = (params?: any, options?: { enabled?: boolean; initialData?: any }) => {
    return useQuery<{ data: { count: number; records: Array<Space> } }>({
        queryKey: ['get-auth-space-guest-list', params],
        queryFn: async () => {
            const response = await Get(endpoints.GUEST_SPACE_LIST_AUTH, { params });
            return response as { data: { count: number; records: Array<Space> } };
        },
        enabled: options?.enabled !== false && params !== undefined,
        ...options,
    });
};
