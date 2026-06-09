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

    /**
     * calculatePricing – Computes all monetary values needed for the booking.
     * This follows the SpareSpace Payment Engine Spec (v2).
     *
     * Steps:
     *   Gross Amount      = hourlyRate × totalHours
     *   Duration Discount = applied on Gross Amount (host‑configured)
     *   Discounted Base  = Gross – Duration Discount
     *   Admin Discount   = coupon % applied on Discounted Base (does NOT affect host payout)
     *   Net Base         = Discounted Base – Admin Discount
     *   Platform Fee     = Guest service fee (percentage) calculated on Discounted Base
     *   Subtotal         = Net Base + Platform Fee (taxable amount)
     *   GST (9% CGST + 9% SGST) applied on Subtotal
     *   Grand Total      = Subtotal + GST
     */
    const calculatePricing = () => {
        // Guard: ensure required data is present
        if (!currentBookingData || !spaceDetails?.data) return null;

        // Hourly rate (fallback to 0)
        const hourlyRate = parseFloat(spaceDetails.data?.SpaceListing?.price_per_hour) || 0;

        // Calculate booking duration (minutes & hours), handling overnight bookings
        const startDateStr = currentBookingData.bookingDetails.date;
        const startTimeStr = currentBookingData.bookingDetails.timeStart;
        const endTimeStr   = currentBookingData.bookingDetails.timeEnd;
        if (startTimeStr === 'Start time' || endTimeStr === 'End time') return null;
        const startTime = new Date(`${startDateStr} ${startTimeStr}`);
        let endTime = new Date(`${startDateStr} ${endTimeStr}`);
        if (endTime <= startTime) {
            // Add a day for overnight stays
            endTime = new Date(endTime.getTime() + 24 * 60 * 60 * 1000);
        }
        const bookingMinutes = Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60));
        const bookingHours   = bookingMinutes / 60;

        // 2️⃣ Determine host‑configured duration discount
        let hostDiscountPerc = 0;
        const extra_discount_per = (spaceDetails.data?.SpaceListing as any)?.extra_discount_per;
        if (typeof extra_discount_per === 'object' && extra_discount_per !== null) {
            if (bookingHours >= 12) hostDiscountPerc = parseFloat(String(extra_discount_per.twelve || '0'));
            else if (bookingHours >= 8) hostDiscountPerc = parseFloat(String(extra_discount_per.eight || '0'));
            else if (bookingHours >= 6) hostDiscountPerc = parseFloat(String(extra_discount_per.six || '0'));
            else if (bookingHours >= 4) hostDiscountPerc = parseFloat(String(extra_discount_per.four || '0'));
        } else if (extra_discount_per) {
            // Legacy single‑value discount (applies at 6+ hours)
            if (bookingHours >= 6) hostDiscountPerc = parseFloat(String(extra_discount_per || '0'));
        }
        const flatDiscountPerc = parseFloat(String((spaceDetails.data?.SpaceListing as any)?.discountAmount || '0'));
        const refundableBonus = spaceDetails.data?.SpaceListing?.isRefundable === true ? 10 : 0;
        const totalHostDiscountPerc = hostDiscountPerc + flatDiscountPerc + refundableBonus;

        // 3️⃣ Gross amount (hourly rate × total hours)
        const grossAmount = hourlyRate * bookingHours;

        // 4️⃣ Apply host (duration) discount → Discounted Base
        const durationDiscountAmount = grossAmount * (totalHostDiscountPerc / 100);
        const discountedBase = grossAmount - durationDiscountAmount;

        // 5️⃣ Admin (coupon) discount – does NOT affect host payout
        const adminDiscountPercent = couponDiscountPer; // % from coupon UI
        const adminDiscountAmount = discountedBase * (adminDiscountPercent / 100);
        const netBase = discountedBase - adminDiscountAmount;

        // 6️⃣ Platform fee – calculated on Discounted Base (pre‑admin)
        const platformFeePercent = parseFloat(bookingDetails?.data?.guest_platform_fee || '5') / 100;
        const platformFee = discountedBase * platformFeePercent;

        // 7️⃣ Subtotal – taxable amount (Net Base + Platform Fee)
        const subtotal = netBase + platformFee;

        // 8️⃣ GST – 9% CGST + 9% SGST on Subtotal
        const cgst = subtotal * 0.09;
        const sgst = subtotal * 0.09;
        const totalGST = cgst + sgst;

        // 9️⃣ Grand total – amount the guest actually pays
        const guestTotal = subtotal + totalGST;

        // Return both UI values and fields required by the backend
        return {
            grossAmount,
            durationDiscountAmount,
            discountedBase,
            adminDiscountAmount,
            netBase,
            platformFee,
            subtotal,
            cgstAmount: cgst,
            sgstAmount: sgst,
            totalGST,
            guestTotal,
            bookingMinutes,
            // Fields used downstream / payload
            baseAmount: netBase,
            preCouponBaseAmount: discountedBase,
            guestPlatformFee: platformFee,
            totalAmount: guestTotal,
            couponDiscountAmount: adminDiscountAmount,
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