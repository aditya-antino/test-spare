export enum BookingStatus {
    Processing = 'PROCESSING',
    Confirmed = 'CONFIRMED',
    Rejected = 'REJECTED',
    Completed = 'COMPLETED',
    Upcoming = 'UPCOMING',
    Cancelled = 'CANCELLED',
    Pending = 'PENDING',
    PayToConfirm = 'PAY TO CONFIRM',
    RefundPaid = 'REFUND_PAID',
    RefundPending = 'REFUND_PENDING',
    NoRefund = 'NO_REFUND',
}

export const MY_BOOKING_STATUS_TAB = [
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
];

export const AccountPageTabs = [
    { label: 'Profile', value: 'profile' },
    { label: 'Verification', value: 'verification' },
    { label: 'Link Payout', value: 'link-payout' },
];

export const GuestAccountPageTabs = [
    { label: 'Profile', value: 'profile' },
    { label: 'Verification', value: 'verification' },
    { label: 'GST', value: 'gst' },
];
