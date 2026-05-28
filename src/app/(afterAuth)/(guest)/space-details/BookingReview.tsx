'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { format, isToday, parse } from 'date-fns';
import { Plus, Minus, ChevronDown, SquarePen, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Bell, MessageCircle, User, Timer, AlertTriangle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetGuestBookingCalendar, useGetGuestTimeSlots, useGetKYCDoc } from '@/services';
import { capitalizeWord } from '../../../../utils/helperFunctions';
import { formatCurrency } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface TimeData {
    fromHours: string;
    fromMinutes: string;
    fromPeriod: string;
    toHours: string;
    toMinutes: string;
    toPeriod: string;
}

interface BookingReviewProps {
    spaceData: any;
    bookingDetails: {
        date: string;
        timeStart: string;
        timeEnd: string;
        attendees: number;
        customRules?: string[];
        cancellationPolicy?: {
            key: string;
            message: string;
        };
    };
    bookingSettings?: any;
    message: string;
    isInstantBooking?: boolean;
    onMessageChange: (message: string) => void;
    onBookingDetailsChange: (field: string, value: any) => void;
    onBack: () => void;
    onRequestToBook: () => void;
    onInstantBookingPayment?: () => void;
    isLoading?: boolean;
}

import { containsPII } from '@/utils/piiValidation';
import { checkRestrictedContent } from '@/utils/validators';
import { formatGSTForDisplay } from '@/utils/gstHelpers';

const BookingTimer = ({ spaceId, onExpiry }: { spaceId: number; onExpiry: () => void }) => {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const expiryCallbackRef = useRef(onExpiry);

    useEffect(() => {
        expiryCallbackRef.current = onExpiry;
    }, [onExpiry]);

    useEffect(() => {
        if (!spaceId) return;

        const STORAGE_KEY = `booking_expiry_${spaceId}`;
        const savedExpiry = localStorage.getItem(STORAGE_KEY);
        let expiryTime: number;

        if (savedExpiry) {
            expiryTime = parseInt(savedExpiry, 10);

            const now = Date.now();
            if (expiryTime < now - 3600000) {
                // If more than 1 hour old, reset it
                expiryTime = now + 600 * 1000; // 10 minutes
                localStorage.setItem(STORAGE_KEY, expiryTime.toString());
            }
        } else {
            expiryTime = Date.now() + 600 * 1000; // 10 minutes
            localStorage.setItem(STORAGE_KEY, expiryTime.toString());
        }

        const updateTimer = () => {
            const now = Date.now();
            const diff = Math.max(0, Math.floor((expiryTime - now) / 1000));
            setTimeLeft(diff);

            if (diff <= 0) {
                if (timerRef.current) clearInterval(timerRef.current);
                localStorage.removeItem(STORAGE_KEY);
                expiryCallbackRef.current();
            }
        };

        // Initialize
        updateTimer();
        timerRef.current = setInterval(updateTimer, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [spaceId]); // Only restart if space changes

    const formatTime = (seconds: number | null) => {
        if (seconds === null) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-red-200 shadow-sm">
            <span className="text-[10px] md:text-xs font-bold text-red-500 uppercase tracking-wider">
                Expires in
            </span>
            <span className="text-sm md:text-lg font-bold text-gray-900 tabular-nums">
                {formatTime(timeLeft)}
            </span>
        </div>
    );
};

const MessageToHostSection = ({
    message,
    onMessageChange,
}: {
    message: string;
    onMessageChange: (value: string) => void;
}) => {
    const [hasAnyNumber, setHasAnyNumber] = useState(false);

    const strictNoNumbersRegex = /\d/;

    const handleMessageChange = (value: string) => {
        // Check for restricted content (numbers, email, phone, links)
        const restriction = checkRestrictedContent(value);
        if (restriction) {
            toast.warning(restriction);
            // If it's specifically numbers, we update the state to show error UI
            if (restriction.includes('Numbers')) {
                setHasAnyNumber(true);
            }
            return;
        }

        setHasAnyNumber(false);
        onMessageChange(value);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const pastedText = e.clipboardData.getData('text');
        const restriction = checkRestrictedContent(pastedText);
        if (restriction) {
            e.preventDefault();
            toast.warning(restriction);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (/[\d]/.test(e.key)) {
            e.preventDefault();
            toast.warning('Numbers are not allowed in messages');
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-col gap-2 h-[157px]">
                <div className="flex flex-col gap-1 flex-1">
                    <div
                        className={`relative flex-1 bg-white border rounded-2xl shadow-sm ${hasAnyNumber ? 'border-red-500' : 'border-gray-300'
                            }`}
                    >
                        <textarea
                            value={message}
                            onChange={(e) => handleMessageChange(e.target.value)}
                            onPaste={handlePaste}
                            onKeyPress={handleKeyPress}
                            placeholder="Message to Host (Numbers and links are not allowed)"
                            className="w-full h-full p-3 pt-2 pr-6 pb-4 pl-3 bg-transparent border-none outline-none resize-none text-gray-700 text-sm leading-tight font-normal placeholder-gray-700 font-figtree"
                            maxLength={500}
                        />
                        <div className="absolute bottom-3 right-3 w-3 h-3">
                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                                <path d="M10.72 10.72L0.28 0.28" stroke="#9CA3AF" strokeWidth="1" />
                                <path d="M6.72 10.72L0.28 4.28" stroke="#9CA3AF" strokeWidth="1" />
                                <path d="M10.72 6.72L4.28 0.28" stroke="#9CA3AF" strokeWidth="1" />
                            </svg>
                        </div>
                    </div>
                    {hasAnyNumber && (
                        <div className="flex items-start gap-1 text-xs text-red-500 mt-1">
                            <svg
                                className="w-3 h-3 mt-0.5 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span>Numbers are not allowed in messages to host</span>
                        </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                        Character count: {message.length}/500
                    </p>
                </div>
            </div>
        </div>
    );
};

// Time Picker Dropdown Component with min booking hours display
const TimePickerDropdown = ({
    isOpen,
    timeData,
    onTimeChange,
    onApply,
    onClose,
    isDateAvailable,
    isLoading,
    unavailabilityReason,
    operatingHours = [],
    isTimeWithinOperatingHours = true,
    timeSlotsData,
    isApplyDisabled = false,
    minBookingHours,
}: {
    isOpen: boolean;
    timeData: TimeData;
    onTimeChange: (type: 'from' | 'to', field: string, value: string) => void;
    onApply: () => void;
    onClose: () => void;
    isDateAvailable: boolean;
    isLoading: boolean;
    unavailabilityReason?: string;
    operatingHours?: Array<{ from: string; to: string }>;
    isTimeWithinOperatingHours?: boolean;
    timeSlotsData?: any;
    isApplyDisabled?: boolean;
    minBookingHours?: string;
}) => {
    if (!isOpen) return null;

    const formatTimeForDisplay = (timeString: string) => {
        const [hours, minutes] = timeString.split(':');
        const hour24 = parseInt(hours);
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        const period = hour24 >= 12 ? 'PM' : 'AM';
        return `${hour12}:${minutes} ${period}`;
    };

    const isTimeConflicting = (startTime: string, endTime: string) => {
        if (!timeSlotsData) return false;

        const startMinutes = convertTimeToMinutes(startTime);
        const endMinutes = convertTimeToMinutes(endTime);

        if (timeSlotsData.calendarBlocks) {
            for (const block of timeSlotsData.calendarBlocks) {
                const blockStart = convertTimeToMinutes(block.availableFrom);
                const blockEnd = convertTimeToMinutes(block.availableTo);

                if (startMinutes < blockEnd && endMinutes > blockStart) {
                    return true;
                }
            }
        }

        if (timeSlotsData.bookings) {
            for (const booking of timeSlotsData.bookings) {
                const bookingStart = new Date(booking.startDatetime);
                const bookingEnd = new Date(booking.endDatetime);
                const bookingStartMinutes =
                    bookingStart.getHours() * 60 + bookingStart.getMinutes();
                const bookingEndMinutes = bookingEnd.getHours() * 60 + bookingEnd.getMinutes();

                if (startMinutes < bookingEndMinutes && endMinutes > bookingStartMinutes) {
                    return true;
                }
            }
        }

        return false;
    };

    const convertTimeToMinutes = (timeString: string) => {
        const [hours, minutes] = timeString.split(':');
        return parseInt(hours) * 60 + parseInt(minutes);
    };

    const handleInputChange = (type: 'from' | 'to', field: 'hours' | 'minutes', value: string) => {
        if (value === '') {
            onTimeChange(type, field, '');
            return;
        }

        const numericValue = value.replace(/\D/g, '');

        if (numericValue === '') {
            onTimeChange(type, field, '');
            return;
        }

        if (numericValue.length === 1) {
            onTimeChange(type, field, numericValue);
            return;
        }

        const numValue = parseInt(numericValue, 10);

        if (field === 'hours') {
            if (numValue >= 1 && numValue <= 12) {
                onTimeChange(type, field, numericValue);
            } else if (numValue > 12) {
                onTimeChange(type, field, '12');
            } else {
                onTimeChange(type, field, '01');
            }
        } else {
            if (numValue >= 0 && numValue <= 59) {
                onTimeChange(type, field, numericValue.padStart(2, '0'));
            } else if (numValue > 59) {
                onTimeChange(type, field, '59');
            } else {
                onTimeChange(type, field, '00');
            }
        }
    };

    const handleInputFocus = (type: 'from' | 'to', field: 'hours' | 'minutes') => {
        const currentValue =
            type === 'from'
                ? field === 'hours'
                    ? timeData.fromHours
                    : timeData.fromMinutes
                : field === 'hours'
                    ? timeData.toHours
                    : timeData.toMinutes;

        if (field === 'hours' && (currentValue === '00' || currentValue === '')) {
            onTimeChange(type, field, '');
        }
    };

    const handleInputBlur = (type: 'from' | 'to', field: 'hours' | 'minutes') => {
        const currentValue =
            type === 'from'
                ? field === 'hours'
                    ? timeData.fromHours
                    : timeData.fromMinutes
                : field === 'hours'
                    ? timeData.toHours
                    : timeData.toMinutes;

        // If field is empty after blur, set to default
        if (currentValue === '') {
            if (field === 'hours') {
                onTimeChange(type, field, '00');
            } else {
                onTimeChange(type, field, '00');
            }
        } else {
            // Ensure proper formatting
            const numValue = parseInt(currentValue, 10);
            if (field === 'hours') {
                if (numValue < 1) onTimeChange(type, field, '01');
                else if (numValue > 12) onTimeChange(type, field, '12');
                else onTimeChange(type, field, currentValue.padStart(2, '0'));
            } else {
                if (numValue < 0) onTimeChange(type, field, '00');
                else if (numValue > 59) onTimeChange(type, field, '59');
                else onTimeChange(type, field, currentValue.padStart(2, '0'));
            }
        }
    };

    const getInputClassName = (fieldName: string) => {
        const baseClass =
            'w-12 h-10 text-center text-sm font-medium border rounded-md transition-colors';
        const focusedClass = 'border-[#F6CD28] bg-white outline-none';
        const unfocusedClass = 'border-gray-300 bg-gray-50';

        return `${baseClass} ${fieldName.includes('focused') ? focusedClass : unfocusedClass}`;
    };

    return (
        <div
            className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
        >
            {/* MINIMUM BOOKING HOURS DISPLAY - ADDED FROM BOOKINGFORM */}
            {minBookingHours && parseFloat(minBookingHours) > 0 && (
                <div className="inline-flex items-center px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full my-2">
                    <span className="text-sm font-medium text-black">
                        Min. Booking: <span className="font-bold">{minBookingHours}</span> hours
                    </span>
                </div>
            )}

            {!isDateAvailable ? (
                <div className="flex flex-col items-center justify-center h-32 space-y-2">
                    <div className="text-sm text-red-600 font-medium">Time not available</div>
                    <div className="text-xs text-gray-500 text-center px-4">
                        {unavailabilityReason || 'Please select a different time'}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Show operating hours */}
                    {operatingHours.length > 0 && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <div className="text-sm text-gray-800 font-medium mb-2">
                                Operating Hours:
                            </div>
                            <div className="text-xs text-gray-700">
                                {operatingHours.map((slot, index) => (
                                    <div key={index} className="mb-1">
                                        {slot.from} - {slot.to}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Show blocked and booked slots */}
                    {timeSlotsData &&
                        (timeSlotsData.data?.calendarBlocks?.length > 0 ||
                            timeSlotsData.data?.bookings?.length > 0) && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <div className="text-sm text-red-800 font-medium mb-2">
                                    Unavailable Time Slots:
                                </div>
                                <div className="text-xs text-red-700 space-y-1">
                                    {timeSlotsData.data?.calendarBlocks?.map(
                                        (block: any, index: number) => (
                                            <div
                                                key={`block-${index}`}
                                                className="flex items-center gap-2"
                                            >
                                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                                <span>
                                                    Blocked:{' '}
                                                    {formatTimeForDisplay(block.availableFrom)} -{' '}
                                                    {formatTimeForDisplay(block.availableTo)}
                                                </span>
                                            </div>
                                        ),
                                    )}
                                    {timeSlotsData.data?.bookings?.map(
                                        (booking: any, index: number) => {
                                            const startTime = new Date(booking.startDatetime);
                                            const endTime = new Date(booking.endDatetime);
                                            const startFormatted = formatTimeForDisplay(
                                                `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`,
                                            );
                                            const endFormatted = formatTimeForDisplay(
                                                `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`,
                                            );
                                            return (
                                                <div
                                                    key={`booking-${index}`}
                                                    className="flex items-center gap-2"
                                                >
                                                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                                    <span>
                                                        Booked: {startFormatted} - {endFormatted}
                                                    </span>
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            </div>
                        )}

                    {/* Time Selectors */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label className="text-sm font-medium text-gray-700">Start Time</Label>
                            <div className="flex items-center gap-2">
                                <input
                                    className={getInputClassName('from-hours')}
                                    value={timeData.fromHours}
                                    onChange={(e) =>
                                        handleInputChange('from', 'hours', e.target.value)
                                    }
                                    onFocus={() => handleInputFocus('from', 'hours')}
                                    onBlur={() => handleInputBlur('from', 'hours')}
                                    placeholder="12"
                                    maxLength={2}
                                />
                                <span className="font-bold text-gray-600">:</span>
                                <input
                                    className={getInputClassName('from-minutes')}
                                    value={timeData.fromMinutes}
                                    onChange={(e) =>
                                        handleInputChange('from', 'minutes', e.target.value)
                                    }
                                    onFocus={() => handleInputFocus('from', 'minutes')}
                                    onBlur={() => handleInputBlur('from', 'minutes')}
                                    placeholder="00"
                                    maxLength={2}
                                />
                                <div className="flex">
                                    <Button
                                        type="button"
                                        onClick={() => onTimeChange('from', 'period', 'AM')}
                                        className={`px-3 rounded-none rounded-l-md font-semibold text-sm ${timeData.fromPeriod === 'AM'
                                            ? 'bg-[#F6CD28] text-black hover:bg-yellow-500'
                                            : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        AM
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => onTimeChange('from', 'period', 'PM')}
                                        className={`px-3 rounded-none rounded-r-md font-semibold text-sm ${timeData.fromPeriod === 'PM'
                                            ? 'bg-[#F6CD28] text-black hover:bg-yellow-500'
                                            : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        PM
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-sm font-medium text-gray-700">End Time</Label>
                            <div className="flex items-center gap-2">
                                <input
                                    className={getInputClassName('to-hours')}
                                    value={timeData.toHours}
                                    onChange={(e) =>
                                        handleInputChange('to', 'hours', e.target.value)
                                    }
                                    onFocus={() => handleInputFocus('to', 'hours')}
                                    onBlur={() => handleInputBlur('to', 'hours')}
                                    placeholder="12"
                                    maxLength={2}
                                />
                                <span className="font-bold text-gray-600">:</span>
                                <input
                                    className={getInputClassName('to-minutes')}
                                    value={timeData.toMinutes}
                                    onChange={(e) =>
                                        handleInputChange('to', 'minutes', e.target.value)
                                    }
                                    onFocus={() => handleInputFocus('to', 'minutes')}
                                    onBlur={() => handleInputBlur('to', 'minutes')}
                                    placeholder="00"
                                    maxLength={2}
                                />
                                <div className="flex">
                                    <Button
                                        type="button"
                                        onClick={() => onTimeChange('to', 'period', 'AM')}
                                        className={`px-3 rounded-none rounded-l-md font-semibold text-sm ${timeData.toPeriod === 'AM'
                                            ? 'bg-[#F6CD28] text-black hover:bg-yellow-500'
                                            : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        AM
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => onTimeChange('to', 'period', 'PM')}
                                        className={`px-3 rounded-none rounded-r-md font-semibold text-sm ${timeData.toPeriod === 'PM'
                                            ? 'bg-[#F6CD28] text-black hover:bg-yellow-500'
                                            : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        PM
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button onClick={onClose} variant="outline" className="px-6">
                            Cancel
                        </Button>
                        <Button
                            onClick={onApply}
                            disabled={isApplyDisabled}
                            className={`px-6 ${isApplyDisabled
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-[#F6CD28] hover:bg-yellow-500 text-black'
                                }`}
                        >
                            Apply
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Attendees Picker Dropdown Component
const AttendeesDropdown = ({
    isOpen,
    attendees,
    onAttendeesChange,
    onClose,
    spaceCapacity,
}: {
    isOpen: boolean;
    attendees: number;
    onAttendeesChange: (count: number) => void;
    onClose: () => void;
    spaceCapacity?: number;
}) => {
    const [localAttendees, setLocalAttendees] = useState(attendees);

    const maxCapacity = spaceCapacity && spaceCapacity > 0 ? spaceCapacity : 50;

    const increment = () => setLocalAttendees(Math.min(localAttendees + 1, maxCapacity));
    const decrement = () => setLocalAttendees(Math.max(localAttendees - 1, 0));

    const handleSave = () => {
        onAttendeesChange(localAttendees);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg p-6"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">Number of Attendees</Label>
                <div className="flex items-center justify-center gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full"
                        onClick={decrement}
                        disabled={localAttendees <= 0}
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-2xl font-semibold text-gray-800 min-w-[3rem] text-center">
                        {localAttendees}
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full"
                        onClick={increment}
                        disabled={localAttendees >= maxCapacity}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <div className="text-center text-sm text-gray-500">
                    Maximum {maxCapacity} {maxCapacity === 1 ? 'attendee' : 'attendees'}
                </div>
                <div className="flex justify-end">
                    <Button
                        onClick={handleSave}
                        className="bg-[#F6CD28] hover:bg-yellow-500 text-black px-6 w-full"
                    >
                        Done
                    </Button>
                </div>
            </div>
        </div>
    );
};

// Individual Booking Detail Row Component
const BookingDetailRow = ({
    label,
    value,
    onEdit,
    isLastItem = false,
    isOpen = false,
    isDisabled = false,
}: {
    label: string;
    value: string | React.ReactNode;
    onEdit: () => void;
    isLastItem?: boolean;
    isOpen?: boolean;
    isDisabled?: boolean;
}) => {
    return (
        <div
            className={`relative flex gap-3 p-5 ${!isLastItem ? 'border-b border-gray-200' : ''} ${label === 'Time' ? 'h-20' : label === 'Attendees' ? 'h-20' : ''} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <div className="flex-1 flex flex-col gap-2">
                <label
                    className={`font-normal text-sm ${isDisabled ? 'text-gray-300' : 'text-gray-400'}`}
                >
                    {label}
                </label>
                <div
                    className={`font-semibold text-lg ${isDisabled ? 'text-gray-400' : 'text-gray-800'}`}
                >
                    {value}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isDisabled) onEdit();
                    }}
                    disabled={isDisabled}
                    className={`w-7 h-7 flex items-center justify-center transition-colors ${isDisabled
                        ? 'text-gray-200 cursor-not-allowed'
                        : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    <SquarePen
                        className={`w-5 h-5 cursor-pointer ${isDisabled ? 'text-gray-200' : 'text-gray-300'}`}
                    />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isDisabled) onEdit();
                    }}
                    disabled={isDisabled}
                    className={`w-7 h-7 flex items-center justify-center transition-transform ${isDisabled ? 'cursor-not-allowed' : ''
                        } ${isOpen ? 'rotate-180' : ''}`}
                >
                    <ChevronDown
                        className={`w-5 h-5 cursor-pointer ${isDisabled ? 'text-gray-200' : 'text-gray-300'}`}
                    />
                </button>
            </div>
        </div>
    );
};

const BookingReview: React.FC<BookingReviewProps> = ({
    spaceData,
    bookingDetails,
    bookingSettings,
    message,
    isInstantBooking = false,
    onMessageChange,
    onBookingDetailsChange,
    onBack,
    onRequestToBook,
    onInstantBookingPayment,
    isLoading = false,
}) => {
    const router = useRouter();

    const { data: kycDoc } = useGetKYCDoc();
    const isKycVerified = useMemo(() => {
        const docs = kycDoc?.data?.filter((doc: any) => doc.type !== 'pan' && doc.type !== 'gst') || [];
        return docs.length > 0;
    }, [kycDoc]);

    const [agreements, setAgreements] = useState({
        keepConversations: false,
        processPayments: false,
        understandContracts: false,
        meetRegulations: false,
    });

    const [customRulesAgreements, setCustomRulesAgreements] = useState<boolean[]>([]);

    useEffect(() => {
        if (bookingDetails?.customRules) {
            setCustomRulesAgreements(new Array(bookingDetails.customRules.length).fill(false));
        }
    }, [bookingDetails?.customRules]);

    const handleCustomRuleAgreementChange = (index: number, checked: boolean | 'indeterminate') => {
        setCustomRulesAgreements((prev) => {
            const next = [...prev];
            next[index] = checked === true;
            return next;
        });
    };

    // Dropdown states for editing
    const [dropdownStates, setDropdownStates] = useState({
        date: false,
        time: false,
        attendees: false,
    });

    // Time data state
    const [timeData, setTimeData] = useState<TimeData>({
        fromHours: '',
        fromMinutes: '00',
        fromPeriod: 'PM',
        toHours: '',
        toMinutes: '00',
        toPeriod: 'PM',
    });

    // Convert selected date to UTC ISO format for API (avoid timezone issues)
    const selectedDateISO =
        bookingDetails.date !== 'Select date'
            ? (() => {
                const date = new Date(bookingDetails.date);
                // Check if the date is valid
                if (isNaN(date.getTime())) {
                    console.error('Invalid date:', bookingDetails.date);
                    return null;
                }
                // Create UTC date to avoid timezone conversion
                const utcDate = new Date(
                    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
                );
                return utcDate.toISOString();
            })()
            : null;

    // Convert time to 24-hour format for API with seconds
    const convertTo24Hour = (time: string) => {
        const [timePart, period] = time.split(' ');
        const [hours, minutes] = timePart.split(':');
        let hour24 = parseInt(hours);
        if (period === 'PM' && hour24 !== 12) hour24 += 12;
        if (period === 'AM' && hour24 === 12) hour24 = 0;
        return `${hour24.toString().padStart(2, '0')}:${minutes}:00`;
    };

    const { data: calendarData, isLoading: isCalendarLoading } = useGetGuestBookingCalendar(
        spaceData?.id || 0,
        { enabled: dropdownStates.date && !!spaceData?.id } as any,
    );

    const nonOperatingDays = calendarData?.data || [];

    const {
        data: dateAvailabilityData,
        isLoading: isDateAvailabilityLoading,
        error: dateAvailabilityError,
    } = useGetGuestTimeSlots(
        spaceData?.id || 0,
        selectedDateISO || '',
        undefined, // No startTime initially
        undefined, // No endTime initially
        {
            enabled:
                (dropdownStates.date || dropdownStates.time) &&
                !!selectedDateISO &&
                !!spaceData?.id,
        } as any,
    );

    // Time validation check (with time parameters) - only when user changes time
    const [shouldValidateTime, setShouldValidateTime] = useState(false);
    const [isApplyDisabled, setIsApplyDisabled] = useState(false);

    const startTime24 = `${timeData.fromHours}:${timeData.fromMinutes} ${timeData.fromPeriod}`;
    const endTime24 = `${timeData.toHours}:${timeData.toMinutes} ${timeData.toPeriod}`;

    const { data: timeSlotsData, isLoading: isTimeSlotsLoading } = useGetGuestTimeSlots(
        spaceData?.id || 0,
        selectedDateISO || '',
        undefined,
        undefined,
        { enabled: dropdownStates.time && !!selectedDateISO && !!spaceData?.id } as any,
    );

    const {
        data: timeValidationData,
        isLoading: isTimeValidationLoading,
        error: timeValidationError,
    } = useGetGuestTimeSlots(
        spaceData?.id || 0,
        selectedDateISO || '',
        convertTo24Hour(startTime24),
        convertTo24Hour(endTime24),
        { enabled: shouldValidateTime && !!selectedDateISO && !!spaceData?.id } as any,
    );

    // Use date availability data for initial check
    const isDateAvailable = dateAvailabilityData?.data?.available ?? true;
    const dateUnavailabilityReason = dateAvailabilityData?.data?.reason;

    // Use time validation data when user changes time
    const isTimeSlotValid = timeValidationData?.data?.available ?? true;
    const timeUnavailabilityReason = timeValidationData?.data?.reason;
    const timeValidationMessage = timeValidationData?.data?.message;

    const operatingHours =
        timeSlotsData?.data?.operatingHours || timeValidationData?.data?.operatingHours || [];

    const availableTimeSlots = dateAvailabilityData?.data?.availableTimeSlots || [];

    // Function to check if selected time falls within operating hours
    const isTimeWithinOperatingHours = (
        startTime: string,
        endTime: string,
        operatingHours: Array<{ from: string; to: string }>,
    ): boolean => {
        if (operatingHours.length === 0) return true; // If no operating hours, assume always available

        const convertToMinutes = (time: string): number => {
            const [timePart, period] = time.split(' ');
            const [hours, minutes] = timePart.split(':');
            let hour24 = parseInt(hours, 10);

            if (isNaN(hour24)) hour24 = 0;

            if (period === 'PM' && hour24 !== 12) hour24 += 12;
            if (period === 'AM' && hour24 === 12) hour24 = 0;

            return hour24 * 60 + parseInt(minutes, 10);
        };

        const startMinutes = convertToMinutes(startTime);
        const endMinutes = convertToMinutes(endTime);
        const bookingSpansMidnight = endMinutes < startMinutes;

        return operatingHours.some((slot) => {
            const slotStartMinutes = convertToMinutes(slot.from);
            const slotEndMinutes = convertToMinutes(slot.to);
            const slotSpansMidnight = slotEndMinutes < slotStartMinutes;

            if (slotSpansMidnight) {
                // Operating hours span midnight (e.g., 10 PM to 2 AM)
                if (bookingSpansMidnight) {
                    // Booking also spans midnight
                    return startMinutes >= slotStartMinutes && endMinutes <= slotEndMinutes;
                } else {
                    // Booking doesn't span midnight, check if it overlaps with the slot
                    if (startMinutes >= slotStartMinutes && endMinutes >= slotStartMinutes) {
                        return true;
                    }
                    if (startMinutes <= slotEndMinutes && endMinutes <= slotEndMinutes) {
                        return true;
                    }
                    return false;
                }
            } else {
                // Operating hours don't span midnight
                if (bookingSpansMidnight) {
                    // Booking spans midnight but operating hours don't - invalid
                    return false;
                } else {
                    // Neither spans midnight - check if booking is within slot
                    return startMinutes >= slotStartMinutes && endMinutes <= slotEndMinutes;
                }
            }
        });
    };

    // Check if current time selection is within operating hours
    const isCurrentTimeValid = isTimeWithinOperatingHours(startTime24, endTime24, operatingHours);

    // Show toaster when date is not available
    useEffect(() => {
        if (dateAvailabilityData && !isDateAvailable && dateUnavailabilityReason) {
            toast.dismiss(); // Clear any existing toasts
            toast.error(dateUnavailabilityReason);
        }
    }, [dateAvailabilityData, isDateAvailable, dateUnavailabilityReason]);

    // Show toaster for API errors
    useEffect(() => {
        if (dateAvailabilityError) {
            const errorMessage = (dateAvailabilityError as any)?.response?.data?.message;
            if (errorMessage) {
                toast.dismiss(); // Clear any existing toasts
                toast.error(errorMessage);
            }
        }
    }, [dateAvailabilityError]);

    useEffect(() => {
        if (timeValidationError) {
            const errorMessage = (timeValidationError as any)?.response?.data?.message;
            if (errorMessage) {
                toast.dismiss(); // Clear any existing toasts
                toast.error(errorMessage);
            }
        }
    }, [timeValidationError]);

    // Show toaster when time is not available or outside operating hours
    useEffect(() => {
        if (timeValidationData && shouldValidateTime) {
            if (timeValidationData.data?.message) {
                const message = timeValidationData.data.message;
                if (message.includes('Minimum') || message.includes('Maximum')) {
                    toast.dismiss();
                    toast.error(message);
                    setShouldValidateTime(false);

                    // Reset time picker to default values
                    setTimeData({
                        fromHours: '',
                        fromMinutes: '00',
                        fromPeriod: 'PM',
                        toHours: '',
                        toMinutes: '00',
                        toPeriod: 'PM',
                    });

                    onBookingDetailsChange('timeStart', 'Start time');
                    onBookingDetailsChange('timeEnd', 'End time');

                    // Reset apply button state to allow user to try again
                    setIsApplyDisabled(false);

                    return;
                }
            }

            if (!isTimeSlotValid && timeUnavailabilityReason) {
                toast.dismiss(); // Clear any existing toasts
                toast.error(timeUnavailabilityReason);
                setShouldValidateTime(false); // Reset validation flag
                setIsApplyDisabled(false); // Reset apply button state
            } else if (isTimeSlotValid && !isCurrentTimeValid && timeValidationMessage) {
                // Show available time slots when time is outside operating hours
                const availableSlots = operatingHours
                    .map((slot) => `${slot.from} - ${slot.to}`)
                    .join(', ');
                toast.dismiss(); // Clear any existing toasts
                toast.error(`${timeValidationMessage} Available slots: ${availableSlots}`);
                setShouldValidateTime(false); // Reset validation flag
                setIsApplyDisabled(false); // Reset apply button state
            } else if (isTimeSlotValid && isCurrentTimeValid) {
                // Time is valid, apply the changes
                applyTimeChanges();
                setShouldValidateTime(false); // Reset validation flag
                setIsApplyDisabled(false); // Reset apply button state
            }
        }

        // Handle loading state
        if (shouldValidateTime && isTimeValidationLoading) {
            setIsApplyDisabled(true);
        }
    }, [
        timeValidationData,
        isTimeSlotValid,
        timeUnavailabilityReason,
        timeValidationMessage,
        operatingHours,
        isCurrentTimeValid,
        shouldValidateTime,
        isTimeValidationLoading,
    ]);

    // Helper function to create proper datetime for overnight bookings
    const createBookingDatetime = (date: string, time: string, isEndTime: boolean = false) => {
        const baseDate = new Date(date);
        const [timePart, period] = time.split(' ');
        const [hours, minutes] = timePart.split(':');
        let hour24 = parseInt(hours);
        if (period === 'PM' && hour24 !== 12) hour24 += 12;
        if (period === 'AM' && hour24 === 12) hour24 = 0;

        const bookingDate = new Date(baseDate);
        bookingDate.setHours(hour24, parseInt(minutes), 0, 0);

        // If this is an end time and it's earlier than start time, it's overnight
        if (isEndTime) {
            const startTime = `${timeData.fromHours}:${timeData.fromMinutes} ${timeData.fromPeriod}`;
            const [startTimePart, startPeriod] = startTime.split(' ');
            const [startHours, startMinutes] = startTimePart.split(':');
            let startHour24 = parseInt(startHours);
            if (startPeriod === 'PM' && startHour24 !== 12) startHour24 += 12;
            if (startPeriod === 'AM' && startHour24 === 12) startHour24 = 0;

            const startDate = new Date(baseDate);
            startDate.setHours(startHour24, parseInt(startMinutes), 0, 0);

            // If end time is earlier than start time, add 24 hours (next day)
            if (bookingDate <= startDate) {
                bookingDate.setTime(bookingDate.getTime() + 24 * 60 * 60 * 1000);
            }
        }

        return bookingDate;
    };

    // Function to apply time changes after validation passes
    const applyTimeChanges = () => {
        const startTime = `${timeData.fromHours}:${timeData.fromMinutes} ${timeData.fromPeriod}`;
        const endTime = `${timeData.toHours}:${timeData.toMinutes} ${timeData.toPeriod}`;

        // Double-check validation before applying (especially for today's bookings)
        if (isSelectedDateToday(bookingDetails.date)) {
            const currentMinutes = getCurrentTimeInMinutes();
            const startMinutes = timeToMinutes(startTime);
            const endMinutes = timeToMinutes(endTime);

            // Require at least 1 hour in advance for start time
            if (startMinutes <= currentMinutes + 60) {
                toast.dismiss();
                toast.error(
                    'Start time must be at least 1 hour in the future. The time has been reset. Please select a future time.',
                );
                // Reset time picker
                resetTimePicker();
                setShouldValidateTime(false);
                setIsApplyDisabled(false);
                return;
            }

            // Check end time validity
            let endMinutesValid = endMinutes;
            if (endMinutes <= startMinutes) {
                endMinutesValid = endMinutes + 24 * 60; // Overnight booking
            }

            if (endMinutesValid <= currentMinutes + 60) {
                toast.dismiss();
                toast.error(
                    'End time must be at least 1 hour in the future. The time has been reset. Please select a future time.',
                );
                // Reset time picker
                resetTimePicker();
                setShouldValidateTime(false);
                setIsApplyDisabled(false);
                return;
            }
        }

        // Check minimum booking hours
        const minBookingCheck = checkMinimumBookingHours(startTime, endTime);
        if (!minBookingCheck.isValid) {
            toast.dismiss();
            toast.error(minBookingCheck.message);
            resetTimePicker();
            setShouldValidateTime(false);
            setIsApplyDisabled(false);
            return;
        }

        // Check against available slots
        const slotCheck = checkTimeAgainstAvailableSlots(startTime, endTime);
        if (!slotCheck.isValid) {
            toast.dismiss();
            toast.error(slotCheck.message);
            resetTimePicker();
            setShouldValidateTime(false);
            setIsApplyDisabled(false);
            return;
        }

        // If validation passes, show success message
        toast.success('Time updated successfully!');
        onBookingDetailsChange('timeStart', startTime);
        onBookingDetailsChange('timeEnd', endTime);
        handleToggleDropdown('time');
    };

    const handleAgreementChange = (key: string, checked: boolean | 'indeterminate') => {
        setAgreements((prev) => {
            const newState = {
                ...prev,
                [key]: checked === true,
            };
            return newState;
        });
    };

    // Dropdown handlers
    const handleToggleDropdown = (field: 'date' | 'time' | 'attendees') => {
        setDropdownStates((prev) => ({
            date: false,
            time: false,
            attendees: false,
            [field]: !prev[field],
        }));
    };

    const handleDateSelect = (date: Date) => {
        const formattedDate = format(date, 'MMM dd, yyyy');
        onBookingDetailsChange('date', formattedDate);
        // Reset time validation when date changes
        setShouldValidateTime(false);

        // Always reset time picker when date changes (same as bookingForm)
        resetTimePicker();

        // Close the date dropdown after selection (same as bookingForm)
        handleToggleDropdown('date');
    };

    const handleTimeChange = (type: 'from' | 'to', field: string, value: string) => {
        // Validate numeric input for hours and minutes
        if (field === 'hours' || field === 'minutes') {
            const numValue = parseInt(value);
            if (value !== '' && (isNaN(numValue) || numValue < 0)) {
                return; // Don't update if invalid
            }
            if (field === 'hours' && value !== '' && (numValue < 1 || numValue > 12)) {
                return; // Hours must be 1-12
            }
            if (field === 'minutes' && value !== '' && (numValue < 0 || numValue > 59)) {
                return; // Minutes must be 0-59
            }
        }

        setTimeData((prev) => ({
            ...prev,
            [`${type}${field.charAt(0).toUpperCase() + field.slice(1)}`]: value,
        }));

        // Reset apply button state when user changes time after an error
        setIsApplyDisabled(false);

        // Don't trigger time validation here - only when Apply button is clicked
    };

    const resetTimePicker = () => {
        setTimeData({
            fromHours: '',
            fromMinutes: '00',
            fromPeriod: 'PM',
            toHours: '',
            toMinutes: '00',
            toPeriod: 'PM',
        });
        onBookingDetailsChange('timeStart', 'Start time');
        onBookingDetailsChange('timeEnd', 'End time');
    };

    // NEW: Function to check minimum booking hours (from BookingForm)
    const checkMinimumBookingHours = (startTimeStr: string, endTimeStr: string) => {
        const minBookingHours = parseFloat(spaceData?.SpaceListing?.min_booking_hours || '0');
        if (minBookingHours <= 0) return { isValid: true, message: '' };

        const startMinutes = timeToMinutes(startTimeStr);
        const endMinutes = timeToMinutes(endTimeStr);
        let durationMinutes = endMinutes - startMinutes;

        // Handle overnight bookings
        if (durationMinutes < 0) {
            durationMinutes += 24 * 60; // Add 24 hours
        }

        const durationHours = durationMinutes / 60;

        if (durationHours < minBookingHours) {
            return {
                isValid: false,
                message: `Minimum booking duration is ${minBookingHours} hour${minBookingHours > 1 ? 's' : ''}. Please select a longer time slot.`,
            };
        }

        return { isValid: true, message: '' };
    };

    // NEW: Function to check time against available slots (from BookingForm)
    const checkTimeAgainstAvailableSlots = (startTime: string, endTime: string) => {
        if (availableTimeSlots.length === 0) return { isValid: true, message: '' };

        const startMinutes = timeToMinutes(startTime);
        const endMinutes = timeToMinutes(endTime);

        let earliestSlotStart = Infinity;
        let latestSlotEnd = -Infinity;

        availableTimeSlots.forEach((slot: any) => {
            const slotStart = timeToMinutes(slot.from);
            const slotEnd = timeToMinutes(slot.to);

            if (slotStart < earliestSlotStart) earliestSlotStart = slotStart;
            if (slotEnd > latestSlotEnd) latestSlotEnd = slotEnd;
        });

        if (startMinutes < earliestSlotStart) {
            const earliestSlot = availableTimeSlots.find(
                (slot: any) => timeToMinutes(slot.from) === earliestSlotStart,
            );
            return {
                isValid: false,
                message: `Selected time is before available slots. Earliest available time starts at ${earliestSlot?.startTime}`,
            };
        }

        if (endMinutes > latestSlotEnd) {
            const latestSlot = availableTimeSlots.find(
                (slot: any) => timeToMinutes(slot.to) === latestSlotEnd,
            );
            return {
                isValid: false,
                message: `Selected time is after available slots. Latest available time ends at ${latestSlot?.endTime}`,
            };
        }

        const isWithinAnySlot = availableTimeSlots.some((slot: any) => {
            const slotStart = timeToMinutes(slot.from);
            const slotEnd = timeToMinutes(slot.to);
            return startMinutes >= slotStart && endMinutes <= slotEnd;
        });

        if (!isWithinAnySlot) {
            const availableSlots = availableTimeSlots
                .map((slot: any) => `${slot.from} - ${slot.to}`)
                .join(', ');
            return {
                isValid: false,
                message: `Selected time is not within available slots. Available: ${availableSlots}`,
            };
        }

        return { isValid: true, message: '' };
    };

    const handleTimeApply = () => {
        // Check if date is available before applying time
        if (!isDateAvailable && dateUnavailabilityReason) {
            toast.dismiss();
            toast.error(dateUnavailabilityReason);
            resetTimePicker();
            return;
        }

        const startTime = `${timeData.fromHours}:${timeData.fromMinutes} ${timeData.fromPeriod}`;
        const endTime = `${timeData.toHours}:${timeData.toMinutes} ${timeData.toPeriod}`;

        // Validate that time fields are filled
        if (
            !timeData.fromHours ||
            !timeData.fromMinutes ||
            !timeData.toHours ||
            !timeData.toMinutes
        ) {
            toast.dismiss();
            toast.error('Please enter valid start and end times');
            resetTimePicker();
            return;
        }

        // Validate numeric values
        const fromHoursNum = parseInt(timeData.fromHours, 10);
        const fromMinutesNum = parseInt(timeData.fromMinutes, 10);
        const toHoursNum = parseInt(timeData.toHours, 10);
        const toMinutesNum = parseInt(timeData.toMinutes, 10);

        if (
            isNaN(fromHoursNum) ||
            isNaN(fromMinutesNum) ||
            isNaN(toHoursNum) ||
            isNaN(toMinutesNum)
        ) {
            toast.dismiss();
            toast.error('Please enter valid numeric values for time');
            resetTimePicker();
            return;
        }

        if (fromHoursNum < 1 || fromHoursNum > 12 || toHoursNum < 1 || toHoursNum > 12) {
            toast.dismiss();
            toast.error('Hours must be between 1 and 12');
            resetTimePicker();
            return;
        }

        if (fromMinutesNum < 0 || fromMinutesNum > 59 || toMinutesNum < 0 || toMinutesNum > 59) {
            toast.dismiss();
            toast.error('Minutes must be between 0 and 59');
            resetTimePicker();
            return;
        }

        if (startTime === endTime) {
            toast.dismiss();
            toast.error('Start time and end time cannot be the same');
            resetTimePicker();
            return;
        }

        // Check if selected date is today and if start/end time has passed
        if (isSelectedDateToday(bookingDetails.date)) {
            const currentMinutes = getCurrentTimeInMinutes();
            const startMinutes = timeToMinutes(startTime);
            const endMinutes = timeToMinutes(endTime);

            // Require at least 1 hour in advance
            if (startMinutes <= currentMinutes + 60) {
                toast.dismiss();
                toast.error(
                    'Start time must be at least 1 hour in the future. Please select a future time.',
                );
                resetTimePicker();
                setIsApplyDisabled(false);
                return; // Don't proceed with API validation
            }

            // Handle overnight bookings
            if (endMinutes <= startMinutes) {
                const adjustedEndMinutes = endMinutes + 24 * 60;
                if (adjustedEndMinutes <= currentMinutes + 60) {
                    toast.dismiss();
                    toast.error(
                        'End time must be at least 1 hour in the future. Please select a future time.',
                    );
                    resetTimePicker();
                    setIsApplyDisabled(false);
                    return; // Don't proceed with API validation
                }
            } else {
                if (endMinutes <= currentMinutes + 60) {
                    toast.dismiss();
                    toast.error(
                        'End time must be at least 1 hour in the future. Please select a future time.',
                    );
                    resetTimePicker();
                    setIsApplyDisabled(false);
                    return; // Don't proceed with API validation
                }
            }
        }

        // Wait for backend data before proceeding - check if time slots data is loaded
        if (isTimeSlotsLoading) {
            toast.dismiss();
            toast.info('Loading time slot information...');
            setIsApplyDisabled(true);
            return; // Wait for data to load
        }

        // Check minimum booking hours (NEW FROM BOOKINGFORM)
        const minBookingCheck = checkMinimumBookingHours(startTime, endTime);
        if (!minBookingCheck.isValid) {
            toast.dismiss();
            toast.error(minBookingCheck.message);
            resetTimePicker();
            setIsApplyDisabled(false);
            return;
        }

        // Check time against available slots (if available) - same as bookingForm
        const slotCheck = checkTimeAgainstAvailableSlots(startTime, endTime);
        if (!slotCheck.isValid) {
            toast.dismiss();
            toast.error(slotCheck.message);
            resetTimePicker();
            setIsApplyDisabled(false);
            return;
        }

        // Check if time is within operating hours - MUST BE BEFORE blocks/bookings check (same as bookingForm)
        const isCurrentTimeValid = isTimeWithinOperatingHours(startTime, endTime, operatingHours);
        if (!isCurrentTimeValid && operatingHours.length > 0) {
            const availableSlots = operatingHours
                .map((slot) => {
                    const slotStartMin = timeToMinutes(slot.from);
                    const slotEndMin = timeToMinutes(slot.to);
                    const spansMidnight = slotEndMin < slotStartMin;
                    return spansMidnight
                        ? `${slot.from} - ${slot.to} (overnight)`
                        : `${slot.from} - ${slot.to}`;
                })
                .join(', ');
            toast.dismiss();
            toast.error(
                `Selected time is outside operating hours. Available slots: ${availableSlots}`,
            );
            resetTimePicker();
            setIsApplyDisabled(false);
            return;
        }

        // Check against calendar blocks and existing bookings (if time slots data is available)
        if (timeSlotsData?.data) {
            const data = timeSlotsData.data as any;
            const startTime24 = convertTo24Hour(startTime);
            const endTime24 = convertTo24Hour(endTime);

            const timeToMinutes24 = (timeStr: string): number => {
                const [hours, minutes] = timeStr.split(':');
                return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
            };

            const startMinutes = timeToMinutes24(startTime24);
            const endMinutes = timeToMinutes24(endTime24);
            const bookingSpansMidnight = endMinutes < startMinutes;

            // Check calendar blocks
            if (data.calendarBlocks) {
                for (const block of data.calendarBlocks) {
                    const blockStart = timeToMinutes24(block.availableFrom);
                    const blockEnd = timeToMinutes24(block.availableTo);

                    if (bookingSpansMidnight) {
                        const part1End = 24 * 60;
                        if (startMinutes < blockEnd || part1End > blockStart) {
                            if (!(startMinutes >= blockEnd || part1End <= blockStart)) {
                                toast.dismiss();
                                toast.error('Invalid time selected. This time slot is blocked.');
                                resetTimePicker();
                                setIsApplyDisabled(false);
                                return;
                            }
                        }
                        const part2Start = 0;
                        if (part2Start < blockEnd && endMinutes > blockStart) {
                            toast.dismiss();
                            toast.error('Invalid time selected. This time slot is blocked.');
                            resetTimePicker();
                            setIsApplyDisabled(false);
                            return;
                        }
                    } else {
                        if (startMinutes < blockEnd && endMinutes > blockStart) {
                            toast.dismiss();
                            toast.error('Invalid time selected. This time slot is blocked.');
                            resetTimePicker();
                            setIsApplyDisabled(false);
                            return;
                        }
                    }
                }
            }

            // Check existing bookings
            if (data.bookings) {
                for (const booking of data.bookings) {
                    const bookingStart = new Date(booking.startDatetime);
                    const bookingEnd = new Date(booking.endDatetime);
                    const bookingStartMinutes =
                        bookingStart.getHours() * 60 + bookingStart.getMinutes();
                    const bookingEndMinutes = bookingEnd.getHours() * 60 + bookingEnd.getMinutes();

                    if (bookingSpansMidnight) {
                        const part1End = 24 * 60;
                        if (startMinutes < bookingEndMinutes || part1End > bookingStartMinutes) {
                            if (
                                !(
                                    startMinutes >= bookingEndMinutes ||
                                    part1End <= bookingStartMinutes
                                )
                            ) {
                                toast.dismiss();
                                toast.error(
                                    'Invalid time selected. This time slot is already booked.',
                                );
                                resetTimePicker();
                                setIsApplyDisabled(false);
                                return;
                            }
                        }
                        const part2Start = 0;
                        if (part2Start < bookingEndMinutes && endMinutes > bookingStartMinutes) {
                            toast.dismiss();
                            toast.error('Invalid time selected. This time slot is already booked.');
                            resetTimePicker();
                            setIsApplyDisabled(false);
                            return;
                        }
                    } else {
                        if (startMinutes < bookingEndMinutes && endMinutes > bookingStartMinutes) {
                            toast.dismiss();
                            toast.error('Invalid time selected. This time slot is already booked.');
                            resetTimePicker();
                            setIsApplyDisabled(false);
                            return;
                        }
                    }
                }
            }
        }

        // Only trigger time validation API call if all local and backend checks pass
        setShouldValidateTime(true);
        setIsApplyDisabled(true); // Disable apply button while waiting for API validation

        // Note: The actual validation will happen in the useEffect that watches shouldValidateTime
        // We'll apply the time changes after validation passes
    };

    const handleAttendeesChange = (count: number) => {
        onBookingDetailsChange('attendees', count);
    };

    const isAllAgreed =
        Object.values(agreements).every(Boolean) &&
        (customRulesAgreements.length === 0 || customRulesAgreements.every(Boolean));

    // Helper functions for time validation
    const isSelectedDateToday = (dateString: string) => {
        try {
            if (dateString === 'Select date') return false;
            const parsedDate = parse(dateString, 'MMM dd, yyyy', new Date());
            return isToday(parsedDate);
        } catch (error) {
            console.error('Error checking if date is today:', error);
            return false;
        }
    };

    const timeToMinutes = (time: string): number => {
        try {
            const [timePart, period] = time.split(' ');
            if (!timePart || !period) return 0;
            const [hours, minutes] = timePart.split(':');
            if (!hours || !minutes) return 0;
            let hour24 = parseInt(hours);
            const min24 = parseInt(minutes);
            if (isNaN(hour24) || isNaN(min24)) return 0;
            if (period === 'PM' && hour24 !== 12) hour24 += 12;
            if (period === 'AM' && hour24 === 12) hour24 = 0;
            return hour24 * 60 + min24;
        } catch (error) {
            console.error('Error parsing time:', time, error);
            return 0;
        }
    };

    const getCurrentTimeInMinutes = (): number => {
        const now = new Date();
        return now.getHours() * 60 + now.getMinutes();
    };

    // FIXED: Calculate booking minutes and hours like BookingForm
    const calculateBookingTime = () => {
        if (
            bookingDetails.date !== 'Select date' &&
            bookingDetails.timeStart !== 'Start time' &&
            bookingDetails.timeStart !== 'Start Time' &&
            bookingDetails.timeEnd !== 'End time' &&
            bookingDetails.timeEnd !== 'End Time'
        ) {
            const startTime = new Date(`${bookingDetails.date} ${bookingDetails.timeStart}`);
            let endTime = new Date(`${bookingDetails.date} ${bookingDetails.timeEnd}`);

            // Handle overnight bookings
            if (endTime <= startTime) {
                endTime = new Date(endTime.getTime() + 24 * 60 * 60 * 1000);
            }

            const minutes = Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60));

            if (isNaN(minutes) || minutes <= 0) {
                return { bookingMinutes: 60, bookingHours: 1 };
            }

            const hours = minutes / 60;
            return { bookingMinutes: minutes, bookingHours: hours };
        }

        return { bookingMinutes: 60, bookingHours: 1 };
    };

    const { bookingMinutes, bookingHours } = calculateBookingTime();

    // Validation functions
    const isDateValid = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day
        return date >= today;
    };

    const isTimeRangeValid = () => {
        if (
            bookingDetails.date === 'Select date' ||
            bookingDetails.timeStart === 'Start time' ||
            bookingDetails.timeStart === 'Start Time' ||
            bookingDetails.timeEnd === 'End time' ||
            bookingDetails.timeEnd === 'End Time'
        ) {
            return false;
        }

        // If date is today, check if time is in the past
        if (isSelectedDateToday(bookingDetails.date)) {
            const currentMinutes = getCurrentTimeInMinutes();
            const startMinutes = timeToMinutes(bookingDetails.timeStart);
            const endMinutes = timeToMinutes(bookingDetails.timeEnd);

            // Check if start time is in the past or current hour (must be at least 1 hour in the future)
            // Add 60 minutes buffer to ensure booking is at least 1 hour from now
            if (startMinutes <= currentMinutes + 60) {
                return false;
            }

            // Handle overnight bookings
            if (endMinutes <= startMinutes) {
                const adjustedEndMinutes = endMinutes + 24 * 60;
                return adjustedEndMinutes > currentMinutes && adjustedEndMinutes > startMinutes;
            }

            return endMinutes > currentMinutes && endMinutes > startMinutes;
        }

        // For future dates, just check if end time is after start time
        const startTime = new Date(`${bookingDetails.date} ${bookingDetails.timeStart}`);
        let endTime = new Date(`${bookingDetails.date} ${bookingDetails.timeEnd}`);

        // Handle overnight bookings (e.g., 11 PM to 7 AM)
        if (endTime <= startTime) {
            endTime = new Date(endTime.getTime() + 24 * 60 * 60 * 1000); // Add 24 hours
        }

        return endTime > startTime;
    };

    const getValidationErrors = () => {
        const errors = [];

        // Check if date is selected
        if (bookingDetails.date === 'Select date') {
            errors.push('Please select a date');
        } else {
            // Check if date is valid
            const selectedDate = new Date(bookingDetails.date);
            if (!isDateValid(selectedDate)) {
                errors.push('Cannot book for previous dates');
            }
        }

        // Check if time is selected
        if (
            bookingDetails.timeStart === 'Start time' ||
            bookingDetails.timeStart === 'Start Time' ||
            bookingDetails.timeEnd === 'End time' ||
            bookingDetails.timeEnd === 'End Time'
        ) {
            errors.push('Please select start and end time');
        } else if (!isTimeRangeValid()) {
            // Check if it's a past time issue
            if (isSelectedDateToday(bookingDetails.date)) {
                const currentMinutes = getCurrentTimeInMinutes();
                const startMinutes = timeToMinutes(bookingDetails.timeStart);
                // Require at least 1 hour in advance
                if (startMinutes <= currentMinutes + 60) {
                    errors.push(
                        'Start time must be at least 1 hour in the future. Please select a future time.',
                    );
                } else {
                    errors.push('End time must be after start time');
                }
            } else {
                errors.push('End time must be after start time');
            }
        }

        // Check if attendees is valid
        if (bookingDetails.attendees <= 0) {
            errors.push('Number of attendees must be at least 1');
        } else if (spaceData?.capacity && bookingDetails.attendees > spaceData.capacity) {
            errors.push(
                `Number of attendees cannot exceed space capacity of ${spaceData.capacity}`,
            );
        }

        // Check minimum booking hours
        if (
            bookingDetails.timeStart !== 'Start time' &&
            bookingDetails.timeStart !== 'Start Time' &&
            bookingDetails.timeEnd !== 'End time' &&
            bookingDetails.timeEnd !== 'End Time'
        ) {
            const minBookingCheck = checkMinimumBookingHours(
                bookingDetails.timeStart,
                bookingDetails.timeEnd,
            );
            if (!minBookingCheck.isValid) {
                errors.push(minBookingCheck.message);
            }
        }

        // Check for PII (email and phone) in message
        const { hasEmail, hasPhone } = containsPII(message);
        if (hasEmail) errors.push('Sharing email addresses in messages is not allowed');
        if (hasPhone) errors.push('Sharing phone numbers in messages is not allowed');

        return errors;
    };

    const validationErrors = getValidationErrors();
    const isFormValid = validationErrors.length === 0;

    const originalBasePrice = parseFloat(spaceData?.SpaceListing?.price_per_hour) || 1000;

    // 1. Base Discount
    let baseDiscountPercentage = parseFloat(
        String((spaceData?.SpaceListing as any)?.discountAmount || '0'),
    );
    if (spaceData?.SpaceListing?.isRefundable === true) {
        baseDiscountPercentage = baseDiscountPercentage + 10;
    }

    // 2. Extra Discount (Tiered)
    const extra_discount_per = (spaceData?.SpaceListing as any)?.extra_discount_per;
    let appliedExtraDiscountPercentage = 0;
    const durationHours = bookingMinutes / 60;

    if (typeof extra_discount_per === 'object' && extra_discount_per !== null) {
        const t12 = parseFloat(String(extra_discount_per.twelve || '0'));
        const t8 = parseFloat(String(extra_discount_per.eight || '0'));
        const t6 = parseFloat(String(extra_discount_per.six || '0'));
        const t4 = parseFloat(String(extra_discount_per.four || '0'));

        if (durationHours >= 12 && t12 > 0) appliedExtraDiscountPercentage = t12;
        else if (durationHours >= 8 && t8 > 0) appliedExtraDiscountPercentage = t8;
        else if (durationHours >= 6 && t6 > 0) appliedExtraDiscountPercentage = t6;
        else if (durationHours >= 4 && t4 > 0) appliedExtraDiscountPercentage = t4;
    }

    const isLongBooking = appliedExtraDiscountPercentage > 0;

    // 3. Base Price & Amount Calculations (Cumulative: Extra discount on top of base discount)
    const basePricePostBaseDiscount =
        baseDiscountPercentage > 0
            ? originalBasePrice * (1 - baseDiscountPercentage / 100)
            : originalBasePrice;

    const basePrice = basePricePostBaseDiscount; // Taxes applying on undiscounted rate
    const pricePerMinute = basePrice / 60;
    const baseAmount = pricePerMinute * bookingMinutes;

    // 5. Fees and Taxes
    const guestPlatformFeePercentage = parseFloat(bookingSettings?.guest_platform_fee || '5') / 100;
    const cgstPercentage = parseFloat(bookingSettings?.cgst || '9') / 100;
    const sgstPercentage = parseFloat(bookingSettings?.sgst || '9') / 100;
    const gstTotalPercentage = cgstPercentage + sgstPercentage;

    // Calculate fees and taxes ON THE BASE AMOUNT (before extra duration discount)
    const guestPlatformFee = baseAmount * guestPlatformFeePercentage;
    const subtotal = baseAmount + guestPlatformFee;
    const cgstAmount = subtotal * cgstPercentage;
    const sgstAmount = subtotal * sgstPercentage;
    const grossAmountBeforeExtra = subtotal + cgstAmount + sgstAmount;

    // Extra discount applied strictly to the base rate
    const extraDiscountAmount = appliedExtraDiscountPercentage > 0 ? baseAmount * (appliedExtraDiscountPercentage / 100) : 0;

    const totalAmount = grossAmountBeforeExtra - extraDiscountAmount;

    // 6. Savings Tracking & UI Display Helpers
    const guestFeeMultiplier = 1 + guestPlatformFeePercentage;
    const taxMultiplier = 1 + gstTotalPercentage;
    const allInMultiplier = guestFeeMultiplier * taxMultiplier;

    const basePriceWithAll = totalAmount / (bookingMinutes / 60);
    const orig = originalBasePrice * allInMultiplier;

    const discountSavings = (originalBasePrice * (bookingMinutes / 60) * allInMultiplier) - totalAmount;
    const totalDiscountPercentage = originalBasePrice > 0 ? (discountSavings / orig) * 100 : 0;
    const hasDiscount = totalDiscountPercentage > 0;

    const origAllInTotal = (originalBasePrice / 60) * bookingMinutes * allInMultiplier;

    const baseAmountWithAll = totalAmount; // Legacy name used in UI

    // Helper function to format hours like BookingForm
    const formatHours = (hours: number) => {
        return hours % 1 === 0 ? hours.toString() : hours.toFixed(1);
    };

    // Pre-compute GST display items to avoid function calls in JSX
    const gstItems = formatGSTForDisplay(spaceData?.City?.state, cgstAmount, sgstAmount);

    // Real-time validation when booking details change (only for date changes or when time becomes invalid)
    useEffect(() => {
        // Only validate if all required fields are filled and time is not in picker state
        if (
            bookingDetails.date !== 'Select date' &&
            bookingDetails.timeStart !== 'Start time' &&
            bookingDetails.timeStart !== 'Start Time' &&
            bookingDetails.timeEnd !== 'End time' &&
            bookingDetails.timeEnd !== 'End Time'
        ) {
            // Check if date is today and time is in the past
            if (isSelectedDateToday(bookingDetails.date)) {
                const currentMinutes = getCurrentTimeInMinutes();
                const startMinutes = timeToMinutes(bookingDetails.timeStart);
                const endMinutes = timeToMinutes(bookingDetails.timeEnd);

                // Only validate if time is actually invalid (not just changed)
                // Require at least 1 hour in advance for start time
                if (startMinutes > 0 && startMinutes <= currentMinutes + 60) {
                    toast.dismiss();
                    toast.error(
                        'Start time must be at least 1 hour in the future. The time has been reset. Please select a future time.',
                    );
                    // Reset time fields
                    resetTimePicker();
                    return;
                }

                // Check if end time is valid
                if (endMinutes > 0) {
                    let endMinutesValid = endMinutes;
                    if (endMinutes <= startMinutes) {
                        endMinutesValid = endMinutes + 24 * 60; // Overnight booking
                    }

                    if (endMinutesValid <= currentMinutes + 60) {
                        toast.dismiss();
                        toast.error(
                            'End time must be at least 1 hour in the future. The time has been reset. Please select a future time.',
                        );
                        // Reset time fields
                        resetTimePicker();
                        return;
                    }
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bookingDetails.date, bookingDetails.timeStart, bookingDetails.timeEnd]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('.dropdown-container')) {
                setDropdownStates({
                    date: false,
                    time: false,
                    attendees: false,
                });
            }
        };

        if (dropdownStates.date || dropdownStates.time || dropdownStates.attendees) {
            document.addEventListener('click', handleClickOutside, true);
            return () => document.removeEventListener('click', handleClickOutside, true);
        }
    }, [dropdownStates]);

    return (
        <div className="min-h-screen bg-white">
            {/* Sticky Timer Top Bar */}
            <div className="sticky top-0 z-[60] bg-red-50 border-b border-red-100 px-4 py-3 md:py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="bg-red-100 p-1.5 md:p-2 rounded-full">
                            <Timer className="w-4 h-4 md:w-5 md:h-5 text-red-600 animate-pulse" />
                        </div>
                        <p className="text-xs md:text-sm font-medium text-red-900 leading-tight">
                            <span className="hidden sm:inline">Please </span>
                            Complete your booking within 10 minutes to secure this space and rate.
                        </p>
                    </div>
                    <BookingTimer
                        spaceId={spaceData?.id || 0}
                        onExpiry={() => {
                            if (spaceData?.slug) {
                                router.push(`/space-details/${spaceData.slug}`);
                            } else {
                                console.warn('Space slug is missing, cannot navigate on expiry');
                            }
                        }}
                    />
                </div>
            </div>

            {/* Desktop Header */}
            <div className="bg-white px-6 py-4 hidden md:block border-b border-gray-100">
                {/* Header content remains the same */}
            </div>

            <div className="flex flex-col lg:flex-row max-w-7xl mx-auto">
                {/* Left Panel - Booking Review */}
                <div className="flex-1 p-4 md:p-8 border border-gray-200 rounded-2xl lg:mr-12">
                    <div className="max-w-2xl">
                        <div className="flex justify-between items-center mb-6 md:mb-8">
                            <p className="text-2xl md:text-4xl font-semibold text-gray-900">
                                Booking Review
                            </p>
                        </div>

                        {!isKycVerified && (
                            <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-red-800 text-sm">Account Verification Required</h3>
                                    <p className="text-red-700 text-xs mt-1 leading-relaxed">
                                        You are currently booking without KYC verification. Please verify your KYC details within 6 hours of booking to prevent automatic cancellation. You can do this from your Account Verification page.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Message to Host */}
                        <div className="mb-6 md:mb-8">
                            <h2 className="text-sm md:text-base font-semibold text-[#333] mb-3 md:mb-4">
                                Message to Host
                            </h2>
                            <MessageToHostSection
                                message={message}
                                onMessageChange={onMessageChange}
                            />
                        </div>

                        {/* Space Policies & Agreements */}
                        <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
                            <p className="text-lg md:text-2xl font-semibold text-gray-900">
                                Space Policies & Agreements
                            </p>
                            <h2 className="text-xs md:text-sm font-semibold text-gray-900">
                                Keep conversations on Spare Space
                            </h2>

                            {/* Keep conversations on Spare Space */}
                            <div className="flex items-start gap-2 md:gap-3">
                                <Checkbox
                                    id="keepConversations"
                                    checked={agreements.keepConversations}
                                    onCheckedChange={(checked) =>
                                        handleAgreementChange('keepConversations', checked)
                                    }
                                    className={`mt-1 cursor-pointer data-[state=checked]:bg-[#F6CD28] data-[state=checked]:border-[#F6CD28] ${!agreements.keepConversations ? 'border-red-500' : ''
                                        }`}
                                />
                                <label
                                    htmlFor="keepConversations"
                                    className="text-xs md:text-sm text-gray-700 leading-relaxed cursor-pointer font-normal"
                                >
                                    I agree to communicate with the host only through the Spare
                                    Space platform so that all details, commitments, and
                                    clarifications remain documented and easily accessible to both
                                    parties.
                                </label>
                            </div>

                            {/* Use Spare Space to process payments */}
                            <h2 className="text-xs md:text-sm font-semibold text-gray-900">
                                Use Spare Space to process payments
                            </h2>
                            <div className="flex items-start gap-2 md:gap-3">
                                <Checkbox
                                    id="processPayments"
                                    checked={agreements.processPayments}
                                    onCheckedChange={(checked) =>
                                        handleAgreementChange('processPayments', checked)
                                    }
                                    className={`mt-1 cursor-pointer data-[state=checked]:bg-[#F6CD28] data-[state=checked]:border-[#F6CD28] ${!agreements.processPayments ? 'border-red-500' : ''
                                        }`}
                                />
                                <label
                                    htmlFor="processPayments"
                                    className="text-xs md:text-sm text-gray-700 leading-relaxed cursor-pointer font-normal"
                                >
                                    I understand that all booking payments must be completed
                                    securely through the Spare Space platform, which helps ensure
                                    protection, transparency, and verified transactions.
                                </label>
                            </div>

                            {/* Follow booking, cancellation, and overtime policies */}
                            <h2 className="text-xs md:text-sm font-semibold text-gray-900">
                                Follow booking, cancellation, and overtime policies
                            </h2>
                            <div className="flex items-start gap-2 md:gap-3">
                                <Checkbox
                                    id="understandContracts"
                                    checked={agreements.understandContracts}
                                    onCheckedChange={(checked) =>
                                        handleAgreementChange('understandContracts', checked)
                                    }
                                    className={`mt-1 cursor-pointer data-[state=checked]:bg-[#F6CD28] data-[state=checked]:border-[#F6CD28] ${!agreements.understandContracts ? 'border-red-500' : ''
                                        }`}
                                />
                                <label
                                    htmlFor="understandContracts"
                                    className="text-xs md:text-sm text-gray-700 leading-relaxed cursor-pointer font-normal"
                                >
                                    I agree to follow the Spare Space{' '}
                                    <a
                                        href="/terms"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#F6CD28] hover:underline font-medium"
                                    >
                                        Terms of Use
                                    </a>
                                    ,{' '}
                                    <a
                                        href="/cancellation-policy"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#F6CD28] hover:underline font-medium"
                                    >
                                        Cancellation Policy
                                    </a>
                                    , and{' '}
                                    <a
                                        href="/privacy"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#F6CD28] hover:underline font-medium"
                                    >
                                        Privacy Policy
                                    </a>{' '}
                                    and understand that these policies ensure fairness and
                                    consistency for both guests and hosts.
                                </label>
                            </div>

                            {/* No separate or conflicting side agreements */}
                            <h2 className="text-xs md:text-sm font-semibold text-gray-900">
                                No separate or conflicting side agreements
                            </h2>
                            <div className="flex items-start gap-2 md:gap-3">
                                <Checkbox
                                    id="meetRegulations"
                                    checked={agreements.meetRegulations}
                                    onCheckedChange={(checked) =>
                                        handleAgreementChange('meetRegulations', checked)
                                    }
                                    className={`mt-1 cursor-pointer data-[state=checked]:bg-[#F6CD28] data-[state=checked]:border-[#F6CD28] ${!agreements.meetRegulations ? 'border-red-500' : ''
                                        }`}
                                />
                                <label
                                    htmlFor="meetRegulations"
                                    className="text-xs md:text-sm text-gray-700 leading-relaxed cursor-pointer font-normal"
                                >
                                    I understand that any external agreements or arrangements that
                                    conflict with Spare Space policies are not permitted, and all
                                    confirmed terms must remain within the platform.
                                </label>
                            </div>

                            {/* Custom Rules */}
                            {bookingDetails?.customRules &&
                                bookingDetails.customRules.length > 0 && (
                                    <>
                                        <h2 className="text-xs md:text-sm font-semibold text-gray-900">
                                            More
                                        </h2>
                                        {bookingDetails.customRules.map((rule, index) => (
                                            <div
                                                key={index}
                                                className="flex items-start gap-2 md:gap-3"
                                            >
                                                <Checkbox
                                                    id={`customRule-${index}`}
                                                    checked={customRulesAgreements[index] || false}
                                                    onCheckedChange={(checked) =>
                                                        handleCustomRuleAgreementChange(
                                                            index,
                                                            checked,
                                                        )
                                                    }
                                                    className={`mt-1 cursor-pointer data-[state=checked]:bg-[#F6CD28] data-[state=checked]:border-[#F6CD28] ${!customRulesAgreements[index]
                                                        ? 'border-red-500'
                                                        : ''
                                                        }`}
                                                />
                                                <label
                                                    htmlFor={`customRule-${index}`}
                                                    className="text-xs md:text-sm text-gray-700 leading-relaxed cursor-pointer font-normal"
                                                >
                                                    {rule}
                                                </label>
                                            </div>
                                        ))}
                                    </>
                                )}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Your Space Booking */}
                <div className="w-full lg:w-96 bg-white border border-gray-200 rounded-2xl shadow-lg p-4 md:p-8 lg:ml-12 mt-6 lg:mt-0">
                    {/* Space Details Card */}
                    <div className="flex gap-3 md:gap-4 mb-6 md:mb-8">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                                src={spaceData?.SpaceImages?.[0]?.image_url || '/placeholder.jpg'}
                                alt="Space"
                                width={96}
                                height={96}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-xs md:text-sm">
                                {spaceData?.SpaceType?.type || 'Space'}
                            </h3>
                            <p className="text-base md:text-lg font-bold text-gray-900">
                                {spaceData?.title || 'Space Title'}
                            </p>
                            <p className="text-xs md:text-sm text-gray-600">
                                {spaceData?.City?.city || 'City'},{' '}
                                {spaceData?.City?.state || 'State'}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-[#F6CD28] text-xs md:text-sm">★</span>
                                 <span className="text-xs md:text-sm text-gray-600">
                                    {parseFloat(spaceData?.avg_rating || '0').toFixed(2)}
                                    {(spaceData?.reviewCount || spaceData?.Reviews?.length || 0) > 0 && ` (${spaceData?.reviewCount || spaceData?.Reviews?.length})`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Your Space Booking */}
                    <div className="mb-6 md:mb-8">
                        <h2 className="text-lg md:text-2xl font-semibold text-[#333] mb-4 md:mb-6">
                            Your <span className="text-[#F7CD29]">Space</span> Booking
                        </h2>

                        {/* Booking Information */}
                        <div className="space-y-0 relative dropdown-container">
                            {/* Date Row */}
                            <div className="relative">
                                <div className="flex items-center justify-between py-3 md:py-4 border-b border-gray-200">
                                    <div>
                                        <p className="text-xs md:text-sm text-gray-500">Date</p>
                                        <p className="font-semibold text-gray-900 text-sm md:text-base">
                                            {bookingDetails.date}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="p-1 hover:bg-gray-100"
                                        onClick={() => handleToggleDropdown('date')}
                                    >
                                        <SquarePen className="h-4 w-4 md:h-5 md:w-5 text-gray-300" />
                                    </Button>
                                </div>
                                {/* Date Picker Dropdown */}
                                {dropdownStates.date && (
                                    <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg p-4">
                                        {isCalendarLoading ? (
                                            <div className="flex justify-center items-center h-64">
                                                <div className="text-sm text-gray-500">
                                                    Loading calendar...
                                                </div>
                                            </div>
                                        ) : (
                                            <Calendar
                                                mode="single"
                                                selected={
                                                    bookingDetails.date !== 'Select date'
                                                        ? new Date(bookingDetails.date)
                                                        : undefined
                                                }
                                                onSelect={(date) => {
                                                    if (date) {
                                                        handleDateSelect(date);
                                                    }
                                                }}
                                                disabled={(date) => {
                                                    const today = new Date();
                                                    today.setHours(0, 0, 0, 0);

                                                    // Disable past dates
                                                    if (date < today) return true;

                                                    // Disable non-operating days
                                                    const dayName = date.toLocaleDateString(
                                                        'en-US',
                                                        { weekday: 'long' },
                                                    );
                                                    return nonOperatingDays.includes(dayName);
                                                }}
                                                initialFocus
                                                className="rounded-md"
                                            />
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Time Row */}
                            <div className="relative">
                                <div
                                    className={`flex items-center justify-between py-3 md:py-4 border-b border-gray-200 ${!isDateAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div>
                                        <p
                                            className={`text-xs md:text-sm ${!isDateAvailable ? 'text-gray-300' : 'text-gray-500'}`}
                                        >
                                            Time
                                        </p>
                                        <p
                                            className={`font-semibold text-sm md:text-base ${!isDateAvailable ? 'text-gray-400' : 'text-gray-900'}`}
                                        >
                                            {bookingDetails.timeStart} → {bookingDetails.timeEnd}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`p-1 ${!isDateAvailable ? 'cursor-not-allowed' : 'hover:bg-gray-100'}`}
                                        onClick={() => {
                                            if (!isDateAvailable) {
                                                // Show toaster when user tries to click disabled time field
                                                if (dateUnavailabilityReason) {
                                                    toast.error(dateUnavailabilityReason);
                                                }
                                                return;
                                            }
                                            handleToggleDropdown('time');
                                        }}
                                        disabled={!isDateAvailable}
                                    >
                                        <SquarePen
                                            className={`h-4 w-4 md:h-5 md:w-5 ${!isDateAvailable ? 'text-gray-200' : 'text-gray-300'}`}
                                        />
                                    </Button>
                                </div>
                                {/* Time Picker Dropdown */}
                                {dropdownStates.time && isDateAvailable && (
                                    <TimePickerDropdown
                                        isOpen={dropdownStates.time}
                                        timeData={timeData}
                                        onTimeChange={handleTimeChange}
                                        onApply={handleTimeApply}
                                        onClose={() => handleToggleDropdown('time')}
                                        isDateAvailable={isDateAvailable}
                                        isLoading={isTimeSlotsLoading}
                                        unavailabilityReason={dateUnavailabilityReason}
                                        operatingHours={operatingHours}
                                        isTimeWithinOperatingHours={isCurrentTimeValid}
                                        timeSlotsData={timeSlotsData}
                                        isApplyDisabled={
                                            isApplyDisabled ||
                                            isTimeSlotsLoading ||
                                            isTimeValidationLoading
                                        }
                                        minBookingHours={
                                            spaceData?.SpaceListing?.min_booking_hours || ''
                                        }
                                    />
                                )}
                            </div>

                            {/* Attendees Row */}
                            <div className="relative">
                                <div
                                    className={`flex items-center justify-between py-3 md:py-4 ${!isDateAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div>
                                        <p
                                            className={`text-xs md:text-sm ${!isDateAvailable ? 'text-gray-300' : 'text-gray-500'}`}
                                        >
                                            Attendees
                                        </p>
                                        <p
                                            className={`font-semibold text-sm md:text-base ${!isDateAvailable ? 'text-gray-400' : 'text-gray-900'}`}
                                        >
                                            {bookingDetails.attendees} Attendees
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`p-1 ${!isDateAvailable ? 'cursor-not-allowed' : 'hover:bg-gray-100'}`}
                                        onClick={() => {
                                            if (!isDateAvailable) {
                                                // Show toaster when user tries to click disabled attendees field
                                                if (dateUnavailabilityReason) {
                                                    toast.error(dateUnavailabilityReason);
                                                }
                                                return;
                                            }
                                            handleToggleDropdown('attendees');
                                        }}
                                    >
                                        <SquarePen
                                            className={`h-4 w-4 md:h-5 md:w-5 ${!isDateAvailable ? 'text-gray-200' : 'text-gray-300'}`}
                                        />
                                    </Button>
                                </div>
                                {/* Attendees Dropdown */}
                                {dropdownStates.attendees && isDateAvailable && (
                                    <AttendeesDropdown
                                        isOpen={dropdownStates.attendees}
                                        attendees={bookingDetails.attendees}
                                        onAttendeesChange={handleAttendeesChange}
                                        onClose={() => handleToggleDropdown('attendees')}
                                        spaceCapacity={spaceData?.capacity}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Price Detail - FIXED: Now uses minute-based calculation like BookingForm */}
                    <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                            Price detail
                        </h3>
                        <div className="space-y-2 md:space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600 text-xs md:text-sm">
                                            ₹{formatCurrency(basePriceWithAll)} x{' '}
                                            {formatHours(bookingHours)}{' '}
                                            {bookingHours === 1 ? 'Hour' : 'Hours'}
                                        </span>
                                        {(baseDiscountPercentage > 0 ||
                                            appliedExtraDiscountPercentage > 0) && (
                                                <span className="text-gray-400 line-through text-[10px]">
                                                    ₹{formatCurrency(orig)}/hr
                                                </span>
                                            )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium cursor-pointer hover:text-gray-600 w-fit">
                                                    <Info className="w-3 h-3" />
                                                    <span className="underline font-bold">
                                                        incl. of all taxes
                                                    </span>
                                                </div>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                align="start"
                                                className="w-80 p-0 overflow-hidden rounded-2xl border-none shadow-2xl"
                                            >
                                                <div className="flex flex-col">
                                                    {/* Header */}
                                                    <div className="px-5 py-4 border-b border-gray-100">
                                                        <h3 className="text-base font-bold text-gray-900">
                                                            Price breakdown
                                                        </h3>
                                                    </div>

                                                    {/* Charges */}
                                                    <div className="px-5 py-4 space-y-3">
                                                        <div>
                                                            <p className="text-[10px] font-bold text-gray-400 tracking-wider mb-2">
                                                                CHARGES
                                                            </p>
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="text-sm text-gray-600 font-medium">
                                                                    Base amount
                                                                </span>
                                                                <span className="text-sm text-gray-900 font-bold">
                                                                    ₹{formatCurrency(baseAmount)}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-gray-600 font-medium">
                                                                    Platform fee
                                                                </span>
                                                                <span className="text-sm text-gray-900 font-bold">
                                                                    ₹{formatCurrency(guestPlatformFee)}
                                                                </span>
                                                            </div>
                                                            {isLongBooking && extraDiscountAmount > 0 && (
                                                                <div className="flex justify-between items-center mt-2">
                                                                    <span className="text-sm text-green-600 font-medium whitespace-nowrap">
                                                                        Duration discount ({appliedExtraDiscountPercentage}%)
                                                                    </span>
                                                                    <span className="text-sm text-green-700 font-bold">
                                                                        -₹{formatCurrency(extraDiscountAmount)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="pt-3 border-t border-gray-100">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="text-sm text-gray-900 font-bold">
                                                                    Taxes
                                                                </span>
                                                                <span className="text-sm text-gray-900 font-bold">
                                                                    ₹
                                                                    {formatCurrency(
                                                                        cgstAmount + sgstAmount,
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="space-y-1 pl-4">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-[12px] text-gray-500">
                                                                        CGST (
                                                                        {(
                                                                            cgstPercentage * 100
                                                                        ).toFixed(0)}
                                                                        %)
                                                                    </span>
                                                                    <span className="text-[12px] text-gray-700 font-medium">
                                                                        ₹
                                                                        {formatCurrency(cgstAmount)}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-[12px] text-gray-500">
                                                                        SGST (
                                                                        {(
                                                                            sgstPercentage * 100
                                                                        ).toFixed(0)}
                                                                        %)
                                                                    </span>
                                                                    <span className="text-[12px] text-gray-700 font-medium">
                                                                        ₹
                                                                        {formatCurrency(sgstAmount)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Total Section */}
                                                    <div className="px-5 py-4 border-t border-gray-100">
                                                        {hasDiscount && (
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="text-xs text-gray-400">
                                                                    Original price
                                                                </span>
                                                                <span className="text-xs text-gray-400 line-through">
                                                                    ₹
                                                                    {formatCurrency(origAllInTotal)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-base font-bold text-gray-900">
                                                                Total
                                                            </span>
                                                            <span className="text-base font-bold text-gray-900">
                                                                ₹{formatCurrency(totalAmount)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Savings Alert Box */}
                                                    {hasDiscount && (
                                                        <div className="m-4 mt-0 bg-[#E8F3E8] rounded-xl p-3 flex justify-between items-center">
                                                            <div className="flex flex-col pr-2">
                                                                <p className="text-[#3E7B3E] font-bold text-[13px]">
                                                                    You're saving ₹
                                                                    {formatCurrency(
                                                                        discountSavings,
                                                                    )}
                                                                </p>
                                                                <p className="text-[#3E7B3E] text-[10px] opacity-80 leading-tight">
                                                                    {baseDiscountPercentage > 0
                                                                        ? `${baseDiscountPercentage}% space discount applied`
                                                                        : ''}
                                                                    {baseDiscountPercentage > 0 &&
                                                                        isLongBooking
                                                                        ? ' & '
                                                                        : ''}
                                                                    {isLongBooking
                                                                        ? `${appliedExtraDiscountPercentage}% hourly discount applied`
                                                                        : ''}
                                                                </p>
                                                            </div>
                                                            {/* <span className="text-[#3E7B3E] font-bold text-xs whitespace-nowrap">
                                                                {totalDiscountPercentage.toFixed(0)}
                                                                % OFF
                                                            </span> */}
                                                        </div>
                                                    )}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                                <span className="text-gray-900 font-semibold text-xs md:text-sm">
                                    ₹{formatCurrency(baseAmountWithAll)}
                                </span>
                            </div>
                            <div className="border-t border-gray-200 pt-2 md:pt-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-900 font-bold text-sm md:text-base">
                                        Final Amount
                                    </span>
                                    <span className="text-gray-900 font-bold text-sm md:text-base">
                                        ₹{formatCurrency(totalAmount)}
                                    </span>
                                </div>
                            </div>

                            {isLongBooking && extraDiscountAmount > 0 && (
                                <div className="mt-2 bg-green-50 border border-green-100 rounded-xl p-3 flex items-center justify-start gap-2 text-green-700">
                                    <span className="text-base font-bold">
                                        You saved ₹{formatCurrency(discountSavings)} 🥳
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Book Now Button */}
                    <div className="space-y-2 md:space-y-3">
                        {!isKycVerified && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                <p className="text-red-800 text-xs leading-normal font-medium">
                                    Please verify your KYC within 6 hours of booking to prevent automatic cancellation.
                                </p>
                            </div>
                        )}
                        <Button
                            onClick={() => {
                                // Re-validate before proceeding
                                const errors = getValidationErrors();
                                if (errors.length > 0) {
                                    errors.forEach((error) => {
                                        toast.error(error);
                                    });
                                    return;
                                }

                                // Additional check: if date is today, verify time is at least 1 hour in future
                                if (isSelectedDateToday(bookingDetails.date)) {
                                    const currentMinutes = getCurrentTimeInMinutes();
                                    const startMinutes = timeToMinutes(bookingDetails.timeStart);

                                    if (startMinutes <= currentMinutes + 60) {
                                        toast.error(
                                            'Start time must be at least 1 hour in the future. Please select a future time.',
                                        );
                                        return;
                                    }
                                }

                                // Check for PII (email and phone) in message
                                const { hasEmail, hasPhone } = containsPII(message);
                                if (hasEmail) {
                                    toast.error(
                                        'Sharing email addresses in messages is not allowed',
                                    );
                                    return;
                                }
                                if (hasPhone) {
                                    toast.error('Sharing phone numbers in messages is not allowed');
                                    return;
                                }

                                if (isInstantBooking && onInstantBookingPayment) {
                                    onInstantBookingPayment();
                                } else if (!isInstantBooking && onRequestToBook) {
                                    onRequestToBook();
                                }
                            }}
                            disabled={!isAllAgreed || isLoading || !isFormValid}
                            className="w-full bg-[#F7CD29] hover:bg-[#F7CD29] text-[#333] font-semibold py-2 px-4 md:py-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
                        >
                            {isLoading
                                ? isInstantBooking
                                    ? 'Processing Payment...'
                                    : 'Submitting...'
                                : isInstantBooking
                                    ? 'Pay Now'
                                    : 'Request to Book'}
                        </Button>
                        <p className="text-xs text-gray-500 text-center">
                            Agreeing to the policies and terms is mandatory to continue.
                        </p>
                    </div>

                    {/* Cancellation Policy */}
                    {(bookingDetails?.cancellationPolicy ||
                        spaceData?.SpaceListing?.cancellationPolicy) && (
                            <div className="mt-8 pt-6 border-t border-gray-100 bg-red-100 p-5 rounded-xl">
                                <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-3">
                                    Cancellation Policy
                                </h3>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-900 capitalize">
                                        {bookingDetails?.cancellationPolicy?.key ||
                                            spaceData?.SpaceListing?.cancellationPolicy?.key}
                                    </p>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        {bookingDetails?.cancellationPolicy?.message ||
                                            spaceData?.SpaceListing?.cancellationPolicy?.message}
                                    </p>
                                </div>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
};

export default BookingReview;
