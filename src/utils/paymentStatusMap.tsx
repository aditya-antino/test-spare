export const BOOKING_PAYMENT_STATUS_MAP: Record<
    string,
    { label: string; textColor: string; bgColor: string; apiValue: string }
> = {
    INSTANT: {
        label: 'Pending',
        textColor: 'text-orange-700',
        bgColor: 'bg-yellow-200',
        apiValue: 'Pending',
    },
    PENDING_NOT: {
        label: 'Request Sent',
        textColor: 'text-orange-700',
        bgColor: 'bg-yellow-200',
        apiValue: 'Pending',
    },
    CONFIRMED_PENDING: {
        label: 'Request Approved',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-200',
        apiValue: 'Pay to Confirm',
    },
    CONFIRMED_CAPTURED: {
        label: 'Booked',
        textColor: 'text-green-700',
        bgColor: 'bg-green-200',
        apiValue: 'Approved',
    },
    CONFIRMED_CAPTURED_COMPLETED: {
        label: 'Completed',
        textColor: 'text-green-700',
        bgColor: 'bg-green-200',
        apiValue: 'Completed',
    },
    CONFIRMED_CAPTURED_PENDING_PAYOUT: {
        label: 'Pending Payout',
        textColor: 'text-orange-500',
        bgColor: 'bg-orange-200',
        apiValue: 'Pending Payout',
    },
    REJECTED: {
        label: 'Rejected',
        textColor: 'text-orange-700',
        bgColor: 'bg-red-200',
        apiValue: 'Rejected',
    },
    REJECTED_CAPTURED: {
        label: 'Rejected',
        textColor: 'text-orange-700',
        bgColor: 'bg-red-200',
        apiValue: 'Rejected',
    },
    CANCELLED_CAPTURED: {
        label: 'Cancelled',
        textColor: 'text-orange-700',
        bgColor: 'bg-red-200',
        apiValue: 'Rejected',
    },
    DEFAULT: {
        label: 'Status Unknown',
        textColor: 'text-gray-700',
        bgColor: 'bg-gray-200',
        apiValue: 'Unknown',
    },
};
