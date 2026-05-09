'use client';

import React from 'react';
import { formatIndianCurrencyZero } from '@/utils/IndianCurrencyFormatter';
import { EarningsPagination, PropertyCardSkeleton } from '@/components';
import { useTimeWiseReports } from './useTimeWiseReports';
import { ReportCard } from './ReportCard';
import { ErrorState } from '@/components/common';
import ArrowScrollWrapper from '@/components/ui/arrowScrollWrapper';

const TimeWiseReportsPage = () => {
    const {
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
        error,
        handleNavigateToDetails,
    } = useTimeWiseReports();

    if (error) {
        return (
            <div className="p-6 h-full flex flex-col">
                <ErrorState
                    title="Failed to load time-wise reports"
                    description="We couldn't fetch your time-wise reports at this time. Please check your connection and try again."
                    onRetry={() => {
                        setMonthlyPage(1);
                        setYearlyPage(1);
                    }}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-12 w-full max-w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-16 pb-10">
            <section className="flex flex-col gap-5">
                <h1 className="text-2xl font-semibold text-gray-900">Monthly Reports</h1>
                {isMonthlyRevenueLoading ? (
                    <div className="flex gap-5 overflow-hidden">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="min-w-[280px] h-[160px] bg-gray-100 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : monthlyRevenue?.data?.earnings?.length > 0 ? (
                    <>
                        <ArrowScrollWrapper>
                            {monthlyRevenue.data.earnings.map((report: any) => (
                                <ReportCard
                                    key={`${report.year}-${report.monthNumber}`}
                                    amount={formatIndianCurrencyZero(report.earnings)}
                                    year={report.year}
                                    month={report.month}
                                    onClick={() =>
                                        handleNavigateToDetails(report.year, report.monthNumber)
                                    }
                                />
                            ))}
                        </ArrowScrollWrapper>

                        {monthlyTotalPages > 1 && (
                            <EarningsPagination
                                page={monthlyPage}
                                totalPages={monthlyTotalPages}
                                onPrev={() => monthlyPage > 1 && setMonthlyPage(monthlyPage - 1)}
                                onNext={() =>
                                    monthlyPage < monthlyTotalPages &&
                                    setMonthlyPage(monthlyPage + 1)
                                }
                            />
                        )}
                    </>
                ) : (
                    <div className="flex justify-center items-center py-20">
                        <p className="text-gray-500">No monthly reports available</p>
                    </div>
                )}
            </section>
            <section className="flex flex-col gap-5">
                <h1 className="text-2xl font-semibold text-gray-900">Yearly Reports</h1>
                {isYearlyRevenueLoading ? (
                    <div className="flex gap-5 overflow-hidden">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="min-w-[280px] h-[160px] bg-gray-100 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : yearlyRevenue?.data?.earnings?.length > 0 ? (
                    <>
                        <ArrowScrollWrapper>
                            {yearlyRevenue.data.earnings.map((report: any) => (
                                <ReportCard
                                    key={report.year}
                                    amount={formatIndianCurrencyZero(report.earnings)}
                                    year={report.year}
                                    month="Year in Review"
                                    onClick={() => handleNavigateToDetails(report.year)}
                                />
                            ))}
                        </ArrowScrollWrapper>

                        {yearlyTotalPages > 1 && (
                            <EarningsPagination
                                page={yearlyPage}
                                totalPages={yearlyTotalPages}
                                onPrev={() => yearlyPage > 1 && setYearlyPage(yearlyPage - 1)}
                                onNext={() =>
                                    yearlyPage < yearlyTotalPages && setYearlyPage(yearlyPage + 1)
                                }
                            />
                        )}
                    </>
                ) : (
                    <div className="flex justify-center items-center py-20">
                        <p className="text-gray-500">No yearly reports available</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default TimeWiseReportsPage;
