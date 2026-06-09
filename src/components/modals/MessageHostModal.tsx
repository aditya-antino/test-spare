'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, SquarePen, Plus, Minus, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { handleApiError } from '@/hooks/handleApiError';
import { sendMessageToHost } from '@/services/chatApi';
import { useGetGuestBookingCalendar, useGetGuestTimeSlots } from '@/services';
import Instant from '../icons/Instant';
import { PATHS } from '@/constants/path';
import { checkRestrictedContent } from '@/utils/validators';
import login from '@/assets/Login.png';

// Types
interface PriceBreakdownItem {
    label: string;
    amount: string;
}

interface BookingDetails {
    date: string;
    timeStart: string;
    timeEnd: string;
    attendees: number;
}

interface TimeData {
    fromHours: string;
    fromMinutes: string;
    fromPeriod: string;
    toHours: string;
    toMinutes: string;
    toPeriod: string;
}

interface MessageHostModalProps {
    isOpen: boolean;
    onClose: () => void;
    spaceData?: any;
    bookingDetails?: {
        date: string;
        timeStart: string;
        timeEnd: string;
        attendees: number;
    };
    bookingSettings?: {
        percentage?: string;
        gst?: string;
        processing_fee?: string;
        guest_platform_fee?: string;
        cgst?: string;
        sgst?: string;
    };
    onBookingDetailsChange?: (field: string, value: any) => void;
}

const PHONE_NUMBER_REGEX =
    /(\+?\d{1,4}[\s.-]?)?(\(?\d{3,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4,6}|(\d[\s.-]?){10,15}/g;

// Header Component with Instant Booking and Price/Rating
const BookingHeader = ({ spaceData }: { spaceData?: any }) => {
    const basePrice = parseFloat(spaceData?.SpaceListing?.price_per_hour) || 500;
    let calculatedDiscountAmount = parseFloat(
        String((spaceData?.SpaceListing as any)?.discountAmount || '0'),
    );

    if (spaceData?.SpaceListing?.isRefundable === true) {
        calculatedDiscountAmount = calculatedDiscountAmount + 10;
    }

    const hasDiscount = calculatedDiscountAmount > 0;
    const discountPercentage = calculatedDiscountAmount / 100; // Convert percentage to decimal
    const discountedPrice = hasDiscount
        ? Math.round(basePrice * (1 - discountPercentage))
        : basePrice;

    return (
        <div className="flex flex-col gap-4">
            {/* Instant Booking Checkbox */}
            {spaceData?.SpaceListing?.instant_booking && (
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 flex items-center justify-center">
                            <Instant />
                        </div>
                        <label className="text-gray-800 font-semibold text-base leading-tight">
                            Instant Booking Available
                        </label>
                    </div>
                </div>
            )}
            {/* Price and Rating */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    {/* Current/Discounted Price */}
                    <span className="text-gray-800 font-bold text-lg font-poppins">
                        ₹{discountedPrice}
                    </span>
                    <span className="text-gray-500 font-medium text-base font-poppins">/hour</span>

                    {/* Original Price with Strikethrough (if discount exists) */}
                    {hasDiscount && (
                        <span className="text-red-500 text-base font-poppins">
                            <span className="line-through">₹{basePrice}</span>
                            <span className="ml-1">/hour</span>
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-5 h-5">
                        <Image
                            src="/icons/star-icon.svg"
                            alt="Star rating"
                            width={20}
                            height={20}
                            className="text-[#F6CD28]"
                        />
                    </div>
                    <span className="text-gray-500 font-normal text-sm font-poppins">
                        {parseFloat(spaceData?.avg_rating ?? '0').toFixed(1)} (
                        {spaceData?.reviewCount ?? 0} reviews)
                    </span>
                </div>
            </div>
        </div>
    );
};

// Date Picker Dropdown Component
const DatePickerDropdown = ({
    isOpen,
    currentDate,
    onDateSelect,
    onClose,
    spaceId,
}: {
    isOpen: boolean;
    currentDate: string;
    onDateSelect: (date: Date) => void;
    onClose: () => void;
    spaceId: number;
}) => {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        currentDate !== 'Select date' ? new Date(currentDate) : undefined,
    );

    // Fetch non-operating days when calendar opens
    const { data: calendarData, isLoading: isCalendarLoading } = useGetGuestBookingCalendar(
        spaceId,
        { enabled: isOpen && !!spaceId } as any,
    );

    const nonOperatingDays = calendarData?.data || [];

    if (!isOpen) return null;

    return (
        <div
            className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg p-4"
            onClick={(e) => e.stopPropagation()}
        >
            {isCalendarLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="text-sm text-gray-500">Loading calendar...</div>
                </div>
            ) : (
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                        if (date) {
                            setSelectedDate(date);
                            onDateSelect(date);
                            onClose();
                        }
                    }}
                    disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        // Disable past dates
                        if (date < today) return true;

                        // Disable non-operating days
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                        return nonOperatingDays.includes(dayName);
                    }}
                    initialFocus
                    className="rounded-md"
                />
            )}
        </div>
    );
};

// Time Selector Component
const TimeSelector = ({
    timeType,
    label,
    timeData,
    onTimeChange,
}: {
    timeType: 'from' | 'to';
    label: string;
    timeData: TimeData;
    onTimeChange: (type: 'from' | 'to', field: string, value: string) => void;
}) => {
    const [localHours, setLocalHours] = useState(timeData[`${timeType}Hours`]);
    const [localMinutes, setLocalMinutes] = useState(timeData[`${timeType}Minutes`]);

    // Sync local state with parent state when it changes
    useEffect(() => {
        setLocalHours(timeData[`${timeType}Hours`]);
        setLocalMinutes(timeData[`${timeType}Minutes`]);
    }, [timeData, timeType]);

    // Format & validate numbers
    const formatHours = (val: string) => {
        let num = parseInt(val || '1', 10);
        if (isNaN(num) || num < 1) num = 1;
        if (num > 12) num = 12;
        return String(num).padStart(2, '0');
    };

    const formatMinutes = (val: string) => {
        let num = parseInt(val || '0', 10);
        if (isNaN(num) || num < 0) num = 0;
        if (num > 59) num = 59;
        return String(num).padStart(2, '0');
    };

    const handleBlur = () => {
        const h = formatHours(localHours);
        const m = formatMinutes(localMinutes);

        setLocalHours(h);
        setLocalMinutes(m);

        onTimeChange(timeType, 'hours', h);
        onTimeChange(timeType, 'minutes', m);
    };

    const handlePeriodClick = (period: string, event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        onTimeChange(timeType, 'period', period);
    };

    const getInputClassName = () =>
        'w-14 h-10 text-center text-sm font-medium border rounded-md focus:ring-2 focus:ring-[#F6CD28] focus:border-[#F6CD28] transition-colors duration-200 border-gray-300';

    return (
        <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">{label}</Label>
            <div className="flex sm:items-center gap-1.5">
                {/* Hours */}
                <Input
                    containerClassName="w-fit"
                    className={getInputClassName()}
                    value={localHours}
                    onChange={(e) =>
                        setLocalHours(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))
                    }
                    onBlur={handleBlur}
                    placeholder="01"
                    inputMode="numeric"
                />
                <span className="font-bold text-gray-600">:</span>
                {/* Minutes */}
                <Input
                    containerClassName="w-fit"
                    className={getInputClassName()}
                    value={localMinutes}
                    onChange={(e) =>
                        setLocalMinutes(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))
                    }
                    onBlur={handleBlur}
                    placeholder="00"
                    inputMode="numeric"
                />
                {/* AM/PM Toggle */}
                <div className="flex ml-1">
                    <Button
                        type="button"
                        onClick={(e) => handlePeriodClick('AM', e)}
                        className={`px-3 rounded-none rounded-l-md font-semibold text-sm ${timeData[`${timeType}Period`] === 'AM'
                            ? 'bg-[#F6CD28] text-black'
                            : 'border bg-white'
                            }`}
                    >
                        AM
                    </Button>
                    <Button
                        type="button"
                        onClick={(e) => handlePeriodClick('PM', e)}
                        className={`px-3 rounded-none rounded-r-md font-semibold text-sm ${timeData[`${timeType}Period`] === 'PM'
                            ? 'bg-[#F6CD28] text-black'
                            : 'border bg-white'
                            }`}
                    >
                        PM
                    </Button>
                </div>
            </div>
        </div>
    );
};

// Time Picker Dropdown Component
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
    minBookingHours?: string | number;
}) => {
    if (!isOpen) return null;

    const formatTimeForDisplay = (timeString: string) => {
        const [hours, minutes] = timeString.split(':');
        const hour24 = parseInt(hours);
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        const period = hour24 >= 12 ? 'PM' : 'AM';
        return `${hour12}:${minutes} ${period}`;
    };

    return (
        <div
            className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg p-6"
            onClick={(e) => e.stopPropagation()}
        >
            {isLoading ? (
                <div className="flex justify-center items-center h-32">
                    <div className="text-sm text-gray-500">Loading time slots...</div>
                </div>
            ) : !isDateAvailable ? (
                <div className="flex flex-col items-center justify-center h-32 space-y-2">
                    <div className="text-sm text-red-600 font-medium">Time not available</div>
                    <div className="text-xs text-gray-500 text-center px-4">
                        {unavailabilityReason || 'Please select a different time'}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="inline-flex items-center px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full my-2">
                        <span className="text-sm font-medium text-black">
                            Min. Booking: <span className="font-bold">{minBookingHours}</span> hours
                        </span>
                    </div>
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
                        (timeSlotsData.calendarBlocks?.length > 0 ||
                            timeSlotsData.bookings?.length > 0) && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <div className="text-sm text-red-800 font-medium mb-2">
                                    Unavailable Time Slots:
                                </div>
                                <div className="text-xs text-red-700 space-y-1">
                                    {timeSlotsData.calendarBlocks?.map(
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
                                    {timeSlotsData.bookings?.map((booking: any, index: number) => {
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
                                    })}
                                </div>
                            </div>
                        )}

                    <TimeSelector
                        timeType="from"
                        label="Start Time"
                        timeData={timeData}
                        onTimeChange={onTimeChange}
                    />
                    <TimeSelector
                        timeType="to"
                        label="End Time"
                        timeData={timeData}
                        onTimeChange={onTimeChange}
                    />
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
                        className="bg-[#F6CD28] hover:bg-yellow-500 text-black px-6"
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
                    className={`font-normal text-sm font-poppins ${isDisabled ? 'text-gray-300' : 'text-gray-400'}`}
                >
                    {label}
                </label>
                <div
                    className={`font-semibold text-xs md:text-lg font-figtree ${isDisabled ? 'text-gray-400' : 'text-gray-800'}`}
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

// Time Display Component
const TimeDisplay = ({
    startTime,
    endTime,
    isDisabled = false,
}: {
    startTime: string;
    endTime: string;
    isDisabled?: boolean;
}) => {
    return (
        <div className={`flex items-center gap-2 ${isDisabled ? 'opacity-50' : ''}`}>
            <span
                className={`font-semibold  text-xs md:text-lg font-figtree ${isDisabled ? 'text-gray-400' : 'text-gray-700'}`}
            >
                {startTime}
            </span>
            <Image
                src="/icons/arrow-right-icon.svg"
                alt="Arrow"
                width={24}
                height={24}
                className={isDisabled ? 'text-gray-300' : 'text-gray-400'}
            />
            <span
                className={`font-semibold text-xs md:text-lg font-figtree ${isDisabled ? 'text-gray-400' : 'text-gray-700'}`}
            >
                {endTime}
            </span>
        </div>
    );
};

// Price Breakdown Item Component
const PriceBreakdownItemComponent = ({ label, amount }: PriceBreakdownItem) => {
    return (
        <div className="flex justify-between">
            <span className="text-gray-600 font-medium text-base leading-6 font-figtree">
                {label}
            </span>
            <span className="text-gray-600 font-medium text-base leading-6 font-figtree">
                {amount}
            </span>
        </div>
    );
};

// Price Breakdown Section Component
const PriceBreakdownSection = ({
    items,
    total,
}: {
    items: PriceBreakdownItem[];
    total: string;
}) => {
    return (
        <div className="flex flex-col gap-4">
            {/* Individual Price Items */}
            {items.map((item, index) => (
                <PriceBreakdownItemComponent key={index} label={item.label} amount={item.amount} />
            ))}

            {/* Divider */}
            <div className="h-px bg-gray-200"></div>

            {/* Total */}
            <div className="flex justify-between">
                <span className="text-gray-800 font-semibold text-base leading-6 font-figtree">
                    Total
                </span>
                <span className="text-gray-800 font-semibold text-base leading-6 font-figtree">
                    {total}
                </span>
            </div>
        </div>
    );
};

// Message to Host Component
const MessageToHostSection = ({
    message,
    onMessageChange,
    onEmptyMessageToast,
}: {
    message: string;
    onMessageChange: (value: string) => void;
    onEmptyMessageToast?: () => void;
}) => {
    const [hasAnyNumber, setHasAnyNumber] = useState(false);
    const [characterCount, setCharacterCount] = useState(message.length);

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
        setCharacterCount(value.length);
        onMessageChange(value);
    };

    const handleBlur = () => {
        // Check if message is empty on blur and show toast
        if (message.trim().length === 0 && onEmptyMessageToast) {
            onEmptyMessageToast();
        }
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
                            onBlur={handleBlur}
                            onPaste={handlePaste}
                            onKeyPress={handleKeyPress}
                            placeholder="Message (Numbers and links are not allowed)"
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
                        Character count: {characterCount}/500
                    </p>
                </div>
            </div>
        </div>
    );
};

const MessageHostModal: React.FC<MessageHostModalProps> = ({
    isOpen,
    onClose,
    spaceData,
    bookingDetails = {
        date: 'Select date',
        timeStart: 'HH:MM AM',
        timeEnd: 'HH:MM PM',
        attendees: 0,
    },
    bookingSettings,
    onBookingDetailsChange,
}) => {
    const router = useRouter();
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [localBookingDetails, setLocalBookingDetails] = useState<BookingDetails>({
        date: bookingDetails?.date || 'Select date',
        timeStart: bookingDetails?.timeStart || 'HH:MM AM',
        timeEnd: bookingDetails?.timeEnd || 'HH:MM PM',
        attendees: bookingDetails?.attendees || 0,
    });
    // Dropdown states for editing
    const [dropdownStates, setDropdownStates] = useState({
        date: false,
        time: false,
        attendees: false,
    });

    // Time data state
    const [timeData, setTimeData] = useState<TimeData>({
        fromHours: '00',
        fromMinutes: '00',
        fromPeriod: 'PM',
        toHours: '00',
        toMinutes: '00',
        toPeriod: 'PM',
    });

    // Convert selected date to UTC ISO format for API (avoid timezone issues)
    const selectedDateISO =
        localBookingDetails.date !== 'Select date'
            ? (() => {
                const date = new Date(localBookingDetails.date);
                // Check if the date is valid
                if (isNaN(date.getTime())) {
                    console.error('Invalid date:', localBookingDetails.date);
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

    // Initial date availability check (without time parameters)
    const {
        data: dateAvailabilityData,
        isLoading: isDateAvailabilityLoading,
        error: dateAvailabilityError,
    } = useGetGuestTimeSlots(
        spaceData?.id || 0,
        selectedDateISO || '',
        undefined,
        undefined,
        { enabled: !!selectedDateISO && !!spaceData?.id && !!spaceData } as any,
    );

    // Time validation check (with time parameters) - only when user changes time
    const [shouldValidateTime, setShouldValidateTime] = useState(false);
    const [isApplyDisabled, setIsApplyDisabled] = useState(false);

    const startTime24 = `${timeData.fromHours}:${timeData.fromMinutes} ${timeData.fromPeriod}`;
    const endTime24 = `${timeData.toHours}:${timeData.toMinutes} ${timeData.toPeriod}`;

    // Fetch time slots data when dropdown is open (without time parameters to get all blocked/booked slots)
    const { data: timeSlotsData, isLoading: isTimeSlotsLoading } = useGetGuestTimeSlots(
        spaceData?.id || 0,
        selectedDateISO || '',
        undefined,
        undefined,
        {
            enabled: dropdownStates.time && !!selectedDateISO && !!spaceData?.id && !!spaceData,
        } as any,
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
        {
            enabled: shouldValidateTime && !!selectedDateISO && !!spaceData?.id && !!spaceData,
        } as any,
    );

    // Use date availability data for initial check
    const isDateAvailable = dateAvailabilityData?.data?.available ?? true;
    const dateUnavailabilityReason = dateAvailabilityData?.data?.reason;

    // Use time validation data when user changes time
    const isTimeValid = timeValidationData?.data?.available ?? true;
    const timeUnavailabilityReason = timeValidationData?.data?.reason;
    const timeValidationMessage = timeValidationData?.data?.message;

    const operatingHours =
        timeSlotsData?.data?.operatingHours || timeValidationData?.data?.operatingHours || [];

    // Function to check if selected time falls within operating hours
    const isTimeWithinOperatingHours = (
        startTime: string,
        endTime: string,
        operatingHours: Array<{ from: string; to: string }>,
    ) => {
        if (operatingHours.length === 0) return true; // If no operating hours, assume always available

        const convertToMinutes = (time: string) => {
            const [timePart, period] = time.split(' ');
            const [hours, minutes] = timePart.split(':');
            let hour24 = parseInt(hours);
            if (period === 'PM' && hour24 !== 12) hour24 += 12;
            if (period === 'AM' && hour24 === 12) hour24 = 0;
            return hour24 * 60 + parseInt(minutes);
        };

        const startMinutes = convertToMinutes(startTime);
        const endMinutes = convertToMinutes(endTime);

        return operatingHours.some((slot) => {
            const slotStartMinutes = convertToMinutes(slot.from);
            const slotEndMinutes = convertToMinutes(slot.to);

            // Check if selected time is completely within any operating hour slot
            return startMinutes >= slotStartMinutes && endMinutes <= slotEndMinutes;
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
                        fromHours: '00',
                        fromMinutes: '00',
                        fromPeriod: 'PM',
                        toHours: '00',
                        toMinutes: '00',
                        toPeriod: 'PM',
                    });

                    handleBookingDetailsChange('timeStart', 'Start time');
                    handleBookingDetailsChange('timeEnd', 'End time');

                    setIsApplyDisabled(false);

                    return;
                }
            }

            if (!isTimeValid && timeUnavailabilityReason) {
                toast.dismiss();
                toast.error(timeUnavailabilityReason);
                setShouldValidateTime(false);
                setIsApplyDisabled(false);
            } else if (isTimeValid && !isCurrentTimeValid && timeValidationMessage) {
                const availableSlots = operatingHours
                    .map((slot) => `${slot.from} - ${slot.to}`)
                    .join(', ');
                toast.dismiss();
                toast.error(`${timeValidationMessage} Available slots: ${availableSlots}`);
                setShouldValidateTime(false);
                setIsApplyDisabled(false);
            } else if (isTimeValid && isCurrentTimeValid) {
                applyTimeChanges();
                setShouldValidateTime(false);
                setIsApplyDisabled(false);
            }
        }
    }, [
        timeValidationData,
        isTimeValid,
        timeUnavailabilityReason,
        timeValidationMessage,
        operatingHours,
        isCurrentTimeValid,
        shouldValidateTime,
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

        handleBookingDetailsChange('timeStart', startTime);
        handleBookingDetailsChange('timeEnd', endTime);
        handleToggleDropdown('time'); // Close dropdown
    };

    // Calculate pricing from real data with null safety and discount
    const originalBasePrice = parseFloat(spaceData?.SpaceListing?.price_per_hour) || 500;
    
    // Base Discount (flat listing + refundable)
    let calculatedDiscountAmount = parseFloat(
        String((spaceData?.SpaceListing as any)?.discountAmount || '0'),
    );
    if (spaceData?.SpaceListing?.isRefundable === true) {
        calculatedDiscountAmount = calculatedDiscountAmount + 10;
    }

    // Check if dates are valid before calculating hours
    const hours =
        localBookingDetails.date !== 'Select date' &&
            localBookingDetails.timeStart !== 'Start time' &&
            localBookingDetails.timeEnd !== 'End time'
            ? (() => {
                const startTime = new Date(
                    `${localBookingDetails.date} ${localBookingDetails.timeStart}`,
                );
                let endTime = new Date(
                    `${localBookingDetails.date} ${localBookingDetails.timeEnd}`,
                );

                if (endTime <= startTime) {
                    endTime = new Date(endTime.getTime() + 24 * 60 * 60 * 1000); // Add 24 hours
                }

                return !isNaN(startTime.getTime()) && !isNaN(endTime.getTime())
                    ? Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60))
                    : 0;
            })()
            : 1;

    const extra_discount_per = (spaceData?.SpaceListing as any)?.extra_discount_per;
    let appliedExtraDiscount = 0;
    if (typeof extra_discount_per === 'object' && extra_discount_per !== null) {
        const t12 = parseFloat(String(extra_discount_per.twelve || '0'));
        const t8 = parseFloat(String(extra_discount_per.eight || '0'));
        const t6 = parseFloat(String(extra_discount_per.six || '0'));
        const t4 = parseFloat(String(extra_discount_per.four || '0'));

        if (hours >= 12 && t12 > 0) {
            appliedExtraDiscount = t12;
        } else if (hours >= 8 && t8 > 0) {
            appliedExtraDiscount = t8;
        } else if (hours >= 6 && t6 > 0) {
            appliedExtraDiscount = t6;
        } else if (hours >= 4 && t4 > 0) {
            appliedExtraDiscount = t4;
        }
    } else if (extra_discount_per) {
        if (hours >= 6) {
            appliedExtraDiscount = parseFloat(String(extra_discount_per || '0'));
        }
    }

    const totalHostDiscountPerc = calculatedDiscountAmount + appliedExtraDiscount;

    // Gross Booking Amount
    const grossAmount = originalBasePrice * Math.max(hours, 1);

    // Duration Discount Amount (Host Discount)
    const extraDiscountAmount = grossAmount * (totalHostDiscountPerc / 100);

    // Discounted Base
    const discountedBase = grossAmount - extraDiscountAmount;

    const guestPlatformFeePercentage = parseFloat(bookingSettings?.guest_platform_fee || '5') / 100;
    const cgstPercentage = parseFloat(bookingSettings?.cgst || '9') / 100;
    const sgstPercentage = parseFloat(bookingSettings?.sgst || '9') / 100;

    const guestPlatformFee = Math.round(discountedBase * guestPlatformFeePercentage);
    const subtotal = discountedBase + guestPlatformFee;
    const cgstAmount = Math.round(subtotal * cgstPercentage * 100) / 100;
    const sgstAmount = Math.round(subtotal * sgstPercentage * 100) / 100;
    const totalAmount = Math.round((subtotal + cgstAmount + sgstAmount) * 100) / 100;

    // Price breakdown data using real calculations
    const priceItems: PriceBreakdownItem[] = [
        { label: `₹${originalBasePrice} x ${hours} Hours`, amount: `₹${grossAmount}` },
    ];

    if (totalHostDiscountPerc > 0 && extraDiscountAmount > 0) {
        priceItems.push({
            label: `Host Discount (${totalHostDiscountPerc}%)`,
            amount: `-₹${Math.round(extraDiscountAmount)}`,
        });
    }

    priceItems.push(
        { label: 'Guest Platform Fee', amount: `₹${guestPlatformFee}` },
        {
            label: `CGST (${parseFloat(bookingSettings?.cgst || '9')}%)`,
            amount: `₹${cgstAmount.toFixed(2)}`,
        },
        {
            label: `SGST (${parseFloat(bookingSettings?.sgst || '9')}%)`,
            amount: `₹${sgstAmount.toFixed(2)}`,
        },
    );

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

    // Event handlers
    const handleBookingDetailsChange = (field: string, value: any) => {
        setLocalBookingDetails((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Also update parent if callback provided
        if (onBookingDetailsChange) {
            onBookingDetailsChange(field, value);
        }
    };

    const handleToggleDropdown = (field: 'date' | 'time' | 'attendees') => {
        setDropdownStates((prev) => ({
            date: false,
            time: false,
            attendees: false,
            [field]: !prev[field],
        }));
    };

    const handleDateSelect = (date: Date) => {
        handleBookingDetailsChange('date', format(date, 'MMM dd, yyyy'));
        // Reset time validation when date changes
        setShouldValidateTime(false);
    };

    const handleTimeChange = (type: 'from' | 'to', field: string, value: string) => {
        setTimeData((prev) => ({
            ...prev,
            [`${type}${field.charAt(0).toUpperCase() + field.slice(1)}`]: value,
        }));

        // Reset apply button state when user changes time after an error
        setIsApplyDisabled(false);

        // Don't trigger time validation here - only when Apply button is clicked
    };

    // Helper function to check if date is today
    const isToday = (dateString: string) => {
        try {
            if (dateString === 'Select date') return false;
            const date = new Date(dateString);
            const today = new Date();
            return (
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear()
            );
        } catch (error) {
            console.error('Error checking if date is today:', error);
            return false;
        }
    };

    // Helper function to convert time to minutes
    const timeToMinutes = (time: string): number => {
        const [timePart, period] = time.split(' ');
        const [hours, minutes] = timePart.split(':');
        let hour24 = parseInt(hours);
        if (period === 'PM' && hour24 !== 12) hour24 += 12;
        if (period === 'AM' && hour24 === 12) hour24 = 0;
        return hour24 * 60 + parseInt(minutes);
    };

    // Helper function to get current time in minutes
    const getCurrentTimeInMinutes = (): number => {
        const now = new Date();
        return now.getHours() * 60 + now.getMinutes();
    };

    const handleTimeApply = () => {
        // Check if date is available before applying time
        if (!isDateAvailable && dateUnavailabilityReason) {
            toast.error(dateUnavailabilityReason);
            return;
        }

        // Check if selected date is today and if start/end time has passed
        if (isToday(localBookingDetails.date)) {
            const startTime = `${timeData.fromHours}:${timeData.fromMinutes} ${timeData.fromPeriod}`;
            const endTime = `${timeData.toHours}:${timeData.toMinutes} ${timeData.toPeriod}`;

            // Validate that time fields are filled
            if (
                !timeData.fromHours ||
                !timeData.fromMinutes ||
                !timeData.toHours ||
                !timeData.toMinutes
            ) {
                toast.error('Please enter valid start and end times');
                return;
            }

            const currentMinutes = getCurrentTimeInMinutes();
            const startMinutes = timeToMinutes(startTime);
            const endMinutes = timeToMinutes(endTime);

            if (startMinutes <= currentMinutes) {
                toast.dismiss();
                toast.error('Start time has already passed. Please select a future time.');
                return;
            }

            // Handle overnight bookings
            if (endMinutes <= startMinutes) {
                const adjustedEndMinutes = endMinutes + 24 * 60;
                if (adjustedEndMinutes <= currentMinutes) {
                    toast.dismiss();
                    toast.error('End time has already passed. Please select a future time.');
                    return;
                }
            } else {
                if (endMinutes <= currentMinutes) {
                    toast.dismiss();
                    toast.error('End time has already passed. Please select a future time.');
                    return;
                }
            }
        }

        // Trigger time validation API call when Apply button is clicked
        setShouldValidateTime(true);

        // Note: The actual validation will happen in the useEffect that watches shouldValidateTime
        // We'll apply the time changes after validation passes
    };

    const handleAttendeesChange = (count: number) => {
        handleBookingDetailsChange('attendees', count);
    };

    const handleMessageChange = (value: string) => {
        setMessage(value);
    };

    const showEmptyMessageToast = () => {
        if (message.trim().length === 0) {
            toast.warning('Please enter a message to send to the host');
            return true;
        }
        return false;
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);

            if (showEmptyMessageToast()) {
                setIsSubmitting(false);
                return;
            }

            if (!spaceData?.id) {
                toast.error('Space information is missing');
                return;
            }

            // Validate that all required fields are selected
            if (
                localBookingDetails.date === 'Select date' ||
                localBookingDetails.timeStart === 'Start time' ||
                localBookingDetails.timeStart === 'Start Time' ||
                localBookingDetails.timeEnd === 'End time' ||
                localBookingDetails.timeEnd === 'End Time'
            ) {
                toast.error('Please select date and time before submitting');
                return;
            }

            if (localBookingDetails.attendees <= 0) {
                toast.error('Number of attendees must be at least 1');
                return;
            } else if (spaceData?.capacity && localBookingDetails.attendees > spaceData.capacity) {
                toast.error(
                    `Number of attendees cannot exceed space capacity of ${spaceData.capacity}`,
                );
                return;
            }

            // Construct WhatsApp message with booking details
            // Get space name from title
            const spaceName = spaceData?.title || spaceData?.name || 'Space';

            // Get city and state
            const city = spaceData?.City?.name || spaceData?.city || '';
            const state = spaceData?.City?.state || spaceData?.state || '';
            const location = [city, state].filter(Boolean).join(', ');

            // Get host name with first name and last name initial
            const hostFirstName = spaceData?.User?.firstName || spaceData?.User?.first_name || '';
            const hostLastName = spaceData?.User?.lastName || spaceData?.User?.last_name || '';
            const hostLastInitial = hostLastName ? hostLastName.charAt(0).toUpperCase() + '.' : '';
            const hostName = hostFirstName ? `${hostFirstName} ${hostLastInitial}`.trim() : 'Host';

            const whatsappMessage = `Hello! I'm interested in booking your space.

*Space:* ${spaceName}
*Location:* ${location || 'N/A'}
*Host:* ${hostName}
*Date:* ${localBookingDetails.date}
*Time:* ${localBookingDetails.timeStart} - ${localBookingDetails.timeEnd}
*Attendees:* ${localBookingDetails.attendees}
*Total Amount:* ₹${totalAmount.toLocaleString()}

*Message:* ${message}`;

            // WhatsApp phone number from environment variable
            const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

            // Encode message for URL
            const encodedMessage = encodeURIComponent(whatsappMessage);

            // Open WhatsApp with pre-filled message
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
            window.open(whatsappUrl, '_blank');

            toast.success('Redirecting to WhatsApp...');
            onClose();
            setMessage('');
        } catch (error) {
            handleApiError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    // Component guard - don't render if essential data is missing
    if (!spaceData) {
        return (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between p-6 border-b">
                        <h2 className="text-xl font-semibold text-gray-900">Message Host</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-6 text-center">
                        <p className="text-gray-500">Loading space information...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Message Host</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Booking Header */}
                    <BookingHeader spaceData={spaceData} />

                    {/* Booking Details */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Booking Details</h3>

                        {/* Booking Details Container - Same as booking form */}
                        <div className="border border-gray-200 rounded-3xl relative dropdown-container">
                            {/* Date Row */}
                            <div className="relative">
                                <BookingDetailRow
                                    label="Date"
                                    value={localBookingDetails.date}
                                    onEdit={() => handleToggleDropdown('date')}
                                    isOpen={dropdownStates.date}
                                />
                                <DatePickerDropdown
                                    isOpen={dropdownStates.date}
                                    currentDate={localBookingDetails.date}
                                    onDateSelect={handleDateSelect}
                                    onClose={() => handleToggleDropdown('date')}
                                    spaceId={spaceData?.id || 0}
                                />
                            </div>

                            {/* Time Row */}
                            <div className="relative">
                                <BookingDetailRow
                                    label="Time"
                                    value={
                                        <TimeDisplay
                                            startTime={localBookingDetails.timeStart}
                                            endTime={localBookingDetails.timeEnd}
                                            isDisabled={!isDateAvailable}
                                        />
                                    }
                                    onEdit={() => {
                                        if (!isDateAvailable) {
                                            // Show toaster when user tries to click disabled time field
                                            if (dateUnavailabilityReason) {
                                                toast.error(dateUnavailabilityReason);
                                            }
                                            return;
                                        }
                                        handleToggleDropdown('time');
                                    }}
                                    isOpen={dropdownStates.time}
                                    isDisabled={!isDateAvailable}
                                />
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
                                    timeSlotsData={timeSlotsData?.data}
                                    isApplyDisabled={isApplyDisabled}
                                    minBookingHours={spaceData?.SpaceListing?.min_booking_hours}
                                />
                            </div>

                            {/* Attendees Row */}
                            <div className="relative">
                                <BookingDetailRow
                                    label="Attendees"
                                    value={`${localBookingDetails.attendees} Attendees`}
                                    onEdit={() => handleToggleDropdown('attendees')}
                                    isLastItem={true}
                                    isOpen={dropdownStates.attendees}
                                />
                                <AttendeesDropdown
                                    isOpen={dropdownStates.attendees}
                                    attendees={localBookingDetails.attendees}
                                    onAttendeesChange={handleAttendeesChange}
                                    onClose={() => handleToggleDropdown('attendees')}
                                    spaceCapacity={spaceData?.capacity}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Price Breakdown */}
                    <PriceBreakdownSection
                        items={priceItems}
                        total={`₹${totalAmount.toLocaleString()}`}
                    />

                    {/* Message to Host */}
                    <MessageToHostSection
                        message={message}
                        onMessageChange={handleMessageChange}
                        onEmptyMessageToast={showEmptyMessageToast}
                    />

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-1 bg-[#F6CD28] hover:bg-yellow-500 text-black font-semibold disabled:opacity-50"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageHostModal;
