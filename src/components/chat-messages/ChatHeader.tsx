'use client';

import { ChevronLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Conversation } from '@/types/chat';
import { BOOKING_PAYMENT_STATUS_MAP } from '@/utils/paymentStatusMap';
import { PATHS } from '@/constants/path';

enum BookingStatus {
    INSTANT = 'INSTANT',
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    REJECTED = 'REJECTED',
}

enum PaymentStatus {
    NOT = 'NOT',
    PENDING = 'PENDING',
    CAPTURED = 'CAPTURED',
}

type Props = {
    selectedChat: Conversation;
    setShowSidebar: (val: boolean) => void;
    setShowDetails: (val: boolean) => void;
    bookingDetails?: {
        paymentStatus?: string;
        status?: string;
        isPayout?: boolean;
        isInstantBooking?: boolean;
    };
    isInHost: boolean;
};

export default function ChatHeader({
    selectedChat,
    setShowSidebar,
    setShowDetails,
    bookingDetails,
    isInHost = false,
}: Props) {
    const participant = isInHost ? selectedChat.User : selectedChat.receiver;

    const firstName = participant?.firstName || 'Unknown';
    const lastName = participant?.lastName ? participant.lastName[0] + '.' : '';

    const avatar = participant?.avatar || '/image';

    const getBookingStatus = (status?: string): BookingStatus => {
        const upperStatus = status?.toUpperCase() as BookingStatus;
        return upperStatus || BookingStatus.INSTANT;
    };

    const getPaymentStatus = (paymentStatus?: string, isInstantBooking?: boolean): PaymentStatus => {
        const upperStatus = paymentStatus?.toUpperCase() as PaymentStatus;
        let status = upperStatus || PaymentStatus.NOT;

        if (isInstantBooking && status !== PaymentStatus.CAPTURED) {
            status = PaymentStatus.PENDING;
        }

        return status;
    };

    const getStatusKey = (bookingStatus: BookingStatus, paymentStatus: PaymentStatus, isPayout?: boolean, isInHost?: boolean): string => {
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
        
        // Check for completed status: CONFIRMED + CAPTURED + isPayout = true
        if (bookingStatus === BookingStatus.CONFIRMED && paymentStatus === PaymentStatus.CAPTURED) {
            if (isPayout === true) {
                return 'CONFIRMED_CAPTURED_COMPLETED';
            } else {
                // Only show "Pending Payout" in host mode, guests should see "Booked"
                if (isInHost) {
                    return 'CONFIRMED_CAPTURED_PENDING_PAYOUT';
                } else {
                    return 'CONFIRMED_CAPTURED';
                }
            }
        }
        
        return STATUS_COMBO_MAP[key] || 'STATUS_UNKNOWN';
    };

    const bookingStatus = getBookingStatus(bookingDetails?.status);
    const paymentStatus = getPaymentStatus(
        bookingDetails?.paymentStatus,
        bookingDetails?.isInstantBooking,
    );
    const statusKey = getStatusKey(bookingStatus, paymentStatus, bookingDetails?.isPayout, isInHost);
    const { label, textColor } =
        BOOKING_PAYMENT_STATUS_MAP[statusKey] || BOOKING_PAYMENT_STATUS_MAP.DEFAULT;

    const handleNavigateToGuestDetails = () => {
        const hostId = selectedChat?.User?.id;
        const receiverId = selectedChat?.receiver?.id;

        if (!hostId && !receiverId) return;

        if (isInHost && hostId) {
            window.open(`${PATHS.GUEST_DETAILS}/${hostId}`, '_blank', 'noopener,noreferrer');
            return;
        }

        if (receiverId) {
            window.open(
                `${PATHS.GUEST_HOST_PROFILE}/${receiverId}`,
                '_blank',
                'noopener,noreferrer',
            );
        }
    };

    return (
        <div className="p-2 py-1 bg-white border-b-2 flex items-center justify-between relative">
            <div className="flex items-center">
                <button className="mr-2 md:hidden" onClick={() => setShowSidebar(true)}>
                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                </button>

                <div className="flex items-center">
                    <Avatar className="w-12 h-12 mr-3">
                        <AvatarImage src={avatar} />
                        <AvatarFallback>
                            {firstName[0] && lastName[0] ? `${firstName[0]}${lastName[0]}` : 'U'}
                        </AvatarFallback>
                    </Avatar>

                    <div>
                        {/* <p
                            className={`text-sm flex items-center ${textColor} md:hidden font-medium`}
                        >
                            <span className="inline-block w-2 h-2 rounded-full bg-[currentColor] mr-1" />
                            <span
                                className={`inline-block px-1 py-0.5 text-xs font-medium rounded-full ${textColor}`}
                            >
                                {label}
                            </span>
                        </p> */}

                        <h2
                            className="font-semibold text-2xl text-gray-900 cursor-pointer hover:underline"
                            onClick={handleNavigateToGuestDetails}
                        >
                            {`${firstName} ${lastName}`}
                        </h2>
                    </div>
                </div>
            </div>

            <button
                onClick={() => setShowDetails(true)}
                className="px-3 py-2 border text-gray-700 rounded-full md:hidden text-sm font-medium transition cursor-pointer"
            >
                Details
            </button>
        </div>
    );
}
