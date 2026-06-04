'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { clearBookingData, updateBookingDetails, updateMessage } from '@/store/slice/bookingSlice';
import {
    useGetGuestSpaceDetails,
    useRequestBooking,
    useRazopayBookingOrder,
    useGuestInstantBooking,
    useGetGuestBookingDetails,
} from '@/services';
import {
    openRazorpayPayment,
    formatRazorpayAmount,
    generateReceipt,
    RazorpayPaymentOptions,
} from '@/lib/razorpay';
import { toast } from 'react-toastify';
import { PATHS } from '@/constants/path';
import { handleApiError } from '@/hooks/handleApiError';
import axiosInstance from '@/lib/axiosInstance';

export const useBookingReview = () => {
    const router = useRouter();
    const params = useParams();
    const dispatch = useDispatch();
    const slug = params.slug as string;

    const { bookingData, isInstantBooking } = useSelector((state: RootState) => state.booking);
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
    const [bookingId, setBookingId] = useState<number>(0);
    const [calculatedTotalAmount, setCalculatedTotalAmount] = useState<number>(0);

    const [couponCode, setCouponCode] = useState<string>('');
    const [couponDiscountPer, setCouponDiscountPer] = useState<number>(0);
    const [couponLoading, setCouponLoading] = useState<boolean>(false);
    const [couponError, setCouponError] = useState<string>('');

    const handleApplyCoupon = async (code: string) => {
        if (!code.trim()) {
            setCouponError('Please enter a coupon code');
            return;
        }
        setCouponLoading(true);
        setCouponError('');
        try {
            const response = await axiosInstance.post('/guest/coupons/validate', {
                couponCode: code,
            });
            const data = response?.data?.data || response?.data;
            if (data && data.valid) {
                const discount = parseFloat(data.discountPercentage || '0');
                setCouponDiscountPer(discount);
                setCouponCode(data.code || code);
                toast.success('Coupon applied successfully!');
            } else {
                setCouponError(data?.message || 'Invalid coupon code');
                toast.error(data?.message || 'Invalid coupon code');
            }
        } catch (error: any) {
            const errMsg = error?.response?.data?.message || error?.message || 'Failed to validate coupon';
            setCouponError(errMsg);
            toast.error(errMsg);
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setCouponCode('');
        setCouponDiscountPer(0);
        setCouponError('');
    };

    const { data: spaceDetails, isLoading: isSpaceLoading } = useGetGuestSpaceDetails(
        { slug },
        { enabled: !!slug },
    );

    const spaceId = spaceDetails?.data?.id;
    const { data: bookingDetails } = useGetGuestBookingDetails();

    useEffect(() => {
        if (!slug) {
            router.push(PATHS.SPACE_LISTING_PAGE_GUEST);
        }
    }, [slug, router]);

    const requestBookingMutation = useRequestBooking({
        onSuccess: () => setShowSuccessModal(true),
        onError: (error) => {
            handleApiError(error);
            if (error?.message === 'Login Required!') {
                window.location.href = '/login';
            }
        },
    });

    const razorpayOrderMutation = useRazopayBookingOrder({
        onSuccess: (orderData) => {
            const orderObj =
                orderData?.data?.order || orderData?.order || orderData?.data || orderData;
            const orderId = orderObj?.id;
            if (!orderId) return;

            const amountFromOrder = Number(orderObj?.amount);
            const fallbackAmount = formatRazorpayAmount(currentBookingData?.totalAmount || 0);
            const amountToUse =
                Number.isFinite(amountFromOrder) && amountFromOrder > 0
                    ? amountFromOrder
                    : fallbackAmount;

            const options: RazorpayPaymentOptions = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID_STAGE as string,
                order_id: orderId,
                amount: amountToUse,
                currency: orderObj?.currency || 'INR',
                name: 'Spare Space',
                description: 'Space Booking Payment',
                prefill: {
                    name: 'Guest User',
                    email: 'guest@example.com',
                    contact: '+919876543210',
                },
                notes: { purpose: 'space booking' },
                theme: { color: '#F7CD29' },
                handler: () => {
                    router.push(`${PATHS.GUEST_MY_BOOKINGS}?bookingSuccess=true`);
                },
                modal: {
                    ondismiss: () => setBookingId(0),
                },
            };
            openRazorpayPayment(options);
        },
        onError: (error) => {
            console.error('Razorpay order creation failed:', error);
            toast.error('Payment initialization failed');
        },
    });

    const instantBookingMutation = useGuestInstantBooking({
        onSuccess: (data) => {
            const resBookingId = data?.data?.id;
            setBookingId(resBookingId);
            const razorpayPayload = {
                bookingId: resBookingId,
                amount: isInstantBooking
                    ? calculatedTotalAmount || currentBookingData?.totalAmount || 0
                    : currentBookingData?.totalAmount || 0,
                currency: 'INR',
                receipt: generateReceipt(resBookingId),
                notes: { purpose: 'space booking' },
            };
            razorpayOrderMutation.mutate(razorpayPayload);
        },
        onError: (error) => {
            console.error('❌ Instant booking failed:', error);
            toast.error('Instant booking failed. Please try again.');
        },
    });

    const currentBookingData = bookingData || {
        bookingDetails: {
            date: 'Aug 12, 2025',
            timeStart: '09:00 AM',
            timeEnd: '05:00 PM',
            attendees: 1,
        },
        message: '',
        priceItems: [],
        total: '',
        totalAmount: 0,
    };

    const calculatePricing = () => {
        if (!currentBookingData || !spaceDetails?.data) return null;

        const originalBasePrice =
            parseFloat(spaceDetails.data?.SpaceListing?.price_per_hour) || 500;

        // 1. Calculate Minutes (Handle overnight)
        const startDateStr = currentBookingData.bookingDetails.date;
        const startTimeStr = currentBookingData.bookingDetails.timeStart;
        const endTimeStr = currentBookingData.bookingDetails.timeEnd;

        if (startTimeStr === 'Start time' || endTimeStr === 'End time') return null;

        const startTime = new Date(`${startDateStr} ${startTimeStr}`);
        let endTime = new Date(`${startDateStr} ${endTimeStr}`);

        if (endTime <= startTime) {
            endTime = new Date(endTime.getTime() + 24 * 60 * 60 * 1000);
        }

        const bookingMinutes = Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60));

        // 2. Discounts
        let baseDiscountPercentage = parseFloat(
            String((spaceDetails.data?.SpaceListing as any)?.discountAmount || '0'),
        );
        if (spaceDetails.data?.SpaceListing?.isRefundable === true) {
            baseDiscountPercentage += 10;
        }

        const extra_discount_per = (spaceDetails.data?.SpaceListing as any)?.extra_discount_per;
        let appliedExtraDiscountPercentage = 0;
        const durationHours = bookingMinutes / 60;

        if (typeof extra_discount_per === 'object' && extra_discount_per !== null) {
            // Tiered discounts are inclusive of the start hour (e.g., 4+ applies starting at exactly 4.0 hours)
            if (durationHours >= 12)
                appliedExtraDiscountPercentage = parseFloat(
                    String(extra_discount_per.twelve || '0'),
                );
            else if (durationHours >= 8)
                appliedExtraDiscountPercentage = parseFloat(
                    String(extra_discount_per.eight || '0'),
                );
            else if (durationHours >= 6)
                appliedExtraDiscountPercentage = parseFloat(String(extra_discount_per.six || '0'));
            else if (durationHours >= 4)
                appliedExtraDiscountPercentage = parseFloat(String(extra_discount_per.four || '0'));
        } else {
            // Fallback for legacy single-value extra discount (inclusive at 6+ hours)
            if (durationHours >= 6)
                appliedExtraDiscountPercentage = parseFloat(String(extra_discount_per || '0'));
        }

        // Cumulative Calculation: Apply extra discount ON TOP of the already discounted base price
        const basePricePostBaseDiscount =
            baseDiscountPercentage > 0
                ? originalBasePrice * (1 - baseDiscountPercentage / 100)
                : originalBasePrice;

        const effectiveBasePrice = basePricePostBaseDiscount; // Taxes applying on undiscounted rate
        const pricePerMinute = effectiveBasePrice / 60;
        const baseAmount = pricePerMinute * bookingMinutes;

        // 4. Fees and Taxes
        const guestPlatformFeePercentage =
            parseFloat(bookingDetails?.data?.guest_platform_fee || '5') / 100;
        const cgstPercentage = parseFloat(bookingDetails?.data?.cgst || '9') / 100;
        const sgstPercentage = parseFloat(bookingDetails?.data?.sgst || '9') / 100;

        // Calculate fees and taxes ON THE BASE AMOUNT (before extra duration discount or coupon discount)
        const guestPlatformFee = baseAmount * guestPlatformFeePercentage;
        const subtotal = baseAmount + guestPlatformFee;
        const cgstAmount = subtotal * cgstPercentage;
        const sgstAmount = subtotal * sgstPercentage;
        const grossAmountBeforeExtra = subtotal + cgstAmount + sgstAmount;

        // Extra discount applied strictly to the base rate
        const extraDiscountAmount = appliedExtraDiscountPercentage > 0 ? baseAmount * (appliedExtraDiscountPercentage / 100) : 0;
        const totalAmountBeforeCoupon = grossAmountBeforeExtra - extraDiscountAmount;

        // Coupon discount (admin discount) applied on base amount
        const couponDiscountAmount = couponDiscountPer > 0 ? baseAmount * (couponDiscountPer / 100) : 0;
        const totalAmount = totalAmountBeforeCoupon - couponDiscountAmount;

        return {
            baseAmount: baseAmount - extraDiscountAmount - couponDiscountAmount, // For UI display only
            preCouponBaseAmount: baseAmount - extraDiscountAmount,               // Original base sent to backend
            guestPlatformFee,
            cgstAmount,
            sgstAmount,
            totalAmount,
            bookingMinutes,
            couponDiscountAmount,
        };
    };

    const createBookingDatetime = (date: string, time: string, isEndTime: boolean = false) => {
        const baseDate = new Date(date);
        const [timePart, period] = time.split(' ');
        const [hours, minutes] = timePart.split(':');
        let hour24 = parseInt(hours);
        if (period === 'PM' && hour24 !== 12) hour24 += 12;
        if (period === 'AM' && hour24 === 12) hour24 = 0;

        const bookingDate = new Date(baseDate);
        bookingDate.setHours(hour24, parseInt(minutes), 0, 0);

        if (isEndTime) {
            const [startPart, startPeriod] = currentBookingData.bookingDetails.timeStart.split(' ');
            const [startH] = startPart.split(':');
            let startH24 = parseInt(startH);
            if (startPeriod === 'PM' && startH24 !== 12) startH24 += 12;
            if (startPeriod === 'AM' && startH24 === 12) startH24 = 0;

            const startDate = new Date(baseDate);
            startDate.setHours(startH24, parseInt(startPart.split(':')[1]), 0, 0);

            if (bookingDate <= startDate) {
                bookingDate.setTime(bookingDate.getTime() + 24 * 60 * 60 * 1000);
            }
        }
        return bookingDate;
    };

    const handleInstantBookingPayment = () => {
        const pricing = calculatePricing();
        if (!pricing || !spaceId) return;

        setCalculatedTotalAmount(pricing.totalAmount);

        const startDateTime = createBookingDatetime(
            currentBookingData.bookingDetails.date,
            currentBookingData.bookingDetails.timeStart,
            false,
        ).toISOString();
        const endDateTime = createBookingDatetime(
            currentBookingData.bookingDetails.date,
            currentBookingData.bookingDetails.timeEnd,
            true,
        ).toISOString();

        instantBookingMutation.mutate({
            spaceId: parseInt(spaceId.toString()),
            startDatetime: startDateTime,
            endDatetime: endDateTime,
            attendees: currentBookingData.bookingDetails.attendees,
            guestMessage: currentBookingData.message || '',
            amount: pricing.preCouponBaseAmount,      // Original base amount (pre-coupon) for host payout
            guestPlatformFee: pricing.guestPlatformFee,
            cgst: pricing.cgstAmount,
            sgst: pricing.sgstAmount,
            totalAmount: pricing.totalAmount,          // Guest-facing reduced total (Razorpay charge)
            discountAmount: pricing.couponDiscountAmount, // Coupon discount amount
            couponCode: couponCode || null,
        } as any);
    };

    const handleRequestToBook = () => {
        const pricing = calculatePricing();
        if (!pricing || !spaceId) return;

        const startDateTime = createBookingDatetime(
            currentBookingData.bookingDetails.date,
            currentBookingData.bookingDetails.timeStart,
            false,
        ).toISOString();
        const endDateTime = createBookingDatetime(
            currentBookingData.bookingDetails.date,
            currentBookingData.bookingDetails.timeEnd,
            true,
        ).toISOString();

        requestBookingMutation.mutate({
            spaceId: parseInt(spaceId.toString()),
            startDatetime: startDateTime,
            endDatetime: endDateTime,
            attendees: currentBookingData.bookingDetails.attendees,
            guestMessage: currentBookingData.message || '',
            amount: pricing.preCouponBaseAmount,      // Original base amount (pre-coupon) for host payout
            guestPlatformFee: pricing.guestPlatformFee,
            cgst: pricing.cgstAmount,
            sgst: pricing.sgstAmount,
            totalAmount: pricing.totalAmount,          // Guest-facing reduced total (Razorpay charge)
            discountAmount: pricing.couponDiscountAmount, // Coupon discount amount
            couponCode: couponCode || null,
        } as any);
    };

    const handleBack = () => router.back();

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        dispatch(clearBookingData());
        router.push(`${PATHS.GUEST_MY_BOOKINGS}?bookingSuccess=true`);
    };

    const handleMessageChange = (message: string) => dispatch(updateMessage(message));

    const handleBookingDetailsChange = (field: string, value: any) => {
        dispatch(updateBookingDetails({ [field]: value }));
    };

    return {
        spaceDetails,
        isSpaceLoading,
        bookingDetails,
        currentBookingData,
        isInstantBooking,
        showSuccessModal,
        handleInstantBookingPayment,
        handleRequestToBook,
        handleBack,
        handleSuccessModalClose,
        handleMessageChange,
        handleBookingDetailsChange,
        isLoading:
            requestBookingMutation.isPending ||
            instantBookingMutation.isPending ||
            razorpayOrderMutation.isPending,
        // Coupon Code fields
        couponCode,
        couponDiscountPer,
        couponLoading,
        couponError,
        handleApplyCoupon,
        handleRemoveCoupon,
    };
};
