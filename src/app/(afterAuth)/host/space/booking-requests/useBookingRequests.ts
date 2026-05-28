import { useRef, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useApproveBooking, useGetReservationList } from '@/services';
import { updateHeaderNotification } from '@/store/slice/headerNotificationSlice';
import { BookingRequest } from '@/types/reservations';

const ITEMS_PER_PAGE = 10;

export interface CalculatedRequestAmounts {
    amount: number;
    totalHostAmount: number;
    hostPlatformFee: number;
    hostTDSFee: number;
}

export const useBookingRequests = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const [isAcceptOpen, setIsAcceptOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRow, setSelectedRow] = useState<any>(null);

    const {
        data: bookingRequestsData,
        isLoading,
        error,
        refetch,
    } = useGetReservationList({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        status: 'pending',
    });

    const hostPlatformFeePercentage = Number(bookingRequestsData?.data?.host_platform_fee) || 0;
    const hostTDSPercentage = Number(bookingRequestsData?.data?.tds) || 0;

    const calculateHostAmount = (
        row: BookingRequest
    ): CalculatedRequestAmounts => {
        const amount = Number(row?.amount) || 0;
        
        const hostGst = Boolean(row?.hostGst);

        // Host calculations based on percentages
        const hostBaseAmount = amount;

        // GST calculations
        const cgstPercentage = Number(bookingRequestsData?.data?.cgst) || 0;
        const sgstPercentage = Number(bookingRequestsData?.data?.sgst) || 0;
        const cgstAmount = hostGst ? (hostBaseAmount * cgstPercentage) / 100 : 0;
        const sgstAmount = hostGst ? (hostBaseAmount * sgstPercentage) / 100 : 0;
        const hostGSTAmount = cgstAmount + sgstAmount;

        const hostSubtotal = hostGst ? hostBaseAmount + hostGSTAmount : hostBaseAmount;

        // Platform Fee (dynamic percentage from backend)
        const hostPlatformFee = (hostBaseAmount * hostPlatformFeePercentage) / 100;

        // GST on platform fee is standard 18% (9% cgst + 9% sgst)
        const hostPlatformFeeGST = (hostPlatformFee * 18) / 100;

        // TCS (dynamic percentage from backend, only if host has GST)
        const hostTCSPercentage = Number(bookingRequestsData?.data?.tcs) || 0;
        const hostTCS = hostGst ? (hostBaseAmount * hostTCSPercentage) / 100 : 0;

        // TDS (dynamic percentage from backend)
        const hostTDS = (hostBaseAmount * hostTDSPercentage) / 100;

        // Calculate final payout
        let totalHostAmount = hostSubtotal - hostPlatformFee - hostPlatformFeeGST - hostTDS;

        if (hostGst) {
            totalHostAmount = totalHostAmount - hostTCS;
        }

        return {
            amount: Number(hostBaseAmount.toFixed(2)),
            hostPlatformFee: Number(hostPlatformFee.toFixed(2)),
            hostTDSFee: Number(hostTDS.toFixed(2)),
            totalHostAmount: Number(totalHostAmount.toFixed(2)),
        };
    };

    const prevIsLoadingRef = useRef(isLoading);

    useEffect(() => {
        if (prevIsLoadingRef.current && !isLoading && bookingRequestsData) {
            dispatch(updateHeaderNotification({ bookingRequest: true }));
        }
        prevIsLoadingRef.current = isLoading;
    }, [isLoading, bookingRequestsData, dispatch]);

    const { mutate: approveBooking } = useApproveBooking({
        onSuccess: () => {
            setIsAcceptOpen(true);
            refetch();
        },
        onError: (err: any) => {
            toast.error(err?.message || 'Error approving booking');
        },
    });

    return {
        bookingRequestsData,
        isLoading,
        error,
        refetch,
        isAcceptOpen,
        setIsAcceptOpen,
        isRejectOpen,
        setIsRejectOpen,
        currentPage,
        setCurrentPage,
        selectedRow,
        setSelectedRow,
        hostPlatformFeePercentage,
        hostTDSPercentage,
        calculateHostAmount,
        approveBooking,
        itemsPerPage: ITEMS_PER_PAGE,
        router,
        dispatch
    };
};
