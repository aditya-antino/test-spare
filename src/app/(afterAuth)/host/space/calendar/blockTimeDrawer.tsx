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

dayjs.extend(utc);
dayjs.extend(timezone);

interface BlockTimePayload {
    spaceId: number;
    date: string;
    availableFrom: string;
    availableTo: string;
}

export function BlockTimeDrawer({
    date,
    selectedId,
    open,
    onOpenChange,
    onSuccess,
    clickedTime,
    suggestedEndTime,
    existingSlots = [],
}: {
    open: boolean;
    selectedId: number;
    date: any;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    clickedTime?: { hour: number; minute: number };
    suggestedEndTime?: { hour: number; minute: number };
    existingSlots: any[];
}) {
    const [fromTime, setFromTime] = useState({ hours: '', minutes: '', ampm: 'AM' });
    const [toTime, setToTime] = useState({ hours: '', minutes: '', ampm: 'AM' });
    const [focusedField, setFocusedField] = useState<string | null>(null);

    React.useEffect(() => {
        if (open) {
            if (clickedTime) {
                const hours12 = clickedTime.hour % 12 || 12;
                const ampm = clickedTime.hour >= 12 ? 'PM' : 'AM';

                setFromTime({
                    hours: hours12.toString().padStart(2, '0'),
                    minutes: clickedTime.minute.toString().padStart(2, '0'),
                    ampm,
                });

                if (suggestedEndTime) {
                    setToTime({
                        hours: suggestedEndTime.hour.toString().padStart(2, '0'),
                        minutes: suggestedEndTime.minute.toString().padStart(2, '0'),
                        ampm: 'PM',
                    });
                } else {
                    const end = dayjs()
                        .hour(clickedTime.hour)
                        .minute(clickedTime.minute)
                        .add(1, 'hour');

                    setToTime({
                        hours: (end.hour() % 12 || 12).toString().padStart(2, '0'),
                        minutes: end.minute().toString().padStart(2, '0'),
                        ampm: 'PM',
                    });
                }
            } else {
                setToTime({
                    hours: '00',
                    minutes: '00',
                    ampm: 'PM',
                });
            }
        }
    }, [clickedTime, suggestedEndTime, open]);

    const { mutate: blockTimeSlot, isPending: isBlockTimeSlotPending } = useAddBlockSlots({
        onSuccess(res: any) {
            toast.success(res.data?.message);
            onOpenChange(false);
            onSuccess();
        },
        onError(err: any) {
            toast.error(err?.message || err?.message);
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
        let value = e.target.value.replace(/\D/g, '');

        if (value.length > 2) {
            value = value.slice(0, 2);
        }

        if (timeType === 'from') {
            handleFromTimeChange(field, value);
        } else {
            handleToTimeChange(field, value);
        }
    };

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

    const selectedFrom = () => {
        if (!fromTime.hours || !fromTime.minutes || !fromTime.ampm) return null;
        return dayjs(`${formatTime(fromTime)}`, 'HH:mm:ss');
    };

    const selectedTo = () => {
        if (!toTime.hours || !toTime.minutes || !toTime.ampm) return null;
        return dayjs(`${formatTime(toTime)}`, 'HH:mm:ss');
    };

    const handleBlockTime = () => {
        if (!isFormValid()) return;

        const from = selectedFrom();
        const to = selectedTo();
        if (!from || !to) return;

        // Check for overlap
        const isOverlap = existingSlots.some((slot) => {
            const slotStart = dayjs(slot.availableFrom, 'HH:mm:ss');
            const slotEnd = dayjs(slot.availableTo, 'HH:mm:ss');

            return from.isBefore(slotEnd) && to.isAfter(slotStart);
        });

        if (isOverlap) {
            toast.error('Selected time overlaps with an existing slot!');
            return;
        }

        const payload: BlockTimePayload = {
            spaceId: selectedId,
            date: dayjs(date).format('YYYY-MM-DD'),
            availableFrom: formatTime(fromTime),
            availableTo: formatTime(toTime),
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

                <div className="mt-6 space-y-6">
                    <h3 className="text-base font-semibold text-gray-900">Time Block</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">From</Label>
                            <div className="flex items-center gap-1.5">
                                <Input
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

                        <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">To</Label>
                            <div className="flex items-center gap-2">
                                <Input
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

                <div className="mt-8">
                    <Button
                        className="w-full text-base font-semibold rounded-full h-12"
                        disabled={!isFormValid() || isBlockTimeSlotPending}
                        variant={isFormValid() ? 'default' : 'outline'}
                        onClick={handleBlockTime}
                    >
                        {isBlockTimeSlotPending ? 'Blocking...' : 'Block Time'}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
