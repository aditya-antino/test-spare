import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Post, Get, Put } from '../api';
import { endpoints } from '../endPoints';
import { ApiResponse } from '@/types/common.types';
import {
    ReviewResponse,
    AddRatingPayload,
    AddCommentPayload
} from '@/types/reviews.types';
import { getHostRatingAndDetails } from '../ratings.services';

export const useGetReview = (bookingId: number) => {
    return useQuery<ReviewResponse>({
        queryKey: ['host-review', bookingId],
        queryFn: async () => await Get(`${endpoints.HOST_REVIEW}/${bookingId}`),
        enabled: !!bookingId,
    });
};

export const useUpdateReviewFlag = (
    props?: UseMutationOptions<any, any, { bookingId: string; flagged: boolean }>,
) => {
    return useMutation({
        mutationKey: ['host-update-review-flag'],
        mutationFn: async (data: { bookingId: string; flagged: boolean }) =>
            await Put(endpoints.HOST_UPDATE_REVIEW_FLAG, data),
        ...props,
    });
};

export const useAddRating = (
    props?: UseMutationOptions<ApiResponse<any>, any, AddRatingPayload>,
) => {
    return useMutation({
        mutationKey: ['guest-add-rating'],
        mutationFn: async (data: AddRatingPayload) =>
            await Post<ApiResponse<any>>(endpoints.GUEST_ADD_RATINGS, data),
        ...props,
    });
};

export const useAddComment = (
    props?: UseMutationOptions<ApiResponse<any>, any, AddCommentPayload>,
) => {
    return useMutation({
        mutationKey: ['guest-add-comment'],
        mutationFn: async (data: AddCommentPayload) =>
            await Post<ApiResponse<any>>(endpoints.GUEST_ADD_COMMENT, data),
        ...props,
    });
};

export const useHostRatingAndDetails = (hostID: string | number, page: number) => {
    return useQuery({
        queryKey: ['hostRating', hostID, page],
        queryFn: () => getHostRatingAndDetails(hostID, page),
    });
};
