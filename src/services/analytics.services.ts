import axiosInstance from '@/lib/axiosInstance';
import { EarningsAnalyticsParams, EarningsChartResponse } from '@/types';

export const earningsApi = {
    getEarningsData: async (params: EarningsAnalyticsParams): Promise<EarningsChartResponse> => {
        const queryParams: Record<string, any> = {};

        if (params.status) queryParams.status = params.status;
        if (params.spaceId && params.spaceId !== 'all') queryParams.spaceId = params.spaceId;
        if (params.dateRange) queryParams.dateRange = params.dateRange;
        if (params.startDate) queryParams.startDate = params.startDate.toISOString().split('T')[0];
        if (params.endDate) queryParams.endDate = params.endDate.toISOString().split('T')[0];
        if (params.aggregation) queryParams.aggregation = params.aggregation;

        const response = await axiosInstance.get<EarningsChartResponse>('host/earnings/analytics', {
            params: queryParams,
        });

        return response.data;
    },
};
