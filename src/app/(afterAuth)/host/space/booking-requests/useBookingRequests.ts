import { useRef, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useApproveBooking, useGetReservationList } from '@/services';
import { updateHeaderNotification } from '@/store/slice/headerNotificationSlice';

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

    const calculateHostAmount = (amount: number): CalculatedRequestAmounts => {
        const hostPlatformFee = (amount * hostPlatformFeePercentage) / 100;
        const hostTDSFee = (amount * hostTDSPercentage) / 100;
        const totalHostAmount = amount - (hostPlatformFee + hostTDSFee);

        return {
            amount,
            totalHostAmount: Number(totalHostAmount.toFixed(2)),
            hostPlatformFee: Number(hostPlatformFee.toFixed(2)),
            hostTDSFee: Number(hostTDSFee.toFixed(2)),
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
