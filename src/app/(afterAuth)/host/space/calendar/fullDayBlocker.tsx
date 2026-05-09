'use client';

import * as React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { useState } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { toast } from 'react-toastify';
import { useAddBlockSlots } from '@/services';
import { Checkbox } from '@/components/ui/checkbox';

dayjs.extend(utc);
dayjs.extend(timezone);

interface BlockTimePayload {
    spaceId: number;
    date: string; // YYYY-MM-DD
    availableFrom: string; // HH:mm:ss
    availableTo: string; // HH:mm:ss
}

export function FullDayBlocker({
    date,
    selectedId,
    open,
    onOpenChange,
    onSuccess,
}: {
    open: boolean;
    selectedId: number;
    date: any;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}) {
    const [isFullDayCheck, setIsFullDayCheck] = useState<boolean>(false);
    const [fromTime, setFromTime] = useState({ hours: '', minutes: '', ampm: 'PM' });
    const [toTime, setToTime] = useState({ hours: '', minutes: '', ampm: 'PM' });
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const resetForm = () => {
        setIsFullDayCheck(false);
        setFromTime({ hours: '', minutes: '', ampm: 'PM' });
        setToTime({ hours: '', minutes: '', ampm: 'PM' });
        setFocusedField(null);
    };

    const { mutate: blockTimeSlot, isPending: isBlockTimeSlotPending } = useAddBlockSlots({
        onSuccess(res: any) {
            console.log('Block time slot response:', res);
            toast.success(res?.data?.message);
            onOpenChange(false);
            resetForm();
            onSuccess();
        },
        onError(err: any) {
            toast.error(err?.data?.message);
            resetForm();
            onOpenChange(false);
        },
    });

    const handleFromTimeChange = (field: 'hours' | 'minutes' | 'ampm', value: string) => {
        setFromTime((prev) => ({ ...prev, [field]: value }));
    };

    const handleToTimeChange = (field: 'hours' | 'minutes' | 'ampm', value: string) => {
        setToTime((prev) => ({ ...prev, [field]: value }));
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        timeType: 'from' | 'to',
        field: 'hours' | 'minutes',
    ) => {
        let value = e.target.value.replace(/\D/g, ''); // digits only

        // ✅ Don’t pad/force while typing — let user type "1", "09", etc.
        if (value.length > (field === 'hours' ? 2 : 2)) {
            value = value.slice(0, 2);
        }

        if (timeType === 'from') {
            handleFromTimeChange(field, value);
        } else {
            handleToTimeChange(field, value);
        }
    };

    // ✅ On blur, clamp + pad properly
    const handleBlur = (timeType: 'from' | 'to', field: 'hours' | 'minutes', value: string) => {
        if (!value) return;
        let num = parseInt(value, 10);

        if (field === 'hours') {
            if (isNaN(num) || num < 1) num = 1;
            if (num > 12) num = 12;
        } else {
            if (isNaN(num) || num < 0) num = 0;
            if (num > 59) num = 59;
        }

        const finalVal = num.toString().padStart(2, '0');
        if (timeType === 'from') {
            handleFromTimeChange(field, finalVal);
        } else {
            handleToTimeChange(field, finalVal);
        }
    };

    const getInputClassName = (fieldName: string) => {
        const baseClass =
            'w-14 text-center font-semibold rounded-md transition-all border ring-0 border outline-0';
        const focusedClass =
            focusedField === fieldName
                ? 'border-[#F6CD28] bg-white'
                : 'bg-gray-50 border-gray-200 focus:border-[#F6CD28] focus:bg-white';
        return `${baseClass} ${focusedClass}`;
    };

    const formatTime = (timeObj: { hours: string; minutes: string; ampm: string }) => {
        if (!timeObj.hours || !timeObj.minutes || !timeObj.ampm) return '';

        // Convert 12-hour format to 24-hour format manually
        let hours24 = parseInt(timeObj.hours);
        const minutes = timeObj.minutes.padStart(2, '0');

        if (timeObj.ampm === 'PM' && hours24 !== 12) {
            hours24 += 12;
        } else if (timeObj.ampm === 'AM' && hours24 === 12) {
            hours24 = 0;
        }

        const hours24Str = hours24.toString().padStart(2, '0');
        return `${hours24Str}:${minutes}:00`;
    };

    const isFormValid = () => {
        return (
            fromTime.hours &&
            fromTime.minutes &&
            fromTime.ampm &&
            toTime.hours &&
            toTime.minutes &&
            toTime.ampm
        );
    };

    const handleBlockTime = () => {
        if (!isFormValid() && !isFullDayCheck) return;

        const payload: BlockTimePayload = {
            spaceId: selectedId,
            date: dayjs(date).format('YYYY-MM-DD'),
            availableFrom: isFullDayCheck
                ? dayjs(date).startOf('day').format('HH:mm:ss')
                : formatTime(fromTime),
            availableTo: isFullDayCheck
                ? dayjs(date).endOf('day').format('HH:mm:ss')
                : formatTime(toTime),
        };

        blockTimeSlot(payload);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="lg:w-[35vw] md:min-w-[600px] md:w-[50vw] sm:w-[80vw] w-full sm:max-w-none p-4 sm:p-8 overflow-auto"
            >
                <SheetHeader>
                    <SheetTitle className="flex w-full justify-between items-center">
                        <h2 className="text-xl font-semibold text-black">Block Time slots</h2>
                        <X className="cursor-pointer w-5 h-5" onClick={() => onOpenChange(false)} />
                    </SheetTitle>
                </SheetHeader>

                <div className="text-zinc-800 text-4xl font-bold">
                    {dayjs(date).format('DD MMMM YYYY')}
                </div>
                {/* Body */}
                <div className="mt-6 space-y-6">
                    <h3 className="text-base font-semibold text-gray-900">Time Block</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* From Time */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">From</Label>
                            <div className="flex items-center gap-1.5">
                                <Input
                                    disabled={isFullDayCheck}
                                    className={getInputClassName('from-hours')}
                                    value={fromTime.hours}
                                    onChange={(e) => handleInputChange(e, 'from', 'hours')}
                                    onFocus={() => setFocusedField('from-hours')}
                                    onBlur={() => {
                                        setFocusedField(null);
                                        handleBlur('from', 'hours', fromTime.hours);
                                    }}
                                    maxLength={2}
                                />
                                <span className="font-bold text-gray-600">:</span>
                                <Input
                                    disabled={isFullDayCheck}
                                    className={getInputClassName('from-minutes')}
                                    value={fromTime.minutes}
                                    onChange={(e) => handleInputChange(e, 'from', 'minutes')}
                                    onFocus={() => setFocusedField('from-minutes')}
                                    onBlur={() => {
                                        setFocusedField(null);
                                        handleBlur('from', 'minutes', fromTime.minutes);
                                    }}
                                    maxLength={2}
                                />
                                <div className="flex ml-1">
                                    <Button
                                        variant={fromTime.ampm === 'AM' ? 'default' : 'outline'}
                                        className={`px-3 rounded-none rounded-l-md font-semibold text-sm ${
                                            fromTime.ampm === 'AM'
                                                ? 'bg-[#F6CD28] text-black hover:bg-yellow-500'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                        onClick={() => handleFromTimeChange('ampm', 'AM')}
                                    >
                                        AM
                                    </Button>
                                    <Button
                                        variant={fromTime.ampm === 'PM' ? 'default' : 'outline'}
                                        className={`px-3 rounded-none rounded-r-md font-semibold text-sm ${
                                            fromTime.ampm === 'PM'
                                                ? 'bg-[#F6CD28] text-black hover:bg-yellow-500'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                        onClick={() => handleFromTimeChange('ampm', 'PM')}
                                    >
                                        PM
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* To Time */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">To</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    disabled={isFullDayCheck}
                                    className={getInputClassName('to-hours')}
                                    value={toTime.hours}
                                    onChange={(e) => handleInputChange(e, 'to', 'hours')}
                                    onFocus={() => setFocusedField('to-hours')}
                                    onBlur={() => {
                                        setFocusedField(null);
                                        handleBlur('to', 'hours', toTime.hours);
                                    }}
                                    maxLength={2}
                                />
                                <span className="font-bold text-gray-600">:</span>
                                <Input
                                    disabled={isFullDayCheck}
                                    className={getInputClassName('to-minutes')}
                                    value={toTime.minutes}
                                    onChange={(e) => handleInputChange(e, 'to', 'minutes')}
                                    onFocus={() => setFocusedField('to-minutes')}
                                    onBlur={() => {
                                        setFocusedField(null);
                                        handleBlur('to', 'minutes', toTime.minutes);
                                    }}
                                    maxLength={2}
                                />
                                <div className="flex ml-1">
                                    <Button
                                        variant={toTime.ampm === 'AM' ? 'default' : 'outline'}
                                        className={`px-3 rounded-none rounded-l-md font-semibold text-sm ${
                                            toTime.ampm === 'AM'
                                                ? 'bg-[#F6CD28] text-black hover:bg-yellow-500'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                        onClick={() => handleToTimeChange('ampm', 'AM')}
                                    >
                                        AM
                                    </Button>
                                    <Button
                                        variant={toTime.ampm === 'PM' ? 'default' : 'outline'}
                                        className={`px-3 rounded-none rounded-r-md font-semibold text-sm ${
                                            toTime.ampm === 'PM'
                                                ? 'bg-[#F6CD28] text-black hover:bg-yellow-500'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                        onClick={() => handleToTimeChange('ampm', 'PM')}
                                    >
                                        PM
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Checkbox
                        className="cursor-pointer data-[state=checked]:bg-[#F6CD28] data-[state=checked]:border-[#F6CD28]"
                        checked={isFullDayCheck}
                        onCheckedChange={(e: any) => setIsFullDayCheck(e)}
                    />
                    <div className="text-gray-700 text-sm font-medium">Block Entire Day</div>
                </div>

                {/* Footer */}
                <div className="mt-8">
                    <Button
                        className="w-full text-base font-semibold rounded-full h-12"
                        disabled={!isFullDayCheck && !isFormValid()}
                        variant={!isFullDayCheck && !isFormValid() ? 'disabled' : 'default'}
                        onClick={handleBlockTime}
                    >
                        Block Time
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
