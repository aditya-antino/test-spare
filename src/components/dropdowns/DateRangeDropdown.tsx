'use client';

import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarIcon } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DateRange } from 'react-day-picker';
import { format, parse, isValid } from 'date-fns';

interface DateRangeDropdownProps {
    title?: string;
    startDate: string;
    endDate: string;
    onChange: (range: { startDate: string; endDate: string }) => void;
}

const DateRangeDropdown: React.FC<DateRangeDropdownProps> = ({
    title,
    startDate,
    endDate,
    onChange,
}) => {
    const [open, setOpen] = useState(false);

    const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(
        startDate && endDate
            ? {
                  from: parse(startDate, 'MM/dd/yyyy', new Date()),
                  to: parse(endDate, 'MM/dd/yyyy', new Date()),
              }
            : undefined,
    );

    const [fromInput, setFromInput] = useState(startDate || '');
    const [toInput, setToInput] = useState(endDate || '');

    const handleCalendarSelect = (range: DateRange | undefined) => {
        setSelectedRange(range);
        if (range?.from) {
            setFromInput(format(range.from, 'MM/dd/yyyy'));
        } else {
            setFromInput('');
        }
        if (range?.to) {
            setToInput(format(range.to, 'MM/dd/yyyy'));
        } else {
            setToInput('');
        }
    };

    const handleFromInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFromInput(value);

        if (value) {
            const date = parse(value, 'MM/dd/yyyy', new Date());
            if (isValid(date)) {
                setSelectedRange((prev) => ({
                    from: date,
                    to: prev?.to,
                }));
            }
        } else {
            setSelectedRange((prev) => ({
                from: undefined,
                to: prev?.to,
            }));
        }
    };

    const handleToInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setToInput(value);

        if (value) {
            const date = parse(value, 'MM/dd/yyyy', new Date());
            if (isValid(date)) {
                setSelectedRange((prev) => ({
                    from: prev?.from,
                    to: date,
                }));
            }
        } else {
            setSelectedRange((prev) => ({
                from: prev?.from,
                to: undefined,
            }));
        }
    };

    const handleApply = () => {
        if (fromInput && toInput) {
            const fromDate = parse(fromInput, 'MM/dd/yyyy', new Date());
            const toDate = parse(toInput, 'MM/dd/yyyy', new Date());

            if (isValid(fromDate) && isValid(toDate)) {
                onChange({
                    startDate: fromInput,
                    endDate: toInput,
                });
                setOpen(false);
            }
        }
    };

    const handleClear = () => {
        setSelectedRange(undefined);
        setFromInput('');
        setToInput('');
        onChange({ startDate: '', endDate: '' });
    };

    const displayText =
        startDate && endDate ? `${startDate} - ${endDate}` : title || 'Select Date Range';

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button className="h-10 justify-between gap-2 sm:gap-3" variant="outline">
                    <div className="flex items-center gap-2 min-w-0">
                        <CalendarIcon className="w-4 h-4" />
                        {displayText}
                    </div>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="p-2 w-80" align="end" sideOffset={5}>
                <Calendar
                    mode="range"
                    selected={selectedRange}
                    onSelect={handleCalendarSelect}
                    initialFocus
                    className="w-full"
                />

                <div className="mt-2 flex gap-2">
                    <div className="flex flex-col flex-1">
                        <label htmlFor="from-date" className="text-sm text-gray-700">
                            From
                        </label>
                        <Input
                            id="from-date"
                            type="text"
                            placeholder="MM/DD/YYYY"
                            value={fromInput}
                            onChange={handleFromInputChange}
                            className="w-full"
                        />
                    </div>
                    <div className="flex flex-col flex-1">
                        <label htmlFor="to-date" className="text-sm text-gray-700">
                            To
                        </label>
                        <Input
                            id="to-date"
                            type="text"
                            placeholder="MM/DD/YYYY"
                            value={toInput}
                            onChange={handleToInputChange}
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="mt-2 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={handleClear}>
                        Clear
                    </Button>
                    <Button
                        size="sm"
                        className="flex-1"
                        disabled={!fromInput || !toInput}
                        onClick={handleApply}
                    >
                        Apply
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default DateRangeDropdown;
