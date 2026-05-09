'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Clock, BarChart3, ChevronDown } from 'lucide-react';
import { DateRangeDropdown, SpaceDropDown } from '@/components';
import { format } from 'date-fns';

interface FilterState {
    selectedStatus: string;
    timeAggregation: string;
    selectedSpace: number | null;
    revenueType?: string;
    activeFilter: string;
    range: { start?: Date; end?: Date };
}

type FilterChangeAction =
    | { type: 'STATUS_CHANGE'; payload: string }
    | { type: 'TIME_AGGREGATION_CHANGE'; payload: string }
    | { type: 'SPACE_CHANGE'; payload: number }
    | { type: 'REVENUE_TYPE_CHANGE'; payload: string }
    | { type: 'DATE_FILTER_CHANGE'; payload: string }
    | { type: 'APPLY_CUSTOM_RANGE'; payload: { startDate: string; endDate: string } };

interface AnalyticsGraphFiltersProps {
    filterState: FilterState;
    onFilterChange: (action: FilterChangeAction) => void;
}

const statusOptions = [
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Pending Payout', value: 'pending_payout' },
    { label: 'Completed', value: 'completed' },
];

const timeAggregationOptions = [
    { label: 'Weekly', value: 'this_week' },
    { label: 'Monthly', value: 'this_month' },
    { label: 'Yearly', value: 'this_year' },
];

const revenueOptions = [
    { label: 'Gross Revenue', value: 'gross' },
    { label: 'Net Revenue', value: 'net' },
];

const AnalyticsGraphFilters: React.FC<AnalyticsGraphFiltersProps> = ({
    filterState,
    onFilterChange,
}) => {
    const { selectedStatus, timeAggregation, selectedSpace, revenueType, range } = filterState;

    return (
        <div className="md:flex grid grid-cols-2 gap-4 md:gap-6 flex-wrap">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="h-10 justify-between gap-2 sm:gap-3" variant="outline">
                        <div className="flex items-center gap-2 min-w-0">
                            <Clock className="w-5 h-5 text-zinc-800 flex-shrink-0" />
                            <span className="truncate sm:inline">
                                {statusOptions.find((s) => s.value === selectedStatus)?.label ||
                                    'Upcoming'}
                            </span>
                        </div>
                        <ChevronDown className="w-5 h-5 text-zinc-800 flex-shrink-0" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {statusOptions.map((option) => (
                        <DropdownMenuItem
                            key={option.value}
                            className="py-2 px-3 text-sm"
                            onClick={() =>
                                onFilterChange({ type: 'STATUS_CHANGE', payload: option.value })
                            }
                        >
                            {option.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="h-10 justify-between gap-2 sm:gap-3" variant="outline">
                        <div className="flex items-center gap-2 min-w-0">
                            <BarChart3 className="w-5 h-5 text-zinc-800 flex-shrink-0" />
                            <span className="truncate sm:inline">
                                {timeAggregationOptions.find((t) => t.value === timeAggregation)
                                    ?.label || 'Time'}
                            </span>
                        </div>
                        <ChevronDown className="w-5 h-5 text-zinc-800 flex-shrink-0" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {timeAggregationOptions.map((option) => (
                        <DropdownMenuItem
                            key={option.value}
                            className="py-2 px-3 text-sm"
                            onClick={() =>
                                onFilterChange({
                                    type: 'TIME_AGGREGATION_CHANGE',
                                    payload: option.value,
                                })
                            }
                        >
                            {option.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <SpaceDropDown
                selectedSpace={selectedSpace}
                onSpaceChange={(value) => onFilterChange({ type: 'SPACE_CHANGE', payload: value })}
            />

            {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="h-10 justify-between gap-2 sm:gap-3" variant="outline">
                        <span className="truncate sm:inline">
                            {revenueOptions.find((r) => r.value === revenueType)?.label ||
                                'Revenue Type'}
                        </span>
                        <ChevronDown className="w-5 h-5 text-zinc-800 flex-shrink-0" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {revenueOptions.map((option) => (
                        <DropdownMenuItem
                            key={option.value}
                            className="py-2 px-3 text-sm"
                            onClick={() =>
                                onFilterChange({
                                    type: 'REVENUE_TYPE_CHANGE',
                                    payload: option.value,
                                })
                            }
                        >
                            {option.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu> */}

            <DateRangeDropdown
                title="Choose Date"
                startDate={range.start ? format(range.start, 'MM/dd/yyyy') : ''}
                endDate={range.end ? format(range.end, 'MM/dd/yyyy') : ''}
                onChange={({ startDate, endDate }) => {
                    onFilterChange({
                        type: 'APPLY_CUSTOM_RANGE',
                        payload: { startDate, endDate },
                    });
                }}
            />
        </div>
    );
};

export default AnalyticsGraphFilters;
