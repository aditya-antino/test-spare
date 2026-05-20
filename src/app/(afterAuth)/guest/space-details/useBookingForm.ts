'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { clearSearchFilters } from '@/store/slice/homePageSearchSlice';
import { parse, isToday as dateFnsIsToday, format } from 'date-fns';
import { toast } from 'react-toastify';
import { useGetKYCDoc } from '@/services/profile/profile.service';
import { containsPII } from '@/utils/piiValidation';

export interface BookingDetails {
    date: string;
    timeStart: string;
    timeEnd: string;
    attendees: number;
}

interface UseBookingFormProps {
    spaceData: any;
    bookingSettings: any;
    onNavigateToReview?: (bookingData: any) => void;
    onInstantBooking?: (bookingData: any) => void;
    openVerificationModal?: (open: boolean | any) => void;
}

export const useBookingForm = ({
    spaceData,
    bookingSettings,
    onNavigateToReview,
    onInstantBooking,
    openVerificationModal,
}: UseBookingFormProps) => {
    const dispatch = useDispatch();
    const isAuth = useSelector((state: RootState) => state.auth.isAuth) || false;
    const homeSearchData = useSelector((state: RootState) => state.homeSearchData);
    const { data: kycDoc } = useGetKYCDoc();

    const [message, setMessage] = useState('');
    const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
        date: 'Select date',
        timeStart: 'HH:MM AM',
        timeEnd: 'HH:MM PM',
        attendees: 0,
    });

    const [dropdownStates, setDropdownStates] = useState({
        date: false,
        time: false,
        attendees: false,
    });

    const hasPrefilledRef = useRef(false);

    const filteredKycDoc = useMemo(
        () => kycDoc?.data?.filter((doc: any) => doc.type !== 'pan' && doc.type !== 'gst') || [],
        [kycDoc],
    );

    // Pre-fill booking form from home search data
    useEffect(() => {
        if (hasPrefilledRef.current) return;

        const { date, startTime, endTime } = homeSearchData;

        // Check if we have search data to pre-fill
        if (!date && !startTime && !endTime) return;

        hasPrefilledRef.current = true;

        const validationWarnings: string[] = [];
        let prefilledDate = 'Select date';
        let prefilledStartTime = 'HH:MM AM';
        let prefilledEndTime = 'HH:MM PM';

        // Pre-fill date
        if (date) {
            try {
                const searchDate = new Date(date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (searchDate < today) {
                    validationWarnings.push(
                        'Selected date is in the past. Please choose a future date.',
                    );
                } else {
                    prefilledDate = format(searchDate, 'MMM dd, yyyy');
                }
            } catch (error) {
                console.error('Error parsing search date:', error);
            }
        }

        // Pre-fill times
        if (startTime) {
            prefilledStartTime = startTime;
        }
        if (endTime) {
            prefilledEndTime = endTime;
        }

        // Validate time against space operating hours
        if (
            prefilledStartTime !== 'HH:MM AM' &&
            prefilledEndTime !== 'HH:MM PM' &&
            spaceData?.SpaceListing
        ) {
            const operatingHours = spaceData.SpaceListing.timeslots || [];

            if (operatingHours.length > 0) {
                const convertToMinutes = (time: string): number => {
                    try {
                        const [timePart, period] = time.split(' ');
                        const [hoursStr, minutesStr] = timePart.split(':');
                        let hour24 = parseInt(hoursStr, 10);
                        if (period === 'PM' && hour24 !== 12) hour24 += 12;
                        if (period === 'AM' && hour24 === 12) hour24 = 0;
                        return hour24 * 60 + parseInt(minutesStr, 10);
                    } catch {
                        return 0;
                    }
                };

                const startMinutes = convertToMinutes(prefilledStartTime);
                const endMinutes = convertToMinutes(prefilledEndTime);

                const isWithinOperatingHours = operatingHours.some((slot: any) => {
                    const slotStartMinutes = convertToMinutes(slot.from);
                    const slotEndMinutes = convertToMinutes(slot.to);
                    return startMinutes >= slotStartMinutes && endMinutes <= slotEndMinutes;
                });

                if (!isWithinOperatingHours) {
                    const formattedSlots = operatingHours
                        .map((slot: any) => `${slot.from} - ${slot.to}`)
                        .join(', ');
                    validationWarnings.push(
                        `Selected time is outside operating hours. Available: ${formattedSlots}`,
                    );
                }
            }

            // Check minimum booking hours
            const minBookingHours = parseFloat(spaceData.SpaceListing.min_booking_hours || '0');
            if (minBookingHours > 0) {
                const convertToMinutes = (time: string): number => {
                    try {
                        const [timePart, period] = time.split(' ');
                        const [hoursStr, minutesStr] = timePart.split(':');
                        let hour24 = parseInt(hoursStr, 10);
                        if (period === 'PM' && hour24 !== 12) hour24 += 12;
                        if (period === 'AM' && hour24 === 12) hour24 = 0;
                        return hour24 * 60 + parseInt(minutesStr, 10);
                    } catch {
                        return 0;
                    }
                };

                const startMinutes = convertToMinutes(prefilledStartTime);
                const endMinutes = convertToMinutes(prefilledEndTime);
                let durationMinutes = endMinutes - startMinutes;
                if (durationMinutes < 0) durationMinutes += 24 * 60;

                const durationHours = durationMinutes / 60;
                if (durationHours < minBookingHours) {
                    validationWarnings.push(
                        `Minimum booking duration is ${minBookingHours} hour${minBookingHours > 1 ? 's' : ''}`,
                    );
                }
            }
        }

        // Update booking details with pre-filled values
        setBookingDetails((prev) => ({
            ...prev,
            date: prefilledDate,
            timeStart: prefilledStartTime,
            timeEnd: prefilledEndTime,
        }));

        // Clear Redux search filters after pre-filling
        dispatch(clearSearchFilters());

        // Show all validation warnings as toasts
        if (validationWarnings.length > 0) {
            // Use setTimeout to ensure toasts appear after component is fully rendered
            setTimeout(() => {
                validationWarnings.forEach((warning) => {
                    toast.warning(warning, { autoClose: 5000 });
                });
            }, 500);
        }
    }, [homeSearchData, spaceData, dispatch]);

    const handleMessageChange = useCallback((value: string) => {
        if (/\d/.test(value)) {
            toast.warning('Numbers are not allowed in messages');
            return;
        }
        const { hasEmail, hasPhone } = containsPII(value);
        if (hasEmail) {
            toast.warning('Sharing email addresses is not allowed in messages');
        }
        if (hasPhone) {
            toast.warning('Sharing phone numbers is not allowed in messages');
        }
        setMessage(value);
    }, []);

    const isToday = useCallback((dateString: string) => {
        try {
            if (dateString === 'Select date') return false;
            const parsedDate = parse(dateString, 'MMM dd, yyyy', new Date());
            return dateFnsIsToday(parsedDate);
        } catch (error) {
            return false;
        }
    }, []);

    const timeToMinutes = useCallback((time: string): number => {
        if (!time || !time.includes(' ')) return 0;
        const [timePart, period] = time.split(' ');
        if (!timePart.includes(':')) return 0;
        const [hoursStr, minutesStr] = timePart.split(':');
        let hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);

        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        return hours * 60 + minutes;
    }, []);

    const getCurrentTimeInMinutes = useCallback((): number => {
        const now = new Date();
        return now.getHours() * 60 + now.getMinutes();
    }, []);

    const pricing = useMemo(() => {
        const originalBasePrice = parseFloat(spaceData?.SpaceListing?.price_per_hour) || 80;
        let discount = parseFloat(String((spaceData?.SpaceListing as any)?.discountAmount || '0'));
        if (spaceData?.SpaceListing?.isRefundable === true) {
            discount = discount + 10;
        }

        const extra_discount_per = (spaceData?.SpaceListing as any)?.extra_discount_per;
        let appliedExtraDiscount = 0;

        let minutes = 60;
        const hasStart =
            !bookingDetails.timeStart.includes('HH:MM') &&
            bookingDetails.timeStart !== 'Start time';
        const hasEnd =
            !bookingDetails.timeEnd.includes('HH:MM') && bookingDetails.timeEnd !== 'End time';

        if (bookingDetails.date !== 'Select date' && hasStart && hasEnd) {
            const startMinutes = timeToMinutes(bookingDetails.timeStart);
            const endMinutes = timeToMinutes(bookingDetails.timeEnd);
            minutes = endMinutes - startMinutes;
            if (minutes <= 0) minutes += 24 * 60; // Overnight
        }

        const durationHours = minutes / 60;

        if (typeof extra_discount_per === 'object' && extra_discount_per !== null) {
            const t12 = parseFloat(String(extra_discount_per.twelve || '0'));
            const t8 = parseFloat(String(extra_discount_per.eight || '0'));
            const t6 = parseFloat(String(extra_discount_per.six || '0'));
            const t4 = parseFloat(String(extra_discount_per.four || '0'));

            if (durationHours >= 12 && t12 > 0) appliedExtraDiscount = t12;
            else if (durationHours >= 8 && t8 > 0) appliedExtraDiscount = t8;
            else if (durationHours >= 6 && t6 > 0) appliedExtraDiscount = t6;
            else if (durationHours >= 4 && t4 > 0) appliedExtraDiscount = t4;
        }

        const isLongBooking = appliedExtraDiscount > 0;

        // Cumulative Calculation: Apply extra discount ON TOP of the already discounted base price
        const basePricePostBaseDiscount =
            discount > 0 ? originalBasePrice * (1 - discount / 100) : originalBasePrice;

        // Calculate what the price would be WITHOUT the extra discount but WITH the base discount
        const baseAmountWithoutExtra = (basePricePostBaseDiscount / 60) * Math.max(minutes, 60);

        const guestPlatformFeePercentage =
            parseFloat(bookingSettings?.guest_platform_fee || '5') / 100;
        const cgstPercentage = parseFloat(bookingSettings?.cgst || '9') / 100;
        const sgstPercentage = parseFloat(bookingSettings?.sgst || '9') / 100;

        // Calculate fees and taxes ON THE BASE AMOUNT (before extra duration discount)
        const guestPlatformFee = baseAmountWithoutExtra * guestPlatformFeePercentage;
        const subtotal = baseAmountWithoutExtra + guestPlatformFee;
        const cgstAmount = subtotal * cgstPercentage;
        const sgstAmount = subtotal * sgstPercentage;

        const grossAmountBeforeExtra = subtotal + cgstAmount + sgstAmount;

        // Calculate the extra discount amount strictly on the base rate
        const extraDiscountAmount = isLongBooking ? baseAmountWithoutExtra * (appliedExtraDiscount / 100) : 0;

        // Final total subtracts the extra discount from the fully-loaded gross amount
        const totalAmount = grossAmountBeforeExtra - extraDiscountAmount;

        // Effective discounted base price for display (if needed, though this is synthetic now)
        const discountedPrice = basePricePostBaseDiscount - (basePricePostBaseDiscount * (appliedExtraDiscount / 100));
        const baseAmount = baseAmountWithoutExtra - extraDiscountAmount;

        const gstTotalPercentage = cgstPercentage + sgstPercentage;
        const basePriceWithGST = discountedPrice * (1 + gstTotalPercentage);
        const baseAmountWithGST = baseAmount * (1 + gstTotalPercentage);

        const currentBookingHours = Math.max(minutes, 60) / 60;
        const basePriceWithAll = totalAmount / currentBookingHours;
        const baseAmountWithAll = totalAmount;

        const originalBaseAmount = originalBasePrice * currentBookingHours;
        const baseDiscountAmountValue =
            discount > 0
                ? (originalBasePrice - basePricePostBaseDiscount) * currentBookingHours
                : 0;

        const effectiveTotalDiscountPercentage =
            originalBasePrice > 0
                ? ((originalBasePrice * currentBookingHours * (1 + guestPlatformFeePercentage) * (1 + gstTotalPercentage) - totalAmount) / (originalBasePrice * currentBookingHours * (1 + guestPlatformFeePercentage) * (1 + gstTotalPercentage))) * 100
                : 0;

        const totalSavings = (originalBaseAmount * (1 + guestPlatformFeePercentage) * (1 + gstTotalPercentage)) - totalAmount;

        return {
            basePrice: discountedPrice,
            basePricePostBaseDiscount,
            basePriceWithGST,
            basePriceWithAll,
            baseAmount,
            baseAmountWithoutExtra,
            baseAmountWithGST,
            baseAmountWithAll,
            originalBasePrice,
            originalBaseAmount,
            baseDiscountAmountValue,
            guestPlatformFee,
            subtotal,
            cgstAmount,
            sgstAmount,
            totalAmount,
            bookingHours: currentBookingHours,
            isLongBooking,
            extraDiscountAmount,
            extraDiscountPercentage: appliedExtraDiscount,
            discountPercentage: effectiveTotalDiscountPercentage,
            totalSavings,
            baseDiscount: discount,
        };
    }, [spaceData, bookingSettings, bookingDetails, timeToMinutes]);

    const getValidationErrors = useCallback(() => {
        const errors = [];

        if (bookingDetails.date === 'Select date') {
            errors.push('Please select a date');
        } else {
            const selectedDate = new Date(bookingDetails.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                errors.push('Cannot book for previous dates');
            }
        }

        const hasStartTime =
            !bookingDetails.timeStart.includes('HH:MM') &&
            bookingDetails.timeStart !== 'Start time';
        const hasEndTime =
            !bookingDetails.timeEnd.includes('HH:MM') && bookingDetails.timeEnd !== 'End time';

        if (!hasStartTime || !hasEndTime) {
            errors.push('Please select start and end time');
        } else {
            const startMinutes = timeToMinutes(bookingDetails.timeStart);
            const endMinutes = timeToMinutes(bookingDetails.timeEnd);

            if (isToday(bookingDetails.date)) {
                const currentMinutes = getCurrentTimeInMinutes();
                if (startMinutes <= currentMinutes + 60) {
                    errors.push('Start time must be at least 1 hour in the future');
                }
            }
        }

        if (bookingDetails.attendees <= 0) {
            errors.push('Number of attendees must be at least 1');
        } else if (spaceData?.capacity && bookingDetails.attendees > spaceData.capacity) {
            errors.push(
                `Number of attendees cannot exceed space capacity of ${spaceData.capacity}`,
            );
        }

        const { hasEmail, hasPhone } = containsPII(message);
        if (hasEmail) errors.push('Sharing email addresses in messages is not allowed');
        if (hasPhone) errors.push('Sharing phone numbers in messages is not allowed');

        return errors;
    }, [
        bookingDetails,
        spaceData,
        timeToMinutes,
        isToday,
        getCurrentTimeInMinutes,
        message,
        containsPII,
    ]);

    const handleBook = useCallback(() => {
        if (!isAuth) {
            toast.error('Sign in required to complete this action');
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
            return;
        }

        // if (!filteredKycDoc || filteredKycDoc.length === 0) {
        //     openVerificationModal?.(true);
        //     return;
        // }

        // KYC verification check is bypassed on frontend to allow guest booking without pre-verification

        const errors = getValidationErrors();
        if (errors.length > 0) {
            errors.forEach((err) => toast.error(err));
            return;
        }

        const startTime = new Date(`${bookingDetails.date} ${bookingDetails.timeStart}`);
        let endTime = new Date(`${bookingDetails.date} ${bookingDetails.timeEnd}`);
        if (endTime <= startTime) endTime = new Date(endTime.getTime() + 24 * 60 * 60 * 1000);

        const displayTotal =
            typeof pricing.totalAmount === 'number' && !isNaN(pricing.totalAmount)
                ? pricing.totalAmount.toFixed(2)
                : '0.00';

        const bookingData = {
            spaceData,
            bookingDetails: {
                ...bookingDetails,
                startDatetime: startTime.toISOString(),
                endDatetime: endTime.toISOString(),
            },
            message,
            total: `₹${displayTotal}`,
            totalAmount: pricing.totalAmount || 0,
            customRules: spaceData?.SpaceListing?.customRules,
            cancellationPolicy: spaceData?.SpaceListing?.cancellationPolicy,
        };

        if (spaceData?.SpaceListing?.instant_booking && onInstantBooking) {
            onInstantBooking(bookingData);
        } else if (onNavigateToReview) {
            onNavigateToReview(bookingData);
        }
    }, [
        isAuth,
        filteredKycDoc,
        getValidationErrors,
        bookingDetails,
        spaceData,
        message,
        pricing.totalAmount,
        onInstantBooking,
        onNavigateToReview,
        openVerificationModal,
    ]);

    const handleBookingDetailsChange = useCallback((field: string, value: any) => {
        setBookingDetails((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleToggleDropdown = useCallback((field: 'date' | 'time' | 'attendees') => {
        setDropdownStates((prev) => ({
            date: false,
            time: false,
            attendees: false,
            [field]: !prev[field],
        }));
    }, []);

    return {
        isAuth,
        message,
        handleMessageChange,
        bookingDetails,
        dropdownStates,
        setDropdownStates,
        pricing,
        handleBook,
        handleBookingDetailsChange,
        handleToggleDropdown,
        validationErrors: getValidationErrors(),
        isToday,
        timeToMinutes,
        getCurrentTimeInMinutes,
    };
};
