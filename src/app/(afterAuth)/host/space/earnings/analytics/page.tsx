'use client';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler,
} from 'chart.js';
import AnalyticsLineChart from './AnalyticsLineChart';
import AnalyticsGraphFilters from './AnalyticsGraphFilters';
import { Info } from 'lucide-react';
import { useEarningsAnalytics } from './useEarningsAnalytics';
import { ErrorState } from '@/components/common';
import Loader from '@/components/ui/loader';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

interface EarningsChartProps {
    data?: number[];
}

const EarningsAnalytics: React.FC<EarningsChartProps> = () => {
    const {
        range,
        activeFilter,
        selectedStatus,
        timeAggregation,
        selectedSpace,
        isLoading,
        error,
        chartData,
        handleFilterChange,
        formatAmount,
        totalEarnings,
        totalPenalityAmount,
    } = useEarningsAnalytics();

    return (
        <div className="bg-white h-full w-full px-2 md:px-4 pb-4">
            <div className="md:p-6 pb-0 pr-0 rounded-2xl border">
                <div className="px-3 py-4 w-full flex flex-col md:flex-row gap-4 sm:flex-row justify-between">
                    <div className="flex items-center md:items-start md:flex-col gap-2 sm:mb-4">
                        <div className="text-3xl text-neutral-800 md:text-4xl font-semibold">
                            ₹{formatAmount(totalEarnings)}
                        </div>
                        {totalPenalityAmount > 0 && (
                            <div className="text-sm text-red-600 font-semibold italic flex items-center gap-2">
                                Penalty: ₹{formatAmount(totalPenalityAmount)}
                                <button
                                    type="button"
                                    className="relative group"
                                    title="Penalty Information"
                                >
                                    <Info className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-48 z-10">
                                        This penalty will be adjusted against your future bookings.
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white border-r border-b border-gray-200 rotate-45"></div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                    <AnalyticsGraphFilters
                        filterState={{
                            selectedStatus,
                            timeAggregation,
                            selectedSpace,
                            activeFilter,
                            range,
                        }}
                        onFilterChange={handleFilterChange}
                    />
                </div>
                <div className="w-full h-[53vh]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader size={40} />
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-full">
                            <ErrorState
                                title="Something went wrong"
                                description="We couldn't fetch your earnings analytics. Please try again later."
                                onRetry={() => handleFilterChange({ type: 'REFRESH' })}
                            />
                        </div>
                    ) : (
                        <AnalyticsLineChart chartData={chartData} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default EarningsAnalytics;
