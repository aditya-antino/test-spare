import { useQuery } from '@tanstack/react-query';
import { Get } from '../api';
import { endpoints } from '../endPoints';
import { ApiResponse } from '@/types/common.types';
import { EarningsAnalyticsParams } from '@/types/index';
import { earningsApi } from '../analytics.services';

export const useGetMonthlyRevenue = (page: number = 1) => {
    return useQuery<ApiResponse<any>>({
        queryKey: ['get-monthly-revenue', page],
        queryFn: async () => await Get(endpoints.GET_MONTHLY_REVENUE(page)),
        enabled: true,
    });
};

export const useGetYearlyRevenue = (page: number = 1) => {
    return useQuery<ApiResponse<any>>({
        queryKey: ['get-yearly-revenue', page],
        queryFn: async () => await Get(endpoints.GET_YEARLY_REVENUES(page)),
        enabled: true,
    });
};

export const useGetTimeWiseReportDetails = (year: string, month: string, spaceId?: number) => {
    return useQuery<ApiResponse<any>>({
        queryKey: ['get-time-wise-report-details', year, month, spaceId],
        queryFn: async () =>
            await Get(endpoints.GET_TIME_WISE_REPORT_DETAILS(year, month, spaceId)),
        enabled: Boolean(year && month),
    });
};

export const useGetSpaceWiseReportDetails = (
    spaceID: string | number,
    params?: { startDate?: string; endDate?: string },
) => {
    return useQuery<ApiResponse<any>>({
        queryKey: ['get-space-wise-report-details', spaceID, params],
        queryFn: () => Get(endpoints.GET_SPACE_WISE_REPORT_DETAILS(spaceID, params)),
        enabled: Boolean(spaceID),
    });
};

export const useGetSpaceWiseRevenue = (page?: number, isPending?: boolean) => {
    const pageNum = page ?? 1;
    const pendingStatus = isPending ?? false;

    return useQuery<ApiResponse<any>>({
        queryKey: ['get-space-wise-revenue', pageNum, pendingStatus],
        queryFn: async () => await Get(endpoints.GET_SPACE_WISE_REVENUE(pageNum, pendingStatus)),
        enabled: true,
    });
};

export const useGetEarnings = (params: EarningsAnalyticsParams) => {
    return useQuery({
        queryKey: ['earningsData', params],
        queryFn: () => earningsApi.getEarningsData(params),
    });
};
