'use client';

import { cn } from '@/lib/utils';
import { BookingStatus } from '@/constants/booking-status';

interface StatusBadgeProps {
    status: string;
    className?: string;
    variant?: 'default' | 'pill' | 'outline';
}

const statusStyles: Record<BookingStatus, { default: string; pill: string; outline: string }> = {
    [BookingStatus.Processing]: {
        default: 'bg-orange-100 text-[#FFA756]',
        pill: 'bg-orange-100 text-[#FFA756] rounded-full px-3 py-1',
        outline: 'border border-orange-300 text-[#FFA756] bg-white',
    },
    [BookingStatus.Confirmed]: {
        default: 'bg-green-100 text-[#00B69B]',
        pill: 'bg-green-100 text-[#00B69B] rounded-full px-3 py-1',
        outline: 'border border-green-300 text-[#00B69B] bg-white',
    },
    [BookingStatus.Rejected]: {
        default: 'bg-red-100 text-[#EF3826]',
        pill: 'bg-red-100 text-[#EF3826] rounded-full px-3 py-1',
        outline: 'border border-red-300 text-[#EF3826] bg-white',
    },
    [BookingStatus.Completed]: {
        default: 'bg-green-100 text-[#00B69B]',
        pill: 'bg-green-100 text-[#00B69B] rounded-full px-3 py-1',
        outline: 'border border-green-300 text-[#00B69B] bg-white',
    },
    [BookingStatus.Upcoming]: {
        default: 'bg-blue-100 text-blue-600',
        pill: 'bg-blue-100 text-blue-600 rounded-full px-3 py-1',
        outline: 'border border-blue-300 text-blue-600 bg-white',
    },
    [BookingStatus.Cancelled]: {
        default: 'bg-gray-100 text-gray-600',
        pill: 'bg-gray-100 text-gray-600 rounded-full px-3 py-1',
        outline: 'border border-gray-300 text-gray-600 bg-white',
    },
    [BookingStatus.Pending]: {
        default: 'bg-orange-100 text-[#FFA756]',
        pill: 'bg-orange-100 text-[#FFA756] rounded-full px-3 py-1',
        outline: 'border border-orange-300 text-[#FFA756] bg-white',
    },
    [BookingStatus.PayToConfirm]: {
        default: 'bg-[#DED5F9] text-[#6226EF]',
        pill: 'bg-[#DED5F9] text-[#6226EF] rounded-full px-3 py-1',
        outline: 'border border-orange-300 text-[#6226EF] bg-white',
    },
    [BookingStatus.RefundPaid]: {
        default: 'bg-green-100 text-green-600',
        pill: 'bg-green-100 text-green-600 rounded-full px-3 py-1',
        outline: 'border border-green-300 text-green-600 bg-white',
    },
    [BookingStatus.RefundPending]: {
        default: 'bg-yellow-100 text-yellow-700',
        pill: 'bg-yellow-100 text-yellow-700 rounded-full px-3 py-1',
        outline: 'border border-yellow-300 text-yellow-700 bg-white',
    },
    [BookingStatus.NoRefund]: {
        default: 'bg-gray-200 text-gray-500',
        pill: 'bg-gray-200 text-gray-500 rounded-full px-3 py-1',
        outline: 'border border-gray-300 text-gray-500 bg-white',
    },
};

export function StatusBadge({ status, className, variant = 'default' }: StatusBadgeProps) {
    const normalizeStatus = (status?: string) => {
        if (!status) return '';
        return status.toLowerCase().replace(/_/g, ' ');
    };

    const normalizedInput = normalizeStatus(status);

    const normalizedStatus =
        Object.values(BookingStatus).find((s) => normalizeStatus(s) === normalizedInput) ||
        BookingStatus.Pending;

    return (
        <span
            className={cn(
                'px-2 py-1 rounded-sm text-xs font-semibold capitalize',
                statusStyles[normalizedStatus][variant],
                className,
            )}
        >
            {normalizedStatus.replace(/_/g, ' ').toLowerCase()}
        </span>
    );
}
