
export interface EarningsAnalyticsParams {
    status?: string;
    spaceId?: string;
    dateRange?: string;
    startDate?: Date;
    endDate?: Date;
    aggregation?: string;
}

export interface EarningsChartData {
    label: string;
    totalEarnings: number;
    penaltyAmount: string | number;
}

export interface EarningsChartResponse {
    success: boolean;
    message: string;
    data: {
        aggregation: string;
        range: {
            startDate: string;
            endDate: string;
        };
        data: EarningsChartData[];
    };
}
