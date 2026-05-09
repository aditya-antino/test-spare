'use client';

import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import ConversationItem from './ConversationItem';
import { Conversation } from '@/types/chat';
import { BookingDetailsType } from '@/types/booking.types';
import { setBookingData } from '@/store/slice/bookingSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { usePathname } from 'next/navigation';
import { useNotificationUnReadCount } from '@/services';
import { setChatBadge } from '@/store/slice/headerNotificationSlice';
import { BOOKING_PAYMENT_STATUS_MAP } from '@/utils/paymentStatusMap';

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

const getStatusKey = (
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
        // Completed payout
        if (isPayout === true) {
            return 'CONFIRMED_CAPTURED_COMPLETED';
        }

        // Pending payout ONLY after booking is over AND host view
        if (isInHost && isPast) {
            return 'CONFIRMED_CAPTURED_PENDING_PAYOUT';
        }

        // Default booked state
        return 'CONFIRMED_CAPTURED';
    }

    return STATUS_COMBO_MAP[key] || 'STATUS_UNKNOWN';
};

type Props = {
    conversations: Conversation[];
    active: 'all' | 'unread';
    setActive: (val: 'all' | 'unread') => void;
    selectedChat: Conversation | null;
    setSelectedChat: (c: Conversation) => void;
    showSidebar: boolean;
    setShowSidebar: (val: boolean) => void;
    searchTerm?: string;
    setSearchTerm?: (v: string) => void;
    isInHost?: boolean;
    bookingDetails?: BookingDetailsType | null;
    setBookingData?: React.Dispatch<React.SetStateAction<BookingDetailsType | null>>;
    setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
};

export default function Sidebar({
    conversations,
    active,
    setActive,
    selectedChat,
    setSelectedChat,
    showSidebar,
    setShowSidebar,
    searchTerm = '',
    setSearchTerm,
    isInHost = false,
    bookingDetails,
    setBookingData,
    setConversations,
}: Props) {
    const pathname = usePathname();
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);

    const { isAuth = false } = useSelector((state: RootState) => state.auth);
    const role = isInHost ? 2 : 3;

    const handleSearch = (val: string) => {
        setSearchTerm?.(val);
    };

    const handleIsBookingStatusUpdate = (conv: Conversation) => () => {
        if (!conv?.id) return;
        const updatedConversations = conversations.map((c) => {
            if (c.id === conv.id) {
                return { ...c, isBookingStatusUpdate: false };
            }
            return c;
        });

        setConversations(updatedConversations);


        const updatedConv = { ...conv, isBookingStatusUpdate: false, unreadCount: 0 };
        setSelectedChat(updatedConv);

        setShowSidebar(false);
    };

    return (
        <div
            className={`w-1/3 max-md:w-full max-w-md pr-1 bg-white border-r-2 flex flex-col h-full overflow-auto
    scrollbar-hide ${!showSidebar && 'hidden md:flex'}`}
        >
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-semibold text-[#F6CD28]">Messages</h1>
                    <div className="relative">
                        {!open ? (
                            <Search
                                className="text-black cursor-pointer"
                                onClick={() => setOpen(true)}
                            />
                        ) : (
                            <div className="flex items-center gap-2">
                                <Input
                                    autoFocus
                                    type="text"
                                    placeholder="Search..."
                                    className="pl-3"
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                                <X
                                    className="cursor-pointer text-gray-500 hover:text-black"
                                    onClick={() => {
                                        handleSearch('');
                                        setOpen(false);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-2 mt-2">
                    <button
                        onClick={() => setActive('all')}
                        className={`px-3 py-2 rounded-full text-sm shadow-sm font-medium transition cursor-pointer ${active === 'all'
                            ? 'bg-[#F6CD28] shadow'
                            : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setActive('unread')}
                        className={`px-4 py-1.5 rounded-full shadow-sm text-sm font-medium transition cursor-pointer ${active === 'unread'
                            ? 'bg-[#F6CD28] shadow'
                            : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                            }`}
                    >
                        Unread
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="pr-6">
                    {conversations.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No conversations found</div>
                    ) : (
                        conversations.map((conv) => {
                            const isSelectedChat = selectedChat?.id === conv.id;
                            const useBookingDetails = isSelectedChat && bookingDetails;

                            // Get booking status and payment status
                            const bookingStatusValue = useBookingDetails
                                ? bookingDetails.status
                                : (conv.booking?.status || conv.bookingStatus);
                            const paymentStatusValue = useBookingDetails
                                ? bookingDetails.paymentStatus
                                : (conv.booking?.Payments?.[0]?.status || conv.paymentStatus);
                            const isInstantBookingValue = useBookingDetails
                                ? bookingDetails.isInstantBooking
                                : (conv.booking?.Space?.SpaceListing?.instant_booking || false);
                            const isPayoutValue = useBookingDetails
                                ? bookingDetails.isPayout
                                : (conv.isPayout ?? conv.booking?.isPayout);

                            // Calculate isPast from booking end date
                            const now = new Date();
                            const endDateTime = useBookingDetails
                                ? bookingDetails.endDateTime
                                : conv.booking?.end_date_time;

                            const endDate = endDateTime ? new Date(endDateTime) : null;
                            const isPast = endDate !== null && endDate < now;

                            // Get status key and config
                            const bookingStatus = getBookingStatus(bookingStatusValue);
                            const paymentStatus = getPaymentStatus(
                                paymentStatusValue,
                                isInstantBookingValue,
                            );
                            const statusKey = getStatusKey(
                                bookingStatus,
                                paymentStatus,
                                isPast,
                                isPayoutValue,
                                isInHost
                            );
                            const statusConfig =
                                BOOKING_PAYMENT_STATUS_MAP[statusKey] || BOOKING_PAYMENT_STATUS_MAP.DEFAULT;

                            return (
                                <ConversationItem
                                    key={conv.id}
                                    conv={conv}
                                    selected={selectedChat?.id === conv.id}
                                    onClick={handleIsBookingStatusUpdate(conv)}
                                    statusLabel={statusConfig.label}
                                // textColor={statusConfig.textColor}
                                />
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}