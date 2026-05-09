import { BOOKING_PAYMENT_STATUS_MAP } from '@/utils/paymentStatusMap';

export enum BookingStatus {
    INSTANT = 'INSTANT',
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    REJECTED = 'REJECTED',
}

export enum PaymentStatus {
    NOT = 'NOT',
    PENDING = 'PENDING',
    CAPTURED = 'CAPTURED',
}

export function getBookingStatus(booking: any) {
    if (!booking) return { label: 'Pending', textColor: 'text-gray-500' };

    const bookingStatus = booking.status?.toUpperCase() as BookingStatus | undefined;
    const paymentStatus = booking.paymentStatus?.toUpperCase() as PaymentStatus | undefined;
    const isInstant = booking.isInstantBooking;

    const safeBookingStatus = bookingStatus ?? BookingStatus.INSTANT;
    let safePaymentStatus = paymentStatus ?? PaymentStatus.NOT;
    if (isInstant) safePaymentStatus = PaymentStatus.PENDING;

    const STATUS_COMBO_MAP: Record<string, keyof typeof BOOKING_PAYMENT_STATUS_MAP> = {
        [`${BookingStatus.PENDING}_${PaymentStatus.PENDING}`]: 'PENDING_NOT',
        [`${BookingStatus.INSTANT}_${PaymentStatus.PENDING}`]: 'INSTANT',
        [`${BookingStatus.PENDING}_${PaymentStatus.NOT}`]: 'PENDING_NOT',
        [`${BookingStatus.CONFIRMED}_${PaymentStatus.PENDING}`]: 'CONFIRMED_PENDING',
        [`${BookingStatus.CONFIRMED}_${PaymentStatus.CAPTURED}`]: 'CONFIRMED_CAPTURED',
        [`${BookingStatus.CANCELLED}_${PaymentStatus.CAPTURED}`]: 'CANCELLED_CAPTURED',
        [`${BookingStatus.REJECTED}_${PaymentStatus.PENDING}`]: 'REJECTED',
    };

    const key = `${safeBookingStatus}_${safePaymentStatus}`;
    const statusKey = STATUS_COMBO_MAP[key] || 'PENDING_NOT';

    return {
        label: BOOKING_PAYMENT_STATUS_MAP[statusKey]?.label || 'Pending',
        textColor: BOOKING_PAYMENT_STATUS_MAP[statusKey]?.textColor || 'text-gray-500',
    };
}
