'use client';

import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { Check, Download, Phone, X } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

import { capitalizeWord } from '@/utils/helperFunctions';
import { BOOKING_PAYMENT_STATUS_MAP } from '@/utils/paymentStatusMap';
import { getInvoices } from '@/services/invoice.services';
import { handleApiError } from '@/hooks/handleApiError';
import {
    calculateHostPayout,
    getGuestPayoutAmounts,
    getHostPayoutAmounts,
} from '@/utils/payoutCalculations';
import {
    useApproveBooking,
    useGetCancellationDataByBookingID,
    useGetGSTDetails,
} from '@/services';
import { formatGSTForDisplay } from '@/utils/gstHelpers';

import {
    BookingAmounts,
    GuestCancellationAmounts,
    HostCancellationAmounts,
    RegularBookingAmounts,
} from '@/components/booking/details/BookingAmounts';
import { AmountRow, TotalRow } from '@/components/booking/details/BookingRows';
import { setBookingData, setIsInstantBooking } from '@/store/slice/bookingSlice';

import { PATHS } from '@/constants/path';

import { BookingStatus, PaymentStatus, BookingDetailsType } from '@/types/booking.types';



interface AmountRowProps {
    label: string;
    value: number | string;
    isNegative?: boolean;
    isPositive?: boolean;
}

interface ContactInfoProps {
    bookingDetails: BookingDetailsType;
    isInHost: boolean;
}

interface TotalRowProps {
    label: string;
    value: number | string;
    isPositive?: boolean;
}

interface AddressInfoProps {
    bookingDetails: BookingDetailsType;
    displayFullDetails: boolean;
}

interface BookingHeaderProps {
    bookingDetails: BookingDetailsType;
    isInHost: boolean;
    displayUser: any;
    statusLabel: string;
    textColor: string;
    displayFullDetails: boolean;
    isPast: boolean;
}

interface GuestCancellationAmountsProps {
    guestPayout: any;
    isCancelledByGuest?: boolean;
    state?: string;
}

interface BookingAmountsProps {
    bookingDetails: BookingDetailsType;
    isInHost: boolean;
    isCancelled: boolean;
    displayFullDetails: boolean;
}

interface RegularBookingAmountsProps {
    bookingDetails: BookingDetailsType;
    isInHost: boolean;
}

interface InvoiceButtonProps {
    onClick: () => void;
    text: string;
}

interface InvoiceButtonsProps {
    handleDownloadGuestInvoice: (type: string, isCancellation?: boolean) => Promise<void>;
    bookingDetails: BookingDetailsType;
    isCancelled?: boolean;
}

interface TimeInfoProps {
    bookingDetails: BookingDetailsType;
}

interface HostActionButtonsProps {
    setRejectedModalView: React.Dispatch<React.SetStateAction<boolean>>;
    approveBooking: () => void;
    setAcceptModalView: React.Dispatch<React.SetStateAction<boolean>>;
}

import { formatCurrency } from '@/lib/utils';

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
    isPayout: boolean,
    isInHost: boolean
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

        // Default booked state (guest OR host before completion)
        return 'CONFIRMED_CAPTURED';
    }

    return STATUS_COMBO_MAP[key] || 'STATUS_UNKNOWN';
};

function getUserDisplayInfo(bookingDetails: BookingDetailsType, isInHost: boolean) {
    if (!isInHost) {
        return {
            name: bookingDetails.receiver
                ? `${bookingDetails.receiver.firstName || ''} ${bookingDetails.receiver.lastName || ''}`.trim() ||
                'Guest Name'
                : 'Guest Name',
            avatar: bookingDetails.receiver?.avatar || '/placeholder.jpg',
        };
    }

    return {
        name: bookingDetails.hostName || 'Host Name',
        avatar: bookingDetails.hostAvatar || '/placeholder.jpg',
    };
}
const ContactInfo = ({ bookingDetails, isInHost }: ContactInfoProps) => {
    const phoneNumber = isInHost
        ? bookingDetails?.hostUserMobileNumber
        : bookingDetails?.receiver?.phoneNumber;

    // Hide phone number if booking is completed
    const isCompleted = bookingDetails?.status?.toLowerCase() === 'completed';

    if (!phoneNumber || isCompleted) return null;

    return (
        <div className="flex items-center gap-2 pt-2 text-gray-700 font-semibold">
            <Phone className="w-4 h-4 text-gray-600" />
            <span>{phoneNumber}</span>
        </div>
    );
};

const AddressInfo = ({ bookingDetails, displayFullDetails }: AddressInfoProps) => {
    if (displayFullDetails) {
        const addressParts = [
            bookingDetails.address,
            bookingDetails.area,
            bookingDetails.locality,
            bookingDetails.city,
            bookingDetails.state,
            bookingDetails.pincode ? bookingDetails.pincode : null,
        ].filter(Boolean);

        if (addressParts.length === 0) return null;

        return (
            <div className="flex flex-row gap-2 items-center justify-center">
                <p className="text-sm text-gray-600">{addressParts.join(', ')}</p>
            </div>
        );
    }

    const hiddenAddress = [bookingDetails.city, bookingDetails.state].filter(Boolean);

    if (hiddenAddress.length === 0) return null;

    return <p className="text-sm text-gray-600">{hiddenAddress.join(', ')}</p>;
};

const TimeInfo = ({ bookingDetails }: TimeInfoProps) => {
    const startTime = bookingDetails.startDateTime
        ? format(new Date(bookingDetails.startDateTime), 'dd MMM yyyy, hh:mm a')
        : '-';

    const endTime = bookingDetails.endDateTime
        ? format(new Date(bookingDetails.endDateTime), 'hh:mm a')
        : '-';

    return (
        <p className="text-sm text-gray-600">
            {startTime} - {endTime}
        </p>
    );
};

const BookingHeader = ({
    bookingDetails,
    isInHost,
    displayUser,
    statusLabel,
    textColor,
    displayFullDetails,
    isPast,
}: BookingHeaderProps) => {
    const router = useRouter();

    const handleNavigateToGuestDetails = () => {
        const hostId = bookingDetails?.hostId;
        const receiverId = bookingDetails?.receiver?.id;

        if (!hostId && !receiverId) return;

        const url =
            isInHost && hostId
                ? `${PATHS.GUEST_DETAILS}/${hostId}`
                : receiverId
                    ? `${PATHS.GUEST_HOST_PROFILE}/${receiverId}`
                    : null;

        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const handleNavigateToSpace = () => {
        if (bookingDetails.spaceSlug) {
            router.push(`${PATHS.GUEST_SPACE_DETAILS}/${bookingDetails.spaceSlug}`);
        } else {
            console.warn('Space slug is missing, cannot navigate to space details');
        }
    };

    return (
        <>
            <h2 className="text-lg font-semibold text-yellow-500">Booking Details</h2>
            <div className="flex justify-between items-center">
                <div>
                    <p className={`text-sm flex items-center ${textColor}`}>
                        <span className="inline-block w-2 h-2 rounded-full bg-[currentColor] mr-2" />
                        <span
                            className={`inline-block px-2 py-1 text-sm font-medium rounded-full ${textColor}`}
                        >
                            {statusLabel}
                        </span>
                    </p>
                    {statusLabel === 'Pending Payout' && isPast && (
                        <p className="text-xs text-gray-500 mt-2 italic">
                            Your payout will be initiated on the next working day after the booking is successfully completed
                        </p>
                    )}
                    <h3
                        className="font-bold text-xl text-gray-900 mt-2 cursor-pointer hover:underline"
                        onClick={handleNavigateToGuestDetails}
                    >
                        {displayUser.name}
                    </h3>

                    {displayFullDetails && !statusLabel.toLocaleLowerCase().includes('completed') && (
                        <>
                            <ContactInfo bookingDetails={bookingDetails} isInHost={isInHost} />
                            <p className="font-bold pt-2 text-gray-700">
                                {bookingDetails.dates || '-'}
                            </p>
                        </>
                    )}
                </div>
                <Avatar className="w-12 h-12">
                    <AvatarImage src={displayUser.avatar} />
                    <AvatarFallback>
                        {displayUser.name
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('') || '-'}
                    </AvatarFallback>
                </Avatar>
            </div>
            <div>
                <p
                    className="font-medium text-gray-800 cursor-pointer hover:underline"
                    onClick={handleNavigateToSpace}
                >
                    {capitalizeWord(bookingDetails.spaceName || '-')}
                </p>
                <AddressInfo
                    bookingDetails={bookingDetails}
                    displayFullDetails={displayFullDetails && !statusLabel.toLocaleLowerCase().includes('completed')}
                />
                <TimeInfo bookingDetails={bookingDetails} />

                {bookingDetails.duration && (
                    <p className="text-sm text-gray-600">Duration: {bookingDetails.duration}</p>
                )}

                {bookingDetails.spaceData?.capacity > 0 && (
                    <p className="text-sm text-gray-700">Guests: {bookingDetails?.guests || ''}</p>
                )}
                {bookingDetails?.id && (
                    <p className="text-sm text-gray-700">Booking Id: {bookingDetails?.id || ''}</p>
                )}
            </div>
        </>
    );
};





const InvoiceButton = ({ onClick, text }: InvoiceButtonProps) => (
    <Button className="w-full flex items-center justify-center gap-2 text-xs" onClick={onClick}>
        <Download className="w-3 h-3" />
        {text}
    </Button>
);

const InvoiceButtons = ({
    handleDownloadGuestInvoice,
    bookingDetails,
    isCancelled,
}: InvoiceButtonsProps) => (
    <div className="grid grid-cols-2 gap-2">
        {!bookingDetails?.isGst ? (
            <>
                <InvoiceButton
                    onClick={() => handleDownloadGuestInvoice('guest_booking', isCancelled)}
                    text={isCancelled ? 'Booking Cancellation Invoice' : 'Booking Invoice'}
                />
                <InvoiceButton
                    onClick={() => handleDownloadGuestInvoice('guest_platform', isCancelled)}
                    text={isCancelled ? 'Platform Cancellation Invoice' : 'Platform Invoice'}
                />
                {isCancelled && (
                    <>
                        <InvoiceButton
                            onClick={() => handleDownloadGuestInvoice('guest_booking', false)}
                            text="Booking Original Invoice"
                        />
                        <InvoiceButton
                            onClick={() => handleDownloadGuestInvoice('guest_platform', false)}
                            text="Platform Original Invoice"
                        />
                    </>
                )}
            </>
        ) : (
            <>
                <InvoiceButton
                    onClick={() => handleDownloadGuestInvoice('guest_booking_gst', isCancelled)}
                    text={isCancelled ? 'GST Booking Cancellation Invoice' : 'GST Booking'}
                />
                <InvoiceButton
                    onClick={() => handleDownloadGuestInvoice('guest_platform_gst', isCancelled)}
                    text={isCancelled ? 'GST Platform Cancellation Invoice' : 'GST Platform'}
                />
                {isCancelled && (
                    <>
                        <InvoiceButton
                            onClick={() => handleDownloadGuestInvoice('guest_booking_gst', false)}
                            text="GST Booking Original Invoice"
                        />
                        <InvoiceButton
                            onClick={() => handleDownloadGuestInvoice('guest_platform_gst', false)}
                            text="GST Platform Original Invoice"
                        />
                    </>
                )}
            </>
        )}
    </div>
);

const HostActionButtons = ({
    setRejectedModalView,
    approveBooking,
    setAcceptModalView,
}: HostActionButtonsProps) => (
    <div className="grid grid-cols-2 gap-4">
        <Button
            variant="outline"
            size="icon"
            className="rounded-full gap-2 w-full"
            onClick={() => setRejectedModalView(true)}
        >
            <X className="w-5 h-5" />
            <span>Reject</span>
        </Button>
        <Button
            variant="default"
            size="icon"
            className="rounded-full gap-2 w-full"
            onClick={() => {
                approveBooking();
                setTimeout(() => setAcceptModalView(true), 2000);
            }}
        >
            <Check className="w-5 h-5" />
            <span>Accept</span>
        </Button>
    </div>
);

const BookingDetailsSidebarSkeleton = () => {
    return (
        <div className="w-full hidden md:flex bg-white flex-col h-full animate-pulse">
            <div className="pt-14" />
            <div className="p-4 space-y-4 border-t-2 flex-1 overflow-y-auto border-l-2">
                {/* Header Skeleton */}
                <div className="space-y-4">
                    <div className="h-6 w-32 bg-gray-200 rounded" />
                    <div className="flex justify-between items-center">
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-gray-200" />
                                <div className="h-6 w-24 bg-gray-200 rounded-full" />
                            </div>
                            <div className="h-6 w-40 bg-gray-200 rounded" />
                            <div className="h-4 w-32 bg-gray-200 rounded" />
                            <div className="h-4 w-28 bg-gray-200 rounded" />
                        </div>
                        <div className="w-12 h-12 rounded-full bg-gray-200" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-5 w-48 bg-gray-200 rounded" />
                        <div className="h-4 w-36 bg-gray-200 rounded" />
                        <div className="h-4 w-40 bg-gray-200 rounded" />
                        <div className="h-4 w-32 bg-gray-200 rounded" />
                        <div className="h-4 w-24 bg-gray-200 rounded" />
                    </div>
                </div>

                {/* Amounts Skeleton */}
                <div className="mt-2 space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-4 w-28 bg-gray-200 rounded" />
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                    <div className="h-4 w-20 bg-gray-200 rounded" />
                    <div className="border-t border-gray-200 pt-2 mt-2">
                        <div className="h-5 w-36 bg-gray-200 rounded" />
                    </div>
                </div>
            </div>

            {/* Action Button Skeleton */}
            <div className="p-4 border-l-2">
                <div className="h-11 w-full bg-gray-200 rounded" />
            </div>
        </div>
    );
};

export default function BookingDetailsSidebar({
    bookingDetails,
    isInHost = false,
    refreshBookingDetails,
    setRejectedModalView,
    setAcceptModalView,
    isLoading = false,
}: {
    bookingDetails: BookingDetailsType | null;
    basePath?: string;
    isInHost?: boolean;
    refreshBookingDetails?: any;
    setRejectedModalView: React.Dispatch<React.SetStateAction<boolean>>;
    setAcceptModalView: React.Dispatch<React.SetStateAction<boolean>>;
    isLoading?: boolean;
}) {
    if (isLoading || !bookingDetails) {
        return <BookingDetailsSidebarSkeleton />;
    }



    const dispatch = useDispatch();
    const router = useRouter();
    const isCancelled = bookingDetails.status?.toLowerCase() === 'cancelled';

    const now = new Date();

    const startDate = bookingDetails?.startDateTime
        ? new Date(bookingDetails.startDateTime)
        : null;

    const endDate = bookingDetails?.endDateTime
        ? new Date(bookingDetails.endDateTime)
        : null;

    const isUpcoming =
        startDate !== null && startDate > now;

    const isOngoing =
        startDate !== null &&
        endDate !== null &&
        startDate <= now &&
        endDate >= now;

    const isPast =
        endDate !== null && endDate < now;

    const isActiveBooking = isUpcoming || isOngoing;


    const currDate = new Date();

    const { data: gstResponse } = useGetGSTDetails();

    const { data: cancellationData } = useGetCancellationDataByBookingID(bookingDetails?.id?.toString(), {
        enabled: isCancelled && !!bookingDetails?.id,
    });
    const refundPercentage = Number(cancellationData?.data?.hostPayout?.refundPercentage) || 0;

    const bookingStatus = getBookingStatus(bookingDetails.status);
    const paymentStatus = getPaymentStatus(
        bookingDetails.paymentStatus,
        bookingDetails.isInstantBooking,
    );
    const isCompletedBooking =
        bookingStatus === BookingStatus.CONFIRMED &&
        paymentStatus === PaymentStatus.CAPTURED &&
        isPast;

    const statusKey = getStatusKey(
        bookingStatus,
        paymentStatus,
        isPast,
        bookingDetails?.isPayout,
        isInHost,
    );

    const statusConfig =
        BOOKING_PAYMENT_STATUS_MAP[statusKey] || BOOKING_PAYMENT_STATUS_MAP.DEFAULT;

    const displayFullDetails = useMemo(
        () =>
            (paymentStatus === PaymentStatus.CAPTURED &&
                bookingStatus === BookingStatus.CONFIRMED) ||
            bookingStatus === BookingStatus.INSTANT,
        [paymentStatus, bookingStatus],
    );
    const displayUser = getUserDisplayInfo(bookingDetails, isInHost);

    const handleDownloadInvoice = async (isCancellation?: boolean) => {
        try {
            if (!bookingDetails.id) {
                toast.error('Booking ID is missing. Cannot download invoice.');
                return;
            }
            toast.info('Opening your invoice...', { autoClose: 2000 });
            const response = await getInvoices(bookingDetails.id, isInHost ? '2' : '3');

            if (response?.success) {
                const invoiceData = response.data;
                if (Array.isArray(invoiceData) && invoiceData.length > 0) {
                    let targetInvoice;

                    if (isCancellation !== undefined) {
                        targetInvoice = invoiceData.find((inv: any) => {
                            const isCancellationInvoice = inv.invoiceNumber?.startsWith('CN-');
                            return isCancellation
                                ? isCancellationInvoice
                                : !isCancellationInvoice;
                        });
                        if (!targetInvoice) {
                            toast.error(
                                `Invoice not found ${isCancellation ? '(Cancellation)' : '(Original)'}`
                            );
                            return;
                        }
                    } else {
                        targetInvoice = invoiceData[0];
                    }

                    if (targetInvoice?.invoiceUrl) {
                        window.open(targetInvoice.invoiceUrl, '_blank');
                    } else {
                        toast.error('Invoice URL missing');
                    }
                } else {
                    toast.error('No invoice available');
                }
            } else {
                toast.error(response?.message || 'Failed to fetch invoice');
            }
        } catch (err) {
            handleApiError(err);
        }
    };

    const handleDownloadGuestInvoice = async (subType?: string, isCancellation?: boolean) => {
        try {
            if (!bookingDetails.id) {
                toast.error('Booking ID is missing. Cannot download invoice.');
                return;
            }
            toast.info('Opening your invoice...', { autoClose: 2000 });
            const response = await getInvoices(bookingDetails.id, isInHost ? '2' : '3');

            if (response?.success) {
                const invoiceData = response.data;
                if (Array.isArray(invoiceData)) {
                    if (subType) {
                        const targetInvoice = invoiceData.find((invoice: any) => {
                            const isMatchingSubType = invoice.subType === subType;
                            if (isCancellation !== undefined) {
                                const isCancellationInvoice = invoice.invoiceNumber?.startsWith('CN-');
                                return (
                                    isMatchingSubType &&
                                    (isCancellation
                                        ? isCancellationInvoice
                                        : !isCancellationInvoice)
                                );
                            }
                            return isMatchingSubType;
                        });
                        if (targetInvoice?.invoiceUrl) {
                            window.open(targetInvoice.invoiceUrl, '_blank');
                        } else {
                            toast.error(
                                `Invoice not found for the selected type ${isCancellation !== undefined ? `(${isCancellation ? 'Cancellation' : 'Original'})` : ''}`,
                            );
                        }
                    } else {
                        const firstInvoice = invoiceData[0];
                        if (firstInvoice?.invoiceUrl) {
                            window.open(firstInvoice.invoiceUrl, '_blank');
                        } else {
                            toast.error('No invoice available');
                        }
                    }
                } else if (typeof invoiceData === 'string') {
                    window.open(invoiceData, '_blank');
                } else {
                    toast.error('Invalid invoice data received');
                }
            } else {
                toast.error(response?.message || 'Failed to fetch invoice');
            }
        } catch (err) {
            handleApiError(err);
        }
    };

    const { mutate: approveBooking } = useApproveBooking({
        onSuccess: () => refreshBookingDetails?.(),
        onError: handleApiError,
    });

    const handleInstantConfirm = () => {
        const bookingData = {
            spaceData: {
                id: bookingDetails.spaceData?.id || 0,
                title: bookingDetails.spaceData?.title || 'Space Title',
                description: bookingDetails.spaceData?.description || '',
                avg_rating: 0,
                reviewCount: 0,
                SpaceListing: {
                    price_per_hour: 500,
                    cancellationPolicy: {
                        message: 'Flexible cancellation policy applies',
                    },
                },
                SpaceImages: [
                    { image_url: bookingDetails.spaceData?.image_url || '/placeholder.jpg' },
                ],
                SpaceType: {
                    type: bookingDetails.spaceData?.SpaceTypes?.[0]?.type || 'Space',
                },
                City: {
                    city: bookingDetails.spaceData?.City?.city || 'City',
                    state: bookingDetails.spaceData?.City?.state || 'State',
                },
            },
            bookingDetails: {
                date: bookingDetails.dates
                    ? new Date(bookingDetails.dates).toLocaleDateString('en-US', {
                        month: 'short',
                        day: '2-digit',
                        year: 'numeric',
                    })
                    : 'Select date',
                timeStart: bookingDetails.startDateTime
                    ? format(new Date(bookingDetails.startDateTime), 'hh:mm a')
                    : '09:00 AM',
                timeEnd: bookingDetails.endDateTime
                    ? format(new Date(bookingDetails.endDateTime), 'hh:mm a')
                    : '05:00 PM',
                attendees: parseInt(bookingDetails.guests || '1', 10) || 1,
            },
            message: '',
            isInstantBooking: bookingDetails.isInstantBooking || false,
            priceItems: [],
            total: bookingDetails.price?.toString() || '0',
            totalAmount: Number(bookingDetails.price) || 0,
            instantTotalAmount: calculateHostPayout(bookingDetails).totalAmountNum,
        };

        dispatch(setBookingData(bookingData));
        dispatch(setIsInstantBooking(bookingDetails.isInstantBooking));

        if (bookingDetails.spaceSlug) {
            router.push(`/booking-review/${bookingDetails.spaceSlug}`);
        } else {
            console.warn('Space slug is missing, cannot navigate to booking review');
        }
    };



    const actionButton = useMemo(() => {
        if (!isInHost) {
            if (
                bookingStatus === BookingStatus.INSTANT &&
                paymentStatus === PaymentStatus.PENDING
            ) {
                const buttonText = bookingDetails.isInstantBooking
                    ? 'Confirm Booking'
                    : 'Complete Booking';
                return (
                    <Button className="w-full" onClick={handleInstantConfirm}>
                        {buttonText}
                    </Button>
                );
            }

            if (
                bookingStatus === BookingStatus.CONFIRMED &&
                paymentStatus === PaymentStatus.PENDING
            ) {
                return (
                    <Button className="w-full" onClick={() => router.push('/my-bookings')}>
                        Make Payment
                    </Button>
                );
            }

            if (
                (bookingStatus === BookingStatus.CONFIRMED &&
                    paymentStatus === PaymentStatus.CAPTURED) ||
                isCancelled
            ) {
                return (
                    <InvoiceButtons
                        handleDownloadGuestInvoice={handleDownloadGuestInvoice}
                        bookingDetails={bookingDetails}
                        isCancelled={isCancelled}
                    />
                );
            }
        }

        if (isInHost) {
            if (
                bookingStatus === BookingStatus.PENDING &&
                paymentStatus === PaymentStatus.PENDING
            ) {
                return (
                    <HostActionButtons
                        setRejectedModalView={setRejectedModalView}
                        approveBooking={() =>
                            approveBooking({ bookingId: Number(bookingDetails.id) })
                        }
                        setAcceptModalView={setAcceptModalView}
                    />
                );
            }

            if (isCancelled) {
                return (
                    <div className={`grid grid-cols-1 ${refundPercentage !== 0 ? 'sm:grid-cols-2' : ''} gap-2`}>
                        {refundPercentage !== 0 && (
                            <InvoiceButton
                                onClick={() => handleDownloadInvoice(true)}
                                text="Cancellation Invoice"
                            />
                        )}
                        <InvoiceButton
                            onClick={() => handleDownloadInvoice(false)}
                            text="Original Invoice"
                        />
                    </div>
                );
            }

            if (
                bookingStatus === BookingStatus.CONFIRMED &&
                paymentStatus === PaymentStatus.CAPTURED &&
                isPast && !statusConfig.label.toLocaleLowerCase().includes('pending')
            ) {
                return (
                    <Button
                        className="w-full flex items-center justify-center gap-2"
                        onClick={() => handleDownloadInvoice()}
                    >
                        <Download className="w-4 h-4" />
                        Download Invoice
                    </Button>
                );
            }
        }

        return null;
    }, [
        isInHost,
        bookingStatus,
        paymentStatus,
        isCancelled,
        bookingDetails,
        handleDownloadGuestInvoice,
        handleDownloadInvoice,
        handleInstantConfirm,
        setRejectedModalView,
        setAcceptModalView,
        approveBooking,
        router,
    ]);

    return (
        <div className="w-full hidden md:flex bg-white flex-col h-full">
            <div className="pt-14" />
            <div className="p-4 space-y-4 border-t-2 flex-1 overflow-y-auto border-l-2">
                <BookingHeader
                    bookingDetails={bookingDetails}
                    isInHost={isInHost}
                    isPast={isPast}
                    displayUser={displayUser}
                    statusLabel={statusConfig.label}
                    textColor={statusConfig.textColor}
                    displayFullDetails={displayFullDetails}
                />

                <BookingAmounts
                    bookingDetails={bookingDetails}
                    isInHost={isInHost}
                    isCancelled={isCancelled}
                    displayFullDetails={displayFullDetails}
                />
            </div>

            {actionButton && <div className="p-4 border-l-2">{actionButton}</div>}
        </div>
    );
}
