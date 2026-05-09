import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import {
    Reservation,
    useExportReservations,
    useGetReservationList,
    useGetRoles,
    useGetProfile,
} from '@/services';
import type { ReservationFilters } from '@/types/reservations';
import { updateHeaderNotification } from '@/store/slice/headerNotificationSlice';
import { RootState } from '@/store/store';
import { convertUtcToIst } from '@/lib/dateUtils';
import { downloadInvoice } from '@/services/invoice.services';
import { handleApiError } from '@/hooks/handleApiError';
import { Lekton } from 'next/font/google';

export interface CalculatedAmounts {
    amount: number;
    totalHostAmount: number;
    hostPlatformFee: number;
    hostTDSFee: number;
    csgt: number;
    ssgt: number;
    tcsAmount: number;
    penaltyAmount: number;
    hasHostGST: boolean;
}

export interface Column {
    key: string;
    label: string;
}

export const useReservations = () => {
    const [activeStatusTab, setActiveStatusTab] = useState('upcoming');
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState<ReservationFilters>({});
    const [showFilter, setShowFilter] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [selectedReservationId, setSelectedReservationId] = useState<number>();
    const [selectedRow, setSelectedRow] = useState<Reservation>();
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [isReservationDetails, setIsReservationDetails] = useState(false);
    const [isCancellationDetails, setIsCancellationDetails] = useState(false);
    const pathname = usePathname();
    const isInHost = pathname.includes('/host');

    const dispatch = useDispatch();
    const notifications = useSelector((state: RootState) => state.headerNotification);
    const [selectedSpace, setSelectedSpace] = useState<any>();
    const [openReviewModal, setOpenReviewModal] = useState(false);
    const [ratingState, setRatingState] = useState<'reviewed' | 'non-reviewed' | 'expired'>(
        'expired',
    );

    // Fetch reservations
    const {
        data: reservationsData,
        isLoading,
        error,
        refetch: refetchReservation,
    } = useGetReservationList({ ...filters, status: activeStatusTab, page: currentPage });

    // Fetch roles and user profile data
    const { data: rolesData } = useGetRoles();
    const { data: profileData } = useGetProfile();

    const hostPlatformFeePercentage = Number(reservationsData?.data?.host_platform_fee) || 0;
    const hostTDSPercentage = Number(reservationsData?.data?.tds) || 0;

    // Reusable calculation function
    const calculateHostAmount = (row: Reservation): CalculatedAmounts => {
        const isInCancelledTab = activeStatusTab === 'cancelled';

        // Determine base amount
        const amount = isInCancelledTab
            ? Number(row?.Financial?.baseAmount) || 0
            : Number(row?.amount) || 0;

        // Get GST and tax details
        const hasHostGST = Boolean(row?.Financial?.hostGst);
        const csgt = Number(row?.Financial?.cgstAmount) || 0;
        const ssgt = Number(row?.Financial?.sgstAmount) || 0;
        const penaltyAmount = Number(row?.Financial?.penaltyAmount) || 0;
        const refundPercentage = Number(row?.Financial?.refundPercentage) || 0;

        // Calculate platform fee, platform fee GST, TDS, and TCS
        const hostPlatformFee = Number(row.Financial?.hostPlatformFeeAmount) || 0;
        const hostPlatformFeeGST =
            (Number(row.Financial?.hostPlatformFeeCgstAmount) || 0) +
            (Number(row.Financial?.hostPlatformFeeSgstAmount) || 0);
        const hostTDSFee = Number(row.Financial?.tdsAmount) || 0;
        const tcsAmount = Number(row.Financial?.tcsAmount) || 0;


        // Calculate host amount following the new structure:
        // Step 1: Calculate subtotal (Base + GST if host has GST)
        let hostSubtotal = amount;
        if (hasHostGST) {
            hostSubtotal = amount + csgt + ssgt;
        }

        // Step 2: Deduct platform fee, platform fee GST, and TDS
        let totalHostAmount = hostSubtotal - hostPlatformFee - hostPlatformFeeGST - hostTDSFee;

        // Step 3: Deduct TCS only if host has GST
        if (hasHostGST) {
            totalHostAmount = totalHostAmount - tcsAmount;
        }

        // Step 4: Deduct penalty only if penaltyAmount > 0 AND refundPercentage !== 100
        const shouldDeductPenalty = penaltyAmount > 0 && refundPercentage !== 100;
        if (shouldDeductPenalty) {
            totalHostAmount = totalHostAmount - penaltyAmount;
        }

        // Step 5: If full refund (100%), host amount is 0
        if (isInCancelledTab && refundPercentage === 100) {
            totalHostAmount = 0;
        }

        return {
            amount,
            totalHostAmount: Number(totalHostAmount.toFixed(2)),
            hostPlatformFee: Number(hostPlatformFee.toFixed(2)),
            hostTDSFee: Number(hostTDSFee.toFixed(2)),
            csgt,
            ssgt,
            tcsAmount,
            penaltyAmount,
            hasHostGST,
        };
    };

    // Map reservations to include tax fields
    const mapReservationsWithTaxes = (rows: Reservation[] = []): Reservation[] => {
        const { gst, sgst, cgst, host_platform_fee, tds, tcs } = reservationsData?.data || {};
        return rows.map((row) => ({
            ...row,
            gst_percent: Number(gst) || 0,
            sgst_percent: Number(sgst) || 0,
            cgst_percent: Number(cgst) || 0,
            host_platform_fee_percent: Number(host_platform_fee) || 0,
            tds_percent: Number(tds) || 0,
            tcs_percent: Number(tcs) || 0,
        }));
    };

    const reservations = mapReservationsWithTaxes(reservationsData?.data?.rows) || [];
    const totalPages = reservationsData?.data?.count || 1;

    const prevIsLoadingRef = useRef(isLoading);
    const prevActiveTabRef = useRef(activeStatusTab);

    useEffect(() => {
        const tabChanged = prevActiveTabRef.current !== activeStatusTab;
        if ((!isLoading && prevIsLoadingRef.current) || tabChanged) {
            if (reservations.length > 0) {
                const currentNotifications = { ...notifications.reservation };
                currentNotifications[activeStatusTab] = true;
                dispatch(updateHeaderNotification({ reservation: currentNotifications }));
            }
        }
        prevIsLoadingRef.current = isLoading;
        prevActiveTabRef.current = activeStatusTab;
    }, [reservations, isLoading, activeStatusTab, dispatch, notifications.reservation]);

    const exportToExcel = (columns: Column[], rows: any[], fileName = 'reservations.xlsx') => {
        if (!rows || rows.length === 0) return;
        const headers = columns
            .filter((col) => col.key && col.key !== 'actions')
            .map((col) => col.label);

        const sheetData = rows.map((row) => {
            const { totalHostAmount } = calculateHostAmount(row);

            return columns
                .filter((col) => col.key && col.key !== 'actions')
                .map((col) => {
                    switch (col.key) {
                        case 'guest':
                            return row?.User
                                ? `${row.User.first_name || ''} ${row.User.last_name ? row.User.last_name[0] + '.' : ''
                                } (${row.attendees ?? 0} Attendees)`
                                : `(${row.attendees ?? 0} Attendees)`;
                        case 'property':
                            return row.Space.title;
                        case 'space':
                            return row.Space.address;
                        case 'activityCategory':
                            return row.Space.CategoryMaster?.name || 'N/A';
                        case 'dateTime':
                            return `${dayjs(row.startDatetime).format('DD MMM YYYY')} | ${dayjs(row.startDatetime).format('hh:mm A')} to ${dayjs(row.endDatetime).format('hh:mm A')}`;
                        case 'bookedOn':
                            return `${dayjs(row.created_at).format('DD MMM YYYY')} | ${dayjs(row.created_at).format('hh:mm A')}`;
                        case 'totalPayout':
                            return `₹${isInHost ? totalHostAmount : Number(row.totalAmount).toLocaleString()}`;
                        case 'status':
                            return row.status || '';
                        case 'gst_percent':
                            return row.gst_percent || '';
                        case 'sgst_percent':
                            return row.sgst_percent || '';
                        case 'cgst_percent':
                            return row.cgst_percent || '';
                        case 'host_platform_fee_percent':
                            return row.host_platform_fee_percent || '';
                        case 'tds_percent':
                            return row.tds_percent || '';
                        default:
                            return row[col.key] ?? '';
                    }
                });
        });

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sheetData]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Reservations');
        XLSX.writeFile(workbook, fileName);
        toast.success('Export Successfully');
    };

    const { mutate: exportReservations } = useExportReservations({
        onSuccess: (res) => exportToExcel(exportColumns, res?.data?.rows),
        onError: (err) => toast.error(err.message),
    });

    const exportColumns: Column[] = [
        { key: 'guest', label: 'Guest' },
        { key: 'property', label: 'Listing' },
        { key: 'space', label: 'Space name' },
        { key: 'activityCategory', label: 'Activity Category' },
        { key: 'dateTime', label: 'Date & Time' },
        { key: 'bookedOn', label: 'Booked On' },
        { key: 'totalPayout', label: 'Total Payout' },
        { key: 'status', label: 'Status' },
        { key: 'gst_percent', label: 'GST (%)' },
        { key: 'sgst_percent', label: 'SGST (%)' },
        { key: 'cgst_percent', label: 'CGST (%)' },
        { key: 'host_platform_fee_percent', label: 'Platform Fee (%)' },
        { key: 'tds_percent', label: 'TDS (%)' },
    ];

    const handleAddRatingAndReview = (booking: any) => {
        const space = booking?.Space;
        const bookingID = booking?.id;

        if (!space && !bookingID) return;

        setRatingState(booking?.hostReviewStatus || 'expired');

        const title = space.title ?? 'Untitled Space';
        const address = space.City?.city
            ? `${space.City.city}, ${space.City.state ?? ''}`
            : (space.address ?? '');
        const user = booking?.User ?? null;

        const image =
            space.SpaceImages?.find((img: any) => img.is_featured)?.image_url ??
            space.SpaceImages?.[0]?.image_url ??
            '/placeholder-space.jpg';

        setSelectedSpace({ title, address, image, user, bookingID });
        setOpenReviewModal(true);
    };

    const handleExport = (options?: any) => {
        const payload: any = {};
        if (options?.startDate) payload.startDate = convertUtcToIst(options.startDate);
        if (options?.endDate) payload.endDate = convertUtcToIst(options.endDate);
        if (options?.spaceId) payload.spaceId = options.spaceId;
        exportReservations(payload);
    };

    const handleFilterApply = (newFilters: ReservationFilters) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    const getInvoice = async (bookingId: number | string) => {
        try {
            const userRoleIds = profileData?.data?.roles || [];
            const availableRoles = rolesData?.data || [];

            if (userRoleIds.length === 0 || availableRoles.length === 0) {
                toast.error('Unable to fetch role information');
                return;
            }

            const roleId = userRoleIds[1];
            const response = await downloadInvoice(bookingId, roleId.toString());

            if (response?.data?.data) {
                window.open(response.data.data[0].invoiceUrl, '_blank');
            }
        } catch (err) {
            handleApiError(err);
        }
    };

    const ReservationStatusTabs = [
        {
            label: 'Upcoming',
            value: 'upcoming',
            showBadge: !notifications.reservation?.upcoming,
            tooltip: 'Bookings that are confirmed and scheduled for future dates. You can review details, prepare your space, and communicate with the guest before the booking.',
        },
        {
            label: 'Pending Payout',
            value: 'pending_payout',
            showBadge: !notifications.reservation?.pendingPayout,
            tooltip: 'This booking has been completed and is awaiting payout processing. Your payout will be initiated on the next working day after the booking is successfully completed.',
        },
        {
            label: 'Completed',
            value: 'completed',
            showBadge: !notifications.reservation?.completed,
            tooltip: 'Bookings that have been successfully completed. These records help you track past guests and earnings.',
        },
        {
            label: 'Cancelled',
            value: 'cancelled',
            showBadge: !notifications.reservation?.cancelled,
            tooltip: 'Bookings that were cancelled either by the guest, host, or platform. Any refunds or charges are handled according to the cancellation policy.',
        },
        {
            label: 'Rejected',
            value: 'rejected',
            showBadge: !notifications.reservation?.rejected,
            tooltip: 'Booking requests that were declined or not accepted. These did not convert into confirmed bookings.',
        },
    ];

    return {
        activeStatusTab, setActiveStatusTab,
        currentPage, setCurrentPage,
        filters, setFilters,
        showFilter, setShowFilter,
        showExport, setShowExport,
        selectedReservationId, setSelectedReservationId,
        selectedRow, setSelectedRow,
        showCancelModal, setShowCancelModal,
        showReviewModal, setShowReviewModal,
        isReservationDetails, setIsReservationDetails,
        isCancellationDetails, setIsCancellationDetails,
        isInHost,
        notifications,
        selectedSpace, setSelectedSpace,
        openReviewModal, setOpenReviewModal,
        ratingState, setRatingState,
        reservations,
        totalPages,
        isLoading,
        error,
        refetchReservation,
        calculateHostAmount,
        handleAddRatingAndReview,
        handleExport,
        handleFilterApply,
        getInvoice,
        ReservationStatusTabs
    };
};
