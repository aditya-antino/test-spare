import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Post, Get, Put, Delete } from '@/services/api';
import { endpoints } from '@/services/endPoints';
import { ApiResponse, PaginatedResponse } from '@/types/common.types';
import {
    Reservation,
    ReservationFilters,
    ReservationListParams,
    ReservationListResponse,
    PayoutBreakdown,
    ExportOptions,
    ExportResponse,
    GetCancellationReasonsResponse,
    HostCancellationDataResponse,
    CancellationDataResponse,
    CancellationReasonResponse
} from '@/types/reservations.types';
import { ReviewResponse } from '@/types/reviews.types';
import { getReservationsByStatus, getPaginatedReservations, dummyReservations } from '@/data/reservations';

// Reservations queries
export const useReservations = (
    filters?: ReservationFilters,
    page: number = 1,
    limit: number = 10,
    options?: UseQueryOptions<PaginatedResponse<Reservation>>,
) => {
    return useQuery({
        queryKey: ['reservations', filters, page, limit],
        queryFn: async () => {
            // For now, return dummy reservations data
            // TODO: Replace with actual API call when backend is ready
            let filteredReservations = dummyReservations;

            // Apply status filter
            if (filters?.status) {
                filteredReservations = getReservationsByStatus(filters.status);
            }

            // Apply property filter
            if (filters?.spaceId) {
                filteredReservations = filteredReservations.filter(
                    (r) => r.property.id === filters.spaceId,
                );
            }

            // Apply space filter
            if (filters?.spaceId) {
                filteredReservations = filteredReservations.filter(
                    (r) => r.space.id === filters.spaceId,
                );
            }

            // Apply date filters
            if (filters?.startDate) {
                filteredReservations = filteredReservations.filter(
                    (r) => r.dateTime.startDate >= filters.startDate!,
                );
            }

            if (filters?.endDate) {
                filteredReservations = filteredReservations.filter(
                    (r) => r.dateTime.startDate <= filters.endDate!,
                );
            }

            const paginatedData = getPaginatedReservations(filteredReservations, page, limit);

            return {
                data: paginatedData.data,
                meta: paginatedData.meta,
                success: true,
                message: 'Reservations fetched successfully',
            };
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    });
};

export const useReservation = (id: string, options?: UseQueryOptions<ApiResponse<Reservation>>) => {
    return useQuery({
        queryKey: ['reservation', id],
        queryFn: async () =>
            await Get<ApiResponse<Reservation>>(endpoints.GET_RESERVATION.replace(':id', id)),
        enabled: !!id,
        ...options,
    });
};

export const useReservationPayout = (
    id: number,
    options?: Omit<UseQueryOptions<ApiResponse<PayoutBreakdown>>, 'queryKey' | 'queryFn'>,
) => {
    return useQuery({
        queryKey: ['reservation-payout', id],
        queryFn: async (params) =>
            await Get<ApiResponse<PayoutBreakdown>>(endpoints.GET_RESERVATION_PAYOUT, {
                params,
            }),
        enabled: !!id,
        ...options,
    });
};

export const useExportReservations = (
    options?: UseMutationOptions<ExportResponse, any, ExportOptions>,
) => {
    return useMutation({
        mutationKey: ['export-reservations'],
        mutationFn: async (exportOptions: ExportOptions): Promise<ExportResponse> => {
            const response = await Get<ExportResponse>(endpoints.EXPORT_RESERVATIONS, {
                params: exportOptions,
            });
            return response;
        },
        ...options,
    });
};

export const useGetReservationList = (
    params?: ReservationListParams,
    options?: Omit<
        UseQueryOptions<ReservationListResponse, Error, ReservationListResponse>,
        'queryKey' | 'queryFn'
    >,
) => {
    return useQuery<ReservationListResponse, Error>({
        queryKey: ['host-reservation-list', params],
        queryFn: async () => {
            const query = params
                ? new URLSearchParams(
                      Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
                  ).toString()
                : '';
            return await Get<ReservationListResponse>(
                `${endpoints.HOST_RESERVATION_LIST}${query ? `?${query}` : ''}`,
            );
        },
        ...options,
    });
};

export const useGetCancellationReasons = () => {
    return useQuery<GetCancellationReasonsResponse>({
        queryKey: ['host-cancellation-reasons'],
        queryFn: async () => await Get(endpoints.HOST_CANCELLATION_REASONS),
        enabled: true,
    });
};

export const useCancelBooking = (
    props?: UseMutationOptions<any, any, { bookingId: string; reasonId: string }>,
) => {
    return useMutation({
        mutationKey: ['host-cancel-booking'],
        mutationFn: async (data: { bookingId: string; reasonId: string }) =>
            await Post(endpoints.HOST_CANCEL_BOOKING, data),
        ...props,
    });
};

export const useGetCancellationData = (bookingId: number, isCancel: boolean) => {
    return useQuery<HostCancellationDataResponse>({
        queryKey: ['host-review', bookingId],
        queryFn: async () =>
            await Get(`${endpoints.HOST_CANCELLATION_DATA}?bookingId=${bookingId}`),
        enabled: !!bookingId && isCancel,
    });
};

export const useRejectBooking = (
    props?: UseMutationOptions<any, any, { bookingId: string; reasonId: string }>,
) => {
    return useMutation({
        mutationKey: ['host-cancel-booking'],
        mutationFn: async (data: { bookingId: string; reasonId: string }) =>
            await Post(endpoints.HOST_REJECT_BOOKING, data),
        ...props,
    });
};

export const useApproveBooking = (props?: UseMutationOptions<any, any, { bookingId: number }>) => {
    return useMutation({
        mutationKey: ['host-approve-booking'],
        mutationFn: async (data: { bookingId: number }) =>
            await Post(endpoints.HOST_APPROVE_BOOKING, data),
        ...props,
    });
};

export const useCancelBulkBooking = (
    props?: UseMutationOptions<any, any, { bookingIds: Array<number>; reasonId: string }>,
) => {
    return useMutation({
        mutationKey: ['cancel-bulk-booking'],
        mutationFn: async (data: { bookingIds: Array<number>; reasonId: string }) =>
            await Post(endpoints.CANCEL_BULK_BOOKING, data),
        ...props,
    });
};

export const useRequestBooking = (
    props?: UseMutationOptions<
        any,
        any,
        {
            spaceId: number;
            startDatetime: string;
            endDatetime: string;
            attendees: number;
            guestMessage: string;
            amount: number;
            guestPlatformFee: number;
            cgst: number;
            sgst: number;
            totalAmount: number;
        }
    >,
) => {
    return useMutation({
        mutationKey: ['guest-request-booking'],
        mutationFn: async (data: {
            spaceId: number;
            startDatetime: string;
            endDatetime: string;
            attendees: number;
            guestMessage: string;
            amount: number;
            guestPlatformFee: number;
            cgst: number;
            sgst: number;
            totalAmount: number;
        }) => await Post(endpoints.GUEST_REQUEST_BOOKING, data),

        ...props,
    });
};

export const useRazopayBookingOrder = (
    props?: UseMutationOptions<
        any,
        any,
        {
            bookingId: number;
            amount: number;
            currency: string;
            receipt: string;
            notes: { purpose: string };
        }
    >,
) => {
    return useMutation({
        mutationKey: ['razorpay-booking-order'],
        mutationFn: async (data: {
            bookingId: number;
            amount: number;
            currency: string;
            receipt: string;
            notes: { purpose: string };
        }) => await Post(endpoints.RAZORPAY_ORDER, data),
        ...props,
    });
};

export const useGuestInstantBookingOrder = (
    props?: UseMutationOptions<
        any,
        any,
        {
            bookingId: number;
            amount: number;
            currency: string;
            receipt: string;
            notes: { purpose: string };
        }
    >,
) => {
    return useMutation({
        mutationKey: ['razorpay-booking-order'],
        mutationFn: async (data: {
            bookingId: number;
            amount: number;
            currency: string;
            receipt: string;
            notes: { purpose: string };
        }) => await Post(endpoints.RAZORPAY_ORDER, data),
        ...props,
    });
};

export const useGuestInstantBooking = (
    props?: UseMutationOptions<
        any,
        any,
        {
            spaceId: number;
            startDatetime: string;
            endDatetime: string;
            attendees: number;
            guestMessage: string;
            amount: number;
            guestPlatformFee: number;
            cgst: number;
            sgst: number;
            totalAmount: number;
        }
    >,
) => {
    return useMutation({
        mutationKey: ['guest-instant-booking'],
        mutationFn: async (data: {
            spaceId: number;
            startDatetime: string;
            endDatetime: string;
            attendees: number;
            guestMessage: string;
            amount: number;
            guestPlatformFee: number;
            cgst: number;
            sgst: number;
            totalAmount: number;
        }) => await Post(endpoints.GUEST_INSTANT_BOOKING_ORDER, data),
        ...props,
    });
};

export const useGetGuestBookingDetails = (options?: UseQueryOptions<ApiResponse<any>>) => {
    return useQuery<ApiResponse<any>>({
        queryKey: ['guest-booking-details'],
        queryFn: async () => {
            const endpoint = endpoints.GUEST_BOOKING_DETAILS;
            return await Get<ApiResponse<any>>(endpoint);
        },
        staleTime: 10 * 60 * 1000,
        ...options,
    });
};

export const useGetCancellationPolicy = () => {
    return useQuery<any>({
        queryKey: ['guest-cancellation-list'],
        queryFn: async () => {
            const response = await Get(endpoints.GUEST_CANCELLATION_POLICY);
            return response;
        },
        enabled: true,
    });
};

export const useGetCancellationDataByBookingID = (
    bookingId: string,
    options?: Omit<UseQueryOptions<CancellationDataResponse>, 'queryKey' | 'queryFn'>,
) => {
    return useQuery<CancellationDataResponse>({
        queryKey: ['cancellation-data', bookingId],
        queryFn: async () => {
            const response = await Get<CancellationDataResponse>(
                `guest/booking-financial?bookingId=${bookingId}`,
            );
            return response;
        },
        ...options,
        enabled: !!bookingId && (options?.enabled ?? true),
    });
};

export const useGetGuestCancellationReason = (bookingId: string) => {
    return useQuery<CancellationReasonResponse>({
        queryKey: ['cancellation-reason', bookingId],
        queryFn: async () => {
            return await Get(`guest/cancel-booking?bookingId=${bookingId}&reasonId=1`);
        },
        enabled: !!bookingId,
    });
};
