'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
    useRazopayBookingOrder,
    useGetRoles,
    useGetProfile,
    useGetGSTDetails,
} from '@/services';
import { getBookings } from '@/services/guest/booking.services';
import { cancelBooking } from '@/services/cancelBooking.services';
import { getInvoices } from '@/services/invoice.services';
import { handleApiError } from '@/hooks/handleApiError';
import { ROW_LIMIT } from '@/constants';
import {
    openRazorpayPayment,
    formatRazorpayAmount,
    generateReceipt,
    RazorpayPaymentOptions,
} from '@/lib/razorpay';
import { capitalizeWord } from '@/utils/helperFunctions';
import { GuestBooking } from '@/types/@types.guestBookings';

export type TabStatus = 'upcoming' | 'completed' | 'cancelled';

export const useMyBookings = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [activeStatusTab, setActiveStatusTab] = useState<TabStatus>('upcoming');
    const [showModal, setShowModal] = useState(false);
    const [bookings, setBookings] = useState<GuestBooking[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        totalPages: 1,
        currentPage: 1,
        totalItems: 0,
    });
    const [openReviewModal, setOpenReviewModal] = useState(false);
    const [ratingState, setRatingState] = useState<'reviewed' | 'non-reviewed' | 'expired'>(
        'expired',
    );

    const { data: rolesData } = useGetRoles();
    const { data: profileData } = useGetProfile();
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
    const [selectedSpace, setSelectedSpace] = useState<any>();
    const [isCancellationDetails, setIsCancellationDetails] = useState(false);
    const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<GuestBooking | null>(
        null,
    );
    const [processingBookingId, setProcessingBookingId] = useState<number | null>(null);
    const [selectedBookingForAction, setSelectedBookingForAction] = useState<GuestBooking | null>(
        null,
    );

    const { data: gstResponse } = useGetGSTDetails();

    const showGstInvoiceOptions = useMemo(() => {
        return gstResponse?.data?.isVerified === true;
    }, [gstResponse?.data?.isVerified]);

    const razorpayOrderMutation = useRazopayBookingOrder({
        onSuccess: (orderData) => {
            const orderObj = orderData?.data?.order || orderData?.order || orderData?.data || orderData;
            const orderId = orderObj?.id;
            if (!orderId) {
                setSelectedBookingForPayment(null);
                setProcessingBookingId(null);
                return;
            }

            const amountFromOrder = Number(orderObj?.amount);
            const amountToUse =
                Number.isFinite(amountFromOrder) && amountFromOrder > 0
                    ? amountFromOrder
                    : formatRazorpayAmount(parseFloat(selectedBookingForPayment?.total_amount || '0'));

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
                handler: (response: any) => {
                    fetchBookings(pagination.currentPage);
                    setSelectedBookingForPayment(null);
                    setProcessingBookingId(null);
                },
                modal: {
                    ondismiss: () => {
                        setSelectedBookingForPayment(null);
                        setProcessingBookingId(null);
                    },
                },
            };
            openRazorpayPayment(options);
        },
        onError: (error) => {
            setSelectedBookingForPayment(null);
            setProcessingBookingId(null);
        },
    });

    const fetchBookings = async (page = 1) => {
        try {
            setLoading(true);
            const response = await getBookings(page, ROW_LIMIT, activeStatusTab);
            if (response.status === 200) {
                const { rows, pagination: pag } = response.data.data;
                setBookings(rows || []);
                setPagination({
                    totalPages: pag.totalPages,
                    currentPage: pag.currentPage,
                    totalItems: pag.totalItems,
                });
            }
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings(1);
    }, [activeStatusTab]);

    const handleTabChange = (value: TabStatus) => setActiveStatusTab(value);

    const handlePayNow = (booking: GuestBooking) => {
        if (processingBookingId === booking.id || razorpayOrderMutation.isPending) return;

        setSelectedBookingForPayment(booking);
        setProcessingBookingId(booking.id);

        const razorpayPayload = {
            bookingId: booking.id,
            amount: Number(booking.total_amount),
            currency: 'INR',
            receipt: generateReceipt(booking.id),
            notes: { purpose: 'space booking payment' },
        };
        razorpayOrderMutation.mutate(razorpayPayload);
    };

    const handleCancelBooking = async () => {
        try {
            setIsCancelling(true);
            if (!selectedBookingForAction?.id) {
                toast.error('No booking selected for cancellation');
                return;
            }
            const response = await cancelBooking(selectedBookingForAction.id);
            if (response.status === 200) {
                toast.success('Booking cancelled successfully');
                fetchBookings(pagination.currentPage);
                setIsCancellationModalOpen(false);
                setSelectedBookingForAction(null);
            }
        } catch (err) {
            handleApiError(err);
        } finally {
            setIsCancelling(false);
        }
    };

    const getInvoice = async (
        bookingId: number | string,
        subType?: 'guest_booking' | 'guest_platform' | 'guest_booking_gst' | 'guest_platform_gst',
    ) => {
        try {
            const userRoleIds = profileData?.data?.roles || [];
            const availableRoles = rolesData?.data || [];
            if (userRoleIds.length === 0 || availableRoles.length === 0) {
                toast.error('Unable to fetch role information');
                return;
            }
            const roleId = userRoleIds[0];

            const loadingToast = toast.loading('Opening invoice...');

            const response = await getInvoices(bookingId, roleId.toString());

            toast.dismiss(loadingToast);

            if (response?.success) {
                const invoiceData = response.data;
                if (Array.isArray(invoiceData)) {
                    if (subType) {
                        const targetInvoice = invoiceData.find(
                            (inv: any) => inv.subType === subType,
                        );
                        if (targetInvoice?.invoiceUrl) {
                            window.open(targetInvoice.invoiceUrl, '_blank');
                            toast.success('Invoice opened successfully');
                        } else toast.error('Invoice not found for the selected type');
                    } else {
                        const firstInvoice = invoiceData[0];
                        if (firstInvoice?.invoiceUrl) {
                            window.open(firstInvoice.invoiceUrl, '_blank');
                            toast.success('Invoice opened successfully');
                        } else toast.error('No invoice available');
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

    const getCancellationInvoice = async (
        bookingId: number | string,
        subType: 'guest_booking' | 'guest_platform' | 'guest_booking_gst' | 'guest_platform_gst',
        isCancellation: boolean,
    ) => {
        try {
            const userRoleIds = profileData?.data?.roles || [];
            const availableRoles = rolesData?.data || [];
            if (userRoleIds.length === 0 || availableRoles.length === 0) {
                toast.error('Unable to fetch role information');
                return;
            }
            const roleId = userRoleIds[0];

            const loadingToast = toast.loading('Opening invoice...');

            const response = await getInvoices(bookingId, roleId.toString());

            toast.dismiss(loadingToast);

            if (response?.success) {
                const invoiceData = response.data;
                if (Array.isArray(invoiceData)) {
                    const targetInvoice = invoiceData.find((inv: any) => {
                        const isMatchingSubType = inv.subType === subType;
                        const isCancellationInvoice = inv.invoiceNumber?.startsWith('CN-');
                        return (
                            isMatchingSubType &&
                            (isCancellation ? isCancellationInvoice : !isCancellationInvoice)
                        );
                    });

                    if (targetInvoice?.invoiceUrl) {
                        window.open(targetInvoice.invoiceUrl, '_blank');
                        toast.success('Invoice opened successfully');
                    } else {
                        toast.error(
                            `Invoice not found for the selected type (${isCancellation ? 'Cancellation' : 'Original'})`,
                        );
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

    const handleAddRatingAndReview = (booking?: GuestBooking) => {
        const bookingID = booking?.id || selectedBookingForAction?.id;
        const space = booking?.Space || selectedBookingForAction?.Space;
        if (!space && !bookingID) return;

        setRatingState(booking?.guestReviewStatus || selectedBookingForAction?.guestReviewStatus || 'expired');

        const title = space.title ?? 'Untitled Space';
        const address = space.City?.city ? `${space.City.city}, ${space.City.state ?? ''}` : (space.address ?? '');
        const image = space.SpaceImages?.find(img => img.is_featured)?.image_url ?? space.SpaceImages?.[0]?.image_url ?? '/placeholder-space.jpg';

        setSelectedSpace({ title, address, image, bookingID });
        setShowModal(false);
        setOpenReviewModal(true);
    };

    useEffect(() => {
        const bookingSuccess = searchParams.get('bookingSuccess');
        if (bookingSuccess === 'true') {
            setShowSuccessModal(true);
            const url = new URL(window.location.href);
            url.searchParams.delete('bookingSuccess');
            window.history.replaceState({}, '', url.toString());
        }
    }, [searchParams]);

    return {
        activeStatusTab,
        bookings,
        loading,
        pagination,
        showSuccessModal,
        setShowSuccessModal,
        selectedSpace,
        setSelectedSpace,
        isCancellationDetails,
        setIsCancellationDetails,
        isCancellationModalOpen,
        setIsCancellationModalOpen,
        isCancelling,
        processingBookingId,
        selectedBookingForAction,
        setSelectedBookingForAction,
        showModal,
        setShowModal,
        openReviewModal,
        setOpenReviewModal,
        ratingState,
        showGstInvoiceOptions,
        handleTabChange,
        handlePayNow,
        handleCancelBooking,
        getInvoice,
        getCancellationInvoice,
        handleAddRatingAndReview,
        fetchBookings,
        router,
    };
};
