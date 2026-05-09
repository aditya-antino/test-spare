
import { BookingStatus, PaymentStatus } from '@/types/booking.types';
import { BOOKING_PAYMENT_STATUS_MAP } from '@/utils/paymentStatusMap';

export const getBookingStatus = (status?: string): BookingStatus => {
    const upperStatus = status?.toUpperCase() as BookingStatus;
    return upperStatus || BookingStatus.INSTANT;
};

export const getPaymentStatus = (paymentStatus?: string, isInstantBooking?: boolean): PaymentStatus => {
    const upperStatus = paymentStatus?.toUpperCase() as PaymentStatus;
    let status = upperStatus || PaymentStatus.NOT;

    if (isInstantBooking && status !== PaymentStatus.CAPTURED) {
        status = PaymentStatus.PENDING;
    }

    return status;
};

export const getStatusKey = (
    bookingStatus: BookingStatus,
    paymentStatus: PaymentStatus,
    isPast: boolean,
    isPayout?: boolean,
    isInHost?: boolean
): string => {
    const STATUS_COMBO_MAP: Record<string, keyof typeof BOOKING_PAYMENT_STATUS_MAP> = {
        [`${BookingStatus.PENDING}_${PaymentStatus.PENDING}`]: 'PENDING_NOT',
        [`${BookingStatus.INSTANT}_${PaymentStatus.PENDING}`]: 'INSTANT',
        [`${BookingStatus.PENDING}_${PaymentStatus.NOT}`]: 'PENDING_NOT',
        [`${BookingStatus.CONFIRMED}_${PaymentStatus.PENDING}`]: 'CONFIRMED_PENDING',
        [`${BookingStatus.CONFIRMED}_${PaymentStatus.CAPTURED}`]: 'CONFIRMED_CAPTURED',
        [`${BookingStatus.CANCELLED}_${PaymentStatus.CAPTURED}`]: 'CANCELLED_CAPTURED',
        [`${BookingStatus.REJECTED}_${PaymentStatus.PENDING}`]: 'REJECTED',
    };

    const key = `${bookingStatus}_${paymentStatus}`;

    if (bookingStatus === BookingStatus.CONFIRMED && paymentStatus === PaymentStatus.CAPTURED) {
        if (isPayout === true) {
            return 'CONFIRMED_CAPTURED_COMPLETED';
        }

        if (isInHost && isPast) {
            return 'CONFIRMED_CAPTURED_PENDING_PAYOUT';
        }

        return 'CONFIRMED_CAPTURED';
    }

    return STATUS_COMBO_MAP[key] || 'STATUS_UNKNOWN';
};
