import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetMonthlyRevenue, useGetYearlyRevenue } from '@/services';
import { PATHS } from '@/constants/path';

export const useTimeWiseReports = () => {
    const router = useRouter();
    const [monthlyPage, setMonthlyPage] = useState(1);
    const [yearlyPage, setYearlyPage] = useState(1);

    const { data: monthlyRevenue, isLoading: isMonthlyRevenueLoading, error: monthlyError } =
        useGetMonthlyRevenue(monthlyPage);
    const { data: yearlyRevenue, isLoading: isYearlyRevenueLoading, error: yearlyError } =
        useGetYearlyRevenue(yearlyPage);

    const monthlyTotalPages = monthlyRevenue?.data?.pagination?.totalPages || 1;
    const yearlyTotalPages = yearlyRevenue?.data?.pagination?.totalPages || 1;

    const handleNavigateToDetails = (year: string, month?: string) => {
        if (month) {
            router.push(`${PATHS.HOST_EARNINGS_TIME_WISE_REPORTS_DETAILS}/${year}/${month}`);
        } else {
            router.push(`${PATHS.HOST_EARNINGS_TIME_WISE_REPORTS_DETAILS}/${year}`);
        }
    };

    return {
        monthlyPage,
        setMonthlyPage,
        yearlyPage,
        setYearlyPage,
        monthlyRevenue,
        isMonthlyRevenueLoading,
        yearlyRevenue,
        isYearlyRevenueLoading,
        monthlyTotalPages,
        yearlyTotalPages,
        error: monthlyError || yearlyError,
        handleNavigateToDetails,
    };
};
