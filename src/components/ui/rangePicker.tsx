'use client';

import * as React from 'react';
import { ArrowRightLeft, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';
import dayjs from 'dayjs';

export type RangePickerProps = {
    value?: DateRange;
    onChange?: (range: DateRange | undefined) => void;
    fromDate?: Date;
    toDate?: Date;
    closeOnSelect?: boolean;
    className?: string;
};

export function RangeDatePicker({
    value,
    onChange,
    fromDate,
    toDate,
    closeOnSelect = true,
    className,
}: RangePickerProps) {
    const [openFrom, setOpenFrom] = React.useState(false);
    const [openTo, setOpenTo] = React.useState(false);

    const handleFromSelect = (date: Date) => {
        onChange?.({ from: date, to: value?.to });
        if (closeOnSelect) setOpenFrom(false);
    };

    const handleToSelect = (date: Date) => {
        onChange?.({ from: value?.from, to: date });
        if (closeOnSelect) setOpenTo(false);
    };

    return (
        <div
            className={cn(
                'flex w-full items-center border border-gray-200 rounded-2xl px-4 py-3 gap-4 bg-white shadow-[0px_4px_12px_rgba(0,0,0,0.05)]',
                className,
            )}
        >
            {/* From */}
            <Popover open={openFrom} onOpenChange={setOpenFrom}>
                <PopoverTrigger asChild>
                    <button className="flex-1 flex flex-col items-start text-left text-sm group cursor-pointer">
                        <div className="flex w-full justify-between items-center mb-0.5">
                            <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">From</div>
                            <ChevronDown className={cn("h-3.5 text-gray-400 transition-transform duration-200", openFrom && "rotate-180")} />
                        </div>
                        <span
                            className={cn(
                                'font-medium text-gray-700',
                                !value?.from && 'text-gray-400',
                            )}
                        >
                            {value?.from ? dayjs(value.from).format('DD/MM/YY') : 'DD/MM/YY'}
                        </span>
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none shadow-[0px_10px_40px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden" align="start">
                    <Calendar
                        mode="single"
                        selected={value?.from}
                        onSelect={handleFromSelect}
                        disabled={{ after: toDate }}
                    />
                </PopoverContent>
            </Popover>

            {/* Swap icon */}
            <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center flex-shrink-0">
                <ArrowRightLeft className="h-4 w-4 text-[#F6CD28]" />
            </div>

            {/* To */}
            <Popover open={openTo} onOpenChange={setOpenTo}>
                <PopoverTrigger asChild>
                    <button className="flex-1 flex flex-col items-start text-left text-sm group cursor-pointer">
                        <div className="flex w-full justify-between items-center mb-0.5">
                            <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">To</div>
                            <ChevronDown className={cn("h-3.5 text-gray-400 transition-transform duration-200", openTo && "rotate-180")} />
                        </div>
                        <span
                            className={cn(
                                'font-medium text-gray-700',
                                !value?.to && 'text-gray-400'
                            )}
                        >
                            {value?.to ? dayjs(value.to).format('DD/MM/YY') : 'DD/MM/YY'}
                        </span>
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none shadow-[0px_10px_40px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden" align="start">
                    <Calendar
                        mode="single"
                        selected={value?.to}
                        onSelect={handleToSelect}
                        disabled={{ before: fromDate }}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
