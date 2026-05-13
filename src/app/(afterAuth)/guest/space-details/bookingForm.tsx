'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
    Plus,
    Minus,
    ChevronDown,
    SquarePen,
    Info,
    PartyPopper,
    Lightbulb,
    Clock,
} from 'lucide-react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { useGetKYCDoc } from '@/services/profile/profile.service';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    useGetGuestBookingCalendar,
    useGetGuestTimeSlots,
} from '@/services/calendar/calendar.service';
import { trackEvent, PIXEL_IDS } from '@/utils/metaPixel';
import Instant from '@/components/icons/Instant';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { parse, isToday as dateFnsIsToday, format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { containsPII } from '@/utils/piiValidation';
import { checkRestrictedContent } from '@/utils/validators';
import { useBookingForm } from './useBookingForm';
import { formatGSTForDisplay } from '@/utils/gstHelpers';

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

// Header Component with Instant Booking and Price/Rating
const BookingHeader = ({
    spaceData,
    bookingSettings,
    pricing,
}: {
    spaceData?: any;
    bookingSettings?: any;
    pricing?: any;
}) => {
    const basePrice = parseFloat(spaceData?.SpaceListing?.price_per_hour) || 1000;

    let calculatedDiscountAmount = parseFloat(
        String((spaceData?.SpaceListing as any)?.discountAmount || '0'),
    );
    if (spaceData?.SpaceListing?.isRefundable === true) {
        calculatedDiscountAmount = calculatedDiscountAmount + 10;
    }

    const bookingHours = pricing?.bookingHours || 0;
    const extra_discount_per = (spaceData?.SpaceListing as any)?.extra_discount_per;

    let appliedExtraDiscount = 0;

    if (typeof extra_discount_per === 'object' && extra_discount_per !== null) {
        const t12 = parseFloat(String(extra_discount_per.twelve || '0'));
        const t8 = parseFloat(String(extra_discount_per.eight || '0'));
        const t6 = parseFloat(String(extra_discount_per.six || '0'));
        const t4 = parseFloat(String(extra_discount_per.four || '0'));

        // Tiered discounts are inclusive of the start hour (e.g., 4+ applies starting at exactly 4.0 hours)
        if (bookingHours >= 12 && t12 > 0) appliedExtraDiscount = t12;
        else if (bookingHours >= 8 && t8 > 0) appliedExtraDiscount = t8;
        else if (bookingHours >= 6 && t6 > 0) appliedExtraDiscount = t6;
        else if (bookingHours >= 4 && t4 > 0) appliedExtraDiscount = t4;
    }

    const isLongBooking = appliedExtraDiscount > 0;

    // Determine the next tier for the prompt
    let nextTier = null;
    if (typeof extra_discount_per === 'object' && extra_discount_per !== null) {
        if (bookingHours < 4 && extra_discount_per.four > 0)
            nextTier = { hours: 4, discount: extra_discount_per.four };
        else if (bookingHours < 6 && extra_discount_per.six > 0)
            nextTier = { hours: 6, discount: extra_discount_per.six };
        else if (bookingHours < 8 && extra_discount_per.eight > 0)
            nextTier = { hours: 8, discount: extra_discount_per.eight };
        else if (bookingHours < 12 && extra_discount_per.twelve > 0)
            nextTier = { hours: 12, discount: extra_discount_per.twelve };
    }

    const priceAfterBaseDiscount =
        calculatedDiscountAmount > 0 ? basePrice * (1 - calculatedDiscountAmount / 100) : basePrice;

    // Calculate discounted price if discount is available
    const hasDiscount = calculatedDiscountAmount > 0 || appliedExtraDiscount > 0;

    // GST and Platform Fee Calculation
    const platformFeePercentage = parseFloat(bookingSettings?.guest_platform_fee || '5') / 100;
    const cgstPercentage = parseFloat(bookingSettings?.cgst || '9') / 100;
    const sgstPercentage = parseFloat(bookingSettings?.sgst || '9') / 100;
    const taxMultiplier = (1 + platformFeePercentage) * (1 + cgstPercentage + sgstPercentage);

    const grossBasePrice = basePrice * taxMultiplier;

    // The final displayed discounted price applies the duration discount logically as a flat rebate
    // off the fully loaded gross price, exactly identical to useBookingForm math
    const grossPriceBeforeExtra = priceAfterBaseDiscount * taxMultiplier;
    const extraDiscountRebate =
        appliedExtraDiscount > 0 ? priceAfterBaseDiscount * (appliedExtraDiscount / 100) : 0;
    const grossDiscountedPrice = grossPriceBeforeExtra - extraDiscountRebate;

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
            <div>
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                            {/* Current/Discounted Price */}
                            <span className="text-gray-800 font-bold text-lg font-poppins">
                                ₹
                                {formatCurrency(
                                    hasDiscount ? grossDiscountedPrice : grossBasePrice,
                                )}
                            </span>
                            <span className="text-gray-500 font-medium text-base font-poppins">
                                /hour
                            </span>

                            {/* Original Price with Strikethrough (if discount exists) */}
                            {hasDiscount && (
                                <span className="text-red-500 text-base font-poppins">
                                    <span className="line-through">
                                        ₹{formatCurrency(grossBasePrice)}
                                    </span>
                                    <span className="ml-1">/hour</span>
                                </span>
                            )}
                        </div>
                        <span className="text-gray-500 font-medium text-[11px] font-poppins">
                            incl. of all taxes
                        </span>
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
                        <span className="flex flex-row  items-center gap-2 text-gray-500 font-normal  text-xs md:text-sm font-poppins">
                            {parseFloat(spaceData?.avg_rating ?? '0').toFixed(1)}
                            {spaceData?.reviewCount && Number(spaceData?.reviewCount) > 0 && (
                                <span className="hidden md:block">
                                    ({spaceData?.reviewCount ?? 0} reviews)
                                </span>
                            )}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    {/* Discount Information Card */}
                    {typeof extra_discount_per === 'object' &&
                        extra_discount_per !== null &&
                        Object.values(extra_discount_per).some(
                            (v) => parseFloat(String(v)) > 0,
                        ) && (
                            <div className="mt-2 bg-[#f9fafe] border border-[#FEF08A] rounded-2xl p-4 space-y-3">
                                <div className="flex items-center gap-2 text-zinc-800">
                                    <Clock className="w-4 h-4 text-[#FACC15]" />
                                    <span className="text-sm font-semibold">
                                        Save on longer bookings
                                    </span>
                                </div>

                                <ul className="space-y-1.5 ml-1">
                                    {[
                                        { hours: 4, key: 'four' },
                                        { hours: 6, key: 'six' },
                                        { hours: 8, key: 'eight' },
                                        { hours: 12, key: 'twelve' },
                                    ].map((tier) => {
                                        const discountVal = parseFloat(
                                            String(
                                                extra_discount_per[
                                                    tier.key as keyof typeof extra_discount_per
                                                ] || '0',
                                            ),
                                        );
                                        if (discountVal <= 0) return null;

                                        return (
                                            <li
                                                key={tier.key}
                                                className="flex items-center gap-2 text-zinc-700"
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#FACC15]" />
                                                <span className="text-[13px] font-medium">
                                                    {discountVal}% off for {tier.hours}+ hours
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>

                                {nextTier && (
                                    <div className="pt-2 border-t border-[#FEF08A]">
                                        <div className="flex items-center gap-2 text-[#854D0E] bg-[#FEF9C3]/50 p-2 rounded-lg border border-[#FEF08A]/50">
                                            <Lightbulb className="w-3.5 h-3.5" />
                                            <span className="text-[12px] font-semibold">
                                                Book {nextTier.hours}+ hours to save{' '}
                                                {nextTier.discount}% extra
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                    {/* Simple Applied Badge */}
                    {isLongBooking && (
                        <div className="mt-1 text-xs font-medium px-2 py-0.5 rounded-lg border w-fit flex items-center gap-2 border-green-200 bg-green-50 text-green-800">
                            <PartyPopper className="w-3 h-3" />
                            {appliedExtraDiscount}% long booking discount applied
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

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
            className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg p-4 max-h-[80vh] overflow-y-auto"
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
            className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg p-4 sm:p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="inline-flex items-center px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full my-2">
                <span className="text-sm font-medium text-black">
                    Min. Booking: <span className="font-bold">{minBookingHours}</span> hours
                </span>
            </div>
            {!isDateAvailable ? (
                <div className="flex flex-col items-center justify-center h-32 space-y-2">
                    <div className="text-sm text-red-600 font-medium">Time not available</div>
                    <div className="text-xs text-gray-500 text-center px-4">
                        {unavailabilityReason || 'Please select a different time'}
                    </div>
                </div>
            ) : (
                <div className="space-y-4 sm:space-y-6">
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
                                        className={`px-3 rounded-none rounded-l-md font-semibold text-sm ${
                                            timeData.fromPeriod === 'AM'
                                                ? 'bg-[#F6CD28] text-black hover:bg-yellow-500'
                                                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        AM
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => onTimeChange('from', 'period', 'PM')}
                                        className={`px-3 rounded-none rounded-r-md font-semibold text-sm ${
                                            timeData.fromPeriod === 'PM'
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
                                        className={`px-3 rounded-none rounded-l-md font-semibold text-sm ${
                                            timeData.toPeriod === 'AM'
                                                ? 'bg-[#F6CD28] text-black hover:bg-yellow-500'
                                                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        AM
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => onTimeChange('to', 'period', 'PM')}
                                        className={`px-3 rounded-none rounded-r-md font-semibold text-sm ${
                                            timeData.toPeriod === 'PM'
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
                            className={`px-6 ${
                                isApplyDisabled
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
            className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg p-4 sm:p-6"
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
                        className="bg-[#F6CD28] hover:bg-yellow-500 text-black px-6 w-full sm:w-auto"
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
                    className={`font-semibold  text-xs md:text-lg font-figtree ${isDisabled ? 'text-gray-400' : 'text-gray-800'}`}
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
                    className={`w-7 h-7 flex items-center justify-center transition-colors ${
                        isDisabled
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
                    className={`w-7 h-7 flex items-center justify-center transition-transform ${
                        isDisabled ? 'cursor-not-allowed' : ''
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

const BookingDetailsSection = ({
    bookingDetails,
    onBookingDetailsChange,
    dropdownStates,
    onToggleDropdown,
    spaceId,
    spaceData,
}: {
    bookingDetails: BookingDetails;
    onBookingDetailsChange: (field: string, value: any) => void;
    dropdownStates: { date: boolean; time: boolean; attendees: boolean };
    onToggleDropdown: (field: 'date' | 'time' | 'attendees') => void;
    spaceId: number;
    spaceData?: any;
}) => {
    const [timeData, setTimeData] = useState<TimeData>({
        fromHours: '00',
        fromMinutes: '00',
        fromPeriod: 'PM',
        toHours: '00',
        toMinutes: '00',
        toPeriod: 'PM',
    });

    const [validationTimeoutId, setValidationTimeoutId] = useState<NodeJS.Timeout | null>(null);

    // Helper functions for time validation
    const isToday = (dateString: string) => {
        try {
            if (dateString === 'Select date') return false;
            const parsedDate = parse(dateString, 'MMM dd, yyyy', new Date());
            return dateFnsIsToday(parsedDate);
        } catch (error) {
            console.error('Error checking if date is today:', error);
            return false;
        }
    };

    const timeToMinutes = (time: string): number => {
        const [timePart, period] = time.split(' ');
        const [hours, minutes] = timePart.split(':');
        let hour24 = parseInt(hours);
        if (period === 'PM' && hour24 !== 12) hour24 += 12;
        if (period === 'AM' && hour24 === 12) hour24 = 0;
        return hour24 * 60 + parseInt(minutes);
    };

    const getCurrentTimeInMinutes = (): number => {
        const now = new Date();
        return now.getHours() * 60 + now.getMinutes();
    };

    const selectedDateISO = React.useMemo(() => {
        if (bookingDetails.date !== 'Select date') {
            try {
                const date = new Date(bookingDetails.date);
                if (isNaN(date.getTime())) {
                    console.error('Invalid date:', bookingDetails.date);
                    return null;
                }
                const utcDate = new Date(
                    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
                );
                return utcDate.toISOString();
            } catch (error) {
                console.error('Error parsing date:', error);
                return null;
            }
        }
        return null;
    }, [bookingDetails.date]);

    const convertTo24Hour = (time: string): string => {
        try {
            const [timePart, period] = time.split(' ');
            const [hours, minutes] = timePart.split(':');
            let hour24 = parseInt(hours, 10);

            if (isNaN(hour24)) hour24 = 0;

            if (period === 'PM' && hour24 !== 12) hour24 += 12;
            if (period === 'AM' && hour24 === 12) hour24 = 0;

            return `${hour24.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
        } catch (error) {
            console.error('Error converting time to 24-hour format:', error);
            return '00:00:00';
        }
    };

    const {
        data: dateAvailabilityData,
        isPending: isDateAvailabilityLoading,
        error: dateAvailabilityError,
    } = useGetGuestTimeSlots(spaceId, selectedDateISO || '', undefined, undefined, {
        enabled: !!selectedDateISO && !!spaceId,
    } as any);

    const { data: timeSlotsData, isLoading: isTimeSlotsLoading } = useGetGuestTimeSlots(
        spaceId,
        selectedDateISO || '',
        undefined,
        undefined,
        {
            enabled: dropdownStates.time && !!selectedDateISO && !!spaceId,
        } as any,
    );

    const isDateAvailable = dateAvailabilityData?.data?.available ?? true;
    const dateUnavailabilityReason = dateAvailabilityData?.data?.reason;
    const operatingHours = timeSlotsData?.data?.operatingHours || [];
    const availableTimeSlots = dateAvailabilityData?.data?.availableTimeSlots || [];

    const convertToMinutes = (time: string): number => {
        try {
            const [timePart, period] = time.split(' ');
            const [hours, minutes] = timePart.split(':');
            let hour24 = parseInt(hours, 10);

            if (isNaN(hour24)) hour24 = 0;

            if (period === 'PM' && hour24 !== 12) hour24 += 12;
            if (period === 'AM' && hour24 === 12) hour24 = 0;

            return hour24 * 60 + parseInt(minutes, 10);
        } catch (error) {
            console.error('Error converting time to minutes:', error);
            return 0;
        }
    };

    // Function to check minimum booking hours
    const checkMinimumBookingHours = (startTimeStr: string, endTimeStr: string) => {
        const minBookingHours = parseFloat(spaceData?.SpaceListing?.min_booking_hours || '0');
        if (minBookingHours <= 0) return { isValid: true, message: '' };

        const startMinutes = convertToMinutes(startTimeStr);
        const endMinutes = convertToMinutes(endTimeStr);
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

    const isTimeWithinOperatingHours = (
        startTime: string,
        endTime: string,
        operatingHours: Array<{ from: string; to: string }>,
    ): boolean => {
        if (operatingHours.length === 0) return true;

        const startMinutes = convertToMinutes(startTime);
        const endMinutes = convertToMinutes(endTime);
        const bookingSpansMidnight = endMinutes < startMinutes;

        return operatingHours.some((slot) => {
            const slotStartMinutes = convertToMinutes(slot.from);
            const slotEndMinutes = convertToMinutes(slot.to);
            const slotSpansMidnight = slotEndMinutes < slotStartMinutes;

            if (slotSpansMidnight) {
                if (bookingSpansMidnight) {
                    return startMinutes >= slotStartMinutes && endMinutes <= slotEndMinutes;
                } else {
                    if (startMinutes >= slotStartMinutes && endMinutes >= slotStartMinutes) {
                        return true;
                    }
                    if (startMinutes <= slotEndMinutes && endMinutes <= slotEndMinutes) {
                        return true;
                    }
                    return false;
                }
            } else {
                if (bookingSpansMidnight) {
                    return false;
                } else {
                    return startMinutes >= slotStartMinutes && endMinutes <= slotEndMinutes;
                }
            }
        });
    };

    const checkTimeAgainstAvailableSlots = (startTime: string, endTime: string) => {
        if (availableTimeSlots.length === 0) return { isValid: true, message: '' };

        const startMinutes = convertToMinutes(startTime);
        const endMinutes = convertToMinutes(endTime);

        let earliestSlotStart = Infinity;
        let latestSlotEnd = -Infinity;

        availableTimeSlots.forEach((slot: any) => {
            const slotStart = convertToMinutes(slot.from);
            const slotEnd = convertToMinutes(slot.to);

            if (slotStart < earliestSlotStart) earliestSlotStart = slotStart;
            if (slotEnd > latestSlotEnd) latestSlotEnd = slotEnd;
        });

        if (startMinutes < earliestSlotStart) {
            const earliestSlot = availableTimeSlots.find(
                (slot: any) => convertToMinutes(slot.from) === earliestSlotStart,
            );
            return {
                isValid: false,
                message: `Selected time is before available slots. Earliest available time starts at ${earliestSlot?.startTime}`,
            };
        }

        if (endMinutes > latestSlotEnd) {
            const latestSlot = availableTimeSlots.find(
                (slot: any) => convertToMinutes(slot.to) === latestSlotEnd,
            );
            return {
                isValid: false,
                message: `Selected time is after available slots. Latest available time ends at ${latestSlot?.endTime}`,
            };
        }

        const isWithinAnySlot = availableTimeSlots.some((slot: any) => {
            const slotStart = convertToMinutes(slot.from);
            const slotEnd = convertToMinutes(slot.to);
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

    const resetTimePicker = React.useCallback(() => {
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
    }, [onBookingDetailsChange, setTimeData]);

    React.useEffect(() => {
        return () => {
            if (validationTimeoutId) {
                clearTimeout(validationTimeoutId);
            }
        };
    }, [validationTimeoutId]);

    React.useEffect(() => {
        if (dateAvailabilityData && !isDateAvailable && dateUnavailabilityReason) {
            toast.dismiss();
            toast.error(dateUnavailabilityReason);
            resetTimePicker();
        }
    }, [dateAvailabilityData, isDateAvailable, dateUnavailabilityReason, resetTimePicker]);

    React.useEffect(() => {
        if (dateAvailabilityError) {
            const errorMessage = (dateAvailabilityError as any)?.response?.data?.message;
            if (errorMessage) {
                toast.dismiss();
                toast.error(errorMessage);
            }
        }
    }, [dateAvailabilityError]);

    const handleDateSelect = (date: Date) => {
        onBookingDetailsChange('date', format(date, 'MMM dd, yyyy'));
        resetTimePicker();
    };

    const handleTimeChange = (type: 'from' | 'to', field: string, value: string) => {
        setTimeData((prev) => ({
            ...prev,
            [`${type}${field.charAt(0).toUpperCase() + field.slice(1)}`]: value,
        }));
    };

    const handleTimeApply = () => {
        if (validationTimeoutId) {
            clearTimeout(validationTimeoutId);
        }

        if (!isDateAvailable && dateUnavailabilityReason) {
            toast.dismiss();
            toast.error(dateUnavailabilityReason);
            resetTimePicker();
            return;
        }

        const startTime = `${timeData.fromHours}:${timeData.fromMinutes} ${timeData.fromPeriod}`;
        const endTime = `${timeData.toHours}:${timeData.toMinutes} ${timeData.toPeriod}`;

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

        // Check if selected date is today and if start/end time has passed
        if (isToday(bookingDetails.date)) {
            const currentMinutes = getCurrentTimeInMinutes();
            const startMinutes = timeToMinutes(startTime);
            const endMinutes = timeToMinutes(endTime);

            // ✅ FIXED: Require at least 1 hour in advance
            if (startMinutes <= currentMinutes + 60) {
                toast.dismiss();
                toast.error(
                    'Start time must be at least 1 hour in the future. Please select a future time.',
                );
                resetTimePicker();
                return;
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
                    return;
                }
            } else {
                if (endMinutes <= currentMinutes + 60) {
                    toast.dismiss();
                    toast.error(
                        'End time must be at least 1 hour in the future. Please select a future time.',
                    );
                    resetTimePicker();
                    return;
                }
            }
        }

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

        if (fromHoursNum < 0 || fromHoursNum > 12 || toHoursNum < 0 || toHoursNum > 12) {
            toast.dismiss();
            toast.error('Hours must be between 0 and 12');
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

        // Check minimum booking hours
        const minBookingCheck = checkMinimumBookingHours(startTime, endTime);
        if (!minBookingCheck.isValid) {
            toast.dismiss();
            toast.error(minBookingCheck.message);
            resetTimePicker();
            return;
        }

        const slotCheck = checkTimeAgainstAvailableSlots(startTime, endTime);
        if (!slotCheck.isValid) {
            toast.dismiss();
            toast.error(slotCheck.message);
            resetTimePicker();
            return;
        }

        const isCurrentTimeValid = isTimeWithinOperatingHours(startTime, endTime, operatingHours);
        if (!isCurrentTimeValid && operatingHours.length > 0) {
            const availableSlots = operatingHours
                .map((slot) => {
                    const slotStartMin = convertToMinutes(slot.from);
                    const slotEndMin = convertToMinutes(slot.to);
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
            return;
        }

        const startTime24 = convertTo24Hour(startTime);
        const endTime24 = convertTo24Hour(endTime);

        if (timeSlotsData?.data) {
            const data = timeSlotsData.data as any;

            const timeToMinutes = (timeStr: string): number => {
                const [hours, minutes] = timeStr.split(':');
                return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
            };

            const startMinutes = timeToMinutes(startTime24);
            const endMinutes = timeToMinutes(endTime24);
            const bookingSpansMidnight = endMinutes < startMinutes;

            if (data.calendarBlocks) {
                for (const block of data.calendarBlocks) {
                    const blockStart = timeToMinutes(block.availableFrom);
                    const blockEnd = timeToMinutes(block.availableTo);

                    if (bookingSpansMidnight) {
                        const part1End = 24 * 60;
                        if (startMinutes < blockEnd || part1End > blockStart) {
                            if (!(startMinutes >= blockEnd || part1End <= blockStart)) {
                                toast.dismiss();
                                toast.error('Invalid time selected. This time slot is blocked.');
                                resetTimePicker();
                                return;
                            }
                        }
                        const part2Start = 0;
                        if (part2Start < blockEnd && endMinutes > blockStart) {
                            toast.dismiss();
                            toast.error('Invalid time selected. This time slot is blocked.');
                            resetTimePicker();
                            return;
                        }
                    } else {
                        if (startMinutes < blockEnd && endMinutes > blockStart) {
                            toast.dismiss();
                            toast.error('Invalid time selected. This time slot is blocked.');
                            resetTimePicker();
                            return;
                        }
                    }
                }
            }

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
                                return;
                            }
                        }
                        const part2Start = 0;
                        if (part2Start < bookingEndMinutes && endMinutes > bookingStartMinutes) {
                            toast.dismiss();
                            toast.error('Invalid time selected. This time slot is already booked.');
                            resetTimePicker();
                            return;
                        }
                    } else {
                        if (startMinutes < bookingEndMinutes && endMinutes > bookingStartMinutes) {
                            toast.dismiss();
                            toast.error('Invalid time selected. This time slot is already booked.');
                            resetTimePicker();
                            return;
                        }
                    }
                }
            }
        }

        onBookingDetailsChange('timeStart', startTime);
        onBookingDetailsChange('timeEnd', endTime);
        onToggleDropdown('time');
    };

    const handleAttendeesChange = (count: number) => {
        onBookingDetailsChange('attendees', count);
    };

    React.useEffect(() => {
        if (
            bookingDetails.timeStart &&
            bookingDetails.timeStart !== 'Start time' &&
            bookingDetails.timeStart !== 'HH:MM AM' &&
            bookingDetails.timeStart.includes(':')
        ) {
            try {
                const [timePart, period] = bookingDetails.timeStart.split(' ');
                const [hours, minutes] = timePart.split(':');
                setTimeData((prev) => ({
                    ...prev,
                    fromHours: hours || '',
                    fromMinutes: minutes || '',
                    fromPeriod: period || 'PM',
                }));
            } catch (error) {
                console.error('Error parsing start time:', error);
                setTimeData((prev) => ({
                    ...prev,
                    fromHours: '',
                    fromMinutes: '',
                    fromPeriod: 'PM',
                }));
            }
        }

        if (
            bookingDetails.timeEnd &&
            bookingDetails.timeEnd !== 'End time' &&
            bookingDetails.timeEnd !== 'HH:MM PM' &&
            bookingDetails.timeEnd.includes(':')
        ) {
            try {
                const [timePart, period] = bookingDetails.timeEnd.split(' ');
                const [hours, minutes] = timePart.split(':');
                setTimeData((prev) => ({
                    ...prev,
                    toHours: hours || '',
                    toMinutes: minutes || '',
                    toPeriod: period || 'PM',
                }));
            } catch (error) {
                console.error('Error parsing end time:', error);
                setTimeData((prev) => ({
                    ...prev,
                    toHours: '',
                    toMinutes: '',
                    toPeriod: 'PM',
                }));
            }
        }
    }, [bookingDetails.timeStart, bookingDetails.timeEnd]);

    return (
        <div className="border border-gray-200 rounded-3xl relative dropdown-container">
            <div className="relative">
                <BookingDetailRow
                    label="Date"
                    value={bookingDetails.date}
                    onEdit={() => onToggleDropdown('date')}
                    isOpen={dropdownStates.date}
                />
                <DatePickerDropdown
                    isOpen={dropdownStates.date}
                    currentDate={bookingDetails.date}
                    onDateSelect={handleDateSelect}
                    onClose={() => onToggleDropdown('date')}
                    spaceId={spaceId}
                />
            </div>

            <div className="relative">
                <BookingDetailRow
                    label="Time"
                    value={`${bookingDetails.timeStart} → ${bookingDetails.timeEnd}`}
                    onEdit={() => {
                        if (!isDateAvailable) {
                            if (dateUnavailabilityReason) {
                                toast.dismiss();
                                toast.error(dateUnavailabilityReason);
                            }
                            return;
                        }
                        onToggleDropdown('time');
                    }}
                    isOpen={dropdownStates.time}
                    isDisabled={!isDateAvailable}
                />
                <TimePickerDropdown
                    isOpen={dropdownStates.time}
                    timeData={timeData}
                    onTimeChange={handleTimeChange}
                    onApply={handleTimeApply}
                    onClose={() => onToggleDropdown('time')}
                    isDateAvailable={isDateAvailable}
                    isLoading={isTimeSlotsLoading}
                    unavailabilityReason={dateUnavailabilityReason}
                    operatingHours={operatingHours}
                    isTimeWithinOperatingHours={isTimeWithinOperatingHours(
                        `${timeData.fromHours}:${timeData.fromMinutes} ${timeData.fromPeriod}`,
                        `${timeData.toHours}:${timeData.toMinutes} ${timeData.toPeriod}`,
                        operatingHours,
                    )}
                    timeSlotsData={timeSlotsData}
                    isApplyDisabled={false}
                    minBookingHours={spaceData?.SpaceListing?.min_booking_hours || ''}
                />
            </div>

            <div className="relative">
                <BookingDetailRow
                    label="Attendees"
                    value={bookingDetails.attendees.toString()}
                    onEdit={() => onToggleDropdown('attendees')}
                    isLastItem={true}
                    isOpen={dropdownStates.attendees}
                />
                <AttendeesDropdown
                    isOpen={dropdownStates.attendees}
                    attendees={bookingDetails.attendees}
                    onAttendeesChange={handleAttendeesChange}
                    onClose={() => onToggleDropdown('attendees')}
                    spaceCapacity={spaceData?.capacity}
                />
            </div>
        </div>
    );
};

const PriceBreakdownSection = ({
    spaceData,
    bookingDetails,
    bookingSettings,
    pricing,
}: {
    spaceData?: any;
    bookingDetails: BookingDetails;
    bookingSettings?: any;
    pricing: any;
}) => {
    const {
        bookingHours,
        totalAmount,
        baseAmount,
        basePricePostBaseDiscount,
        originalBasePrice,
        originalBaseAmount,
        baseDiscount,
        basePriceWithAll,
        totalSavings,
        isLongBooking,
        extraDiscountPercentage,
    } = pricing;

    const formatHours = (hours: number) => {
        return hours % 1 === 0 ? hours.toString() : hours.toFixed(1);
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex justify-between items-start text-gray-800">
                <div className="flex flex-col gap-1">
                    <span className="font-semibold text-base">
                        ₹{formatCurrency(basePriceWithAll)} x {formatHours(bookingHours)}{' '}
                        {bookingHours === 1 ? 'Hour' : 'Hours'}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">incl. of all taxes</span>
                </div>
                <span className="font-bold text-lg">₹{formatCurrency(totalAmount)}</span>
            </div>

            {totalSavings > 0 && (
                <div className="bg-[#E8F3E8] border border-green-100 rounded-xl p-3 flex justify-between items-center text-[#3E7B3E]">
                    <div className="flex items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    className="hover:text-[#2d5a2d] transition-colors outline-none"
                                >
                                    <Info className="w-4 h-4 cursor-pointer" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent
                                side="top"
                                align="start"
                                className="w-64 p-3 bg-white shadow-xl rounded-xl border-green-100 z-[100]"
                            >
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-[#3E7B3E]">
                                        <div className="bg-green-100 p-1 rounded-md">
                                            <PartyPopper className="w-3 h-3" />
                                        </div>
                                        <span className="text-[12px] font-bold">
                                            Discounts Applied
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        {baseDiscount > 0 && (
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex justify-between items-center text-[11px] font-bold text-gray-700">
                                                    <span>Space Discount</span>
                                                    <span className="text-[#3E7B3E]">
                                                        {baseDiscount}%
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-gray-500 leading-tight">
                                                    Applied on the base hourly rate of the space.
                                                </p>
                                            </div>
                                        )}
                                        {isLongBooking && (
                                            <div className="flex flex-col gap-0.5 pt-2 border-t border-gray-100">
                                                <div className="flex justify-between items-center text-[11px] font-bold text-gray-700">
                                                    <span>Duration Discount</span>
                                                    <span className="text-[#3E7B3E]">
                                                        {extraDiscountPercentage}%
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-gray-500 leading-tight">
                                                    Extra discount for booking {bookingHours}+
                                                    hours.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-1 pt-2 border-t border-gray-100 flex justify-between items-center text-[#3E7B3E]">
                                        <span className="text-[11px] font-bold">Total Savings</span>
                                        <span className="text-xs font-bold">
                                            ₹{formatCurrency(totalSavings)}
                                        </span>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <span className="text-sm font-bold">
                            You saved ₹{formatCurrency(totalSavings)} 🥳
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

// Message to Host Component
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
                        className={`relative flex-1 bg-white border rounded-2xl shadow-sm ${
                            hasAnyNumber ? 'border-red-500' : 'border-gray-300'
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

// Book Button Component
const BookButton = ({
    onBook,
    isDisabled,
    validationErrors,
}: {
    onBook: () => void;
    isDisabled: boolean;
    validationErrors: string[];
}) => {
    const handleBook = () => {
        if (validationErrors.length > 0) {
            // Show proper toast for each error
            validationErrors.forEach((error) => {
                toast.error(error);
            });
            return;
        }
        trackEvent(PIXEL_IDS.BOOK_NOW, 'PageView');
        onBook();
    };

    return (
        <div className="space-y-2">
            <Button
                onClick={handleBook}
                disabled={isDisabled}
                className={`flex justify-center items-center py-3 px-6 border rounded-full shadow-sm w-full transition-colors ${
                    isDisabled
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                        : ' bg-[#F7CD29] md:bg-white border-[#F7CD29] md:border-gray-300 text-gray-700 hover:bg-[#F7CD29]'
                }`}
            >
                <span className="font-semibold text-base leading-6 font-figtree">Book</span>
            </Button>
        </div>
    );
};

const BookingForm = ({
    spaceData,
    bookingDetails: bookingSettings,
    onNavigateToReview,
    onInstantBooking,
    openVerificationModal,
}: {
    spaceData?: any;
    bookingDetails?: any;
    onNavigateToReview?: (bookingData: any) => void;
    onInstantBooking?: (bookingData: any) => void;
    openVerificationModal?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const {
        message,
        handleMessageChange,
        bookingDetails,
        dropdownStates,
        setDropdownStates,
        pricing,
        handleBook,
        handleBookingDetailsChange,
        handleToggleDropdown,
        validationErrors,
    } = useBookingForm({
        spaceData,
        bookingSettings,
        onNavigateToReview,
        onInstantBooking,
        openVerificationModal: openVerificationModal as any,
    });

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
    }, [dropdownStates, setDropdownStates]);

    return (
        <div className=" flex flex-col gap-6 sm:gap-8 p-4 sm:p-8 bg-white rounded-3xl border border-gray-200 relative">
            <BookingHeader
                spaceData={spaceData}
                bookingSettings={bookingSettings}
                pricing={pricing}
            />
            <BookingDetailsSection
                bookingDetails={bookingDetails}
                onBookingDetailsChange={handleBookingDetailsChange}
                dropdownStates={dropdownStates}
                onToggleDropdown={handleToggleDropdown}
                spaceId={spaceData?.id || 0}
                spaceData={spaceData}
            />

            <PriceBreakdownSection
                spaceData={spaceData}
                bookingDetails={bookingDetails}
                bookingSettings={bookingSettings}
                pricing={pricing}
            />

            <MessageToHostSection message={message} onMessageChange={handleMessageChange} />

            <BookButton
                onBook={handleBook}
                isDisabled={validationErrors.length > 0}
                validationErrors={validationErrors}
            />
        </div>
    );
};

export default BookingForm;
