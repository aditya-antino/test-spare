import { useState } from 'react';
import {
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    startOfYear,
    endOfYear,
    parse,
} from 'date-fns';
import { useGetEarnings } from '@/services';

export function getRangeByFilter(filter: string): { start: Date; end: Date } {
    const today = new Date();
    switch (filter) {
        case 'today':
            return { start: today, end: today };
        case 'week':
            return { start: startOfWeek(today), end: endOfWeek(today) };
        case 'month':
            return { start: startOfMonth(today), end: endOfMonth(today) };
        case 'year':
            return { start: startOfYear(today), end: endOfYear(today) };
        default:
            return { start: today, end: today };
    }
}

export const useEarningsAnalytics = () => {
    const [range, setRange] = useState<{ start?: Date; end?: Date }>({
        start: undefined,
        end: undefined,
    });
    const [activeFilter, setActiveFilter] = useState('today');
    const [selectedStatus, setSelectedStatus] = useState('upcoming');
    const [timeAggregation, setTimeAggregation] = useState('this_month');
    const [selectedSpace, setSelectedSpace] = useState<number | null>(null);

    const {
        data: earningsDataResponse,
        isLoading,
        error,
    } = useGetEarnings({
        startDate: range.start,
        endDate: range.end,
        status: selectedStatus.toLowerCase(),
        dateRange: timeAggregation,
        spaceId: selectedSpace ? String(selectedSpace) : undefined,
    });

    const chartData = {
        labels: earningsDataResponse?.data?.data?.map((item: any) => item.label) ?? [],
        datasets: [
            {
                label: 'Total Earnings',
                data: earningsDataResponse?.data?.data?.map((item: any) => item.totalEarnings) ?? [],
                borderColor: '#EAB308',
                backgroundColor: 'transparent',
                tension: 0.3,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: '#EAB308',
                pointBorderColor: '#EAB308',
                pointBorderWidth: 2,
                borderWidth: 2,
            },
        ],
    };

    const handleFilterChange = (action: any) => {
        switch (action.type) {
            case 'STATUS_CHANGE':
                setSelectedStatus(action.payload);
                break;
            case 'TIME_AGGREGATION_CHANGE':
                setTimeAggregation(action.payload);
                break;
            case 'SPACE_CHANGE':
                setSelectedSpace(action.payload);
                break;
            case 'DATE_FILTER_CHANGE':
                setActiveFilter(action.payload);
                if (action.payload !== 'custom') {
                    const r = getRangeByFilter(action.payload);
                    setRange(r);
                } else {
                    setRange({ start: undefined, end: undefined });
                }
                break;
            case 'APPLY_CUSTOM_RANGE': {
                const { startDate, endDate } = action.payload;

                const start = startDate ? parse(startDate, 'MM/dd/yyyy', new Date()) : undefined;
                const end = endDate ? parse(endDate, 'MM/dd/yyyy', new Date()) : undefined;

                setRange({ start, end });
                setActiveFilter('custom');
                break;
            }
            default:
                break;
        }
    };

    const formatAmount = (value: number | string | undefined) => Number(value ?? 0).toFixed(2);

    const totalEarnings =
        earningsDataResponse?.data?.data?.reduce(
            (acc: any, curr: any) => acc + Number(curr.totalEarnings || 0),
            0,
        ) ?? 0;

    const totalPenalityAmount = Number(earningsDataResponse?.data?.data?.[0]?.penaltyAmount ?? 0);

    return {
        range,
        activeFilter,
        selectedStatus,
        timeAggregation,
        selectedSpace,
        earningsDataResponse,
        isLoading,
        error,
        chartData,
        handleFilterChange,
        formatAmount,
        totalEarnings,
        totalPenalityAmount,
    };
};
