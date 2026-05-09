'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, Clock, IndianRupee, MoveRight, User2, XCircle, Info } from 'lucide-react';
import {
    CancellationReason,
    useCancelBooking,
    useGetCancellationReasons,
    Reservation,
    useRejectBooking,
    useGetCancellationData,
} from '@/services';
import Typography from '../ui/typoGraphy';
import { Modal } from '../ui/modal';
import { toast } from 'react-toastify';
import { HOST_PLATFORM_FEE_PER, HOST_TDS_PER } from '@/constants';
import { usePathname } from 'next/navigation';

interface CancelBookingModalProps {
    open: boolean;
    onClose: () => void;
    reservationId?: number;
    spaceData?: Reservation;
    onSuccess: (data: any) => void;
    isCancel?: boolean;
    isInHost?: boolean;
    isBookingRequest?: boolean;
}

export const CancelReservationModal: React.FC<CancelBookingModalProps> = ({
    open,
    onClose,
    reservationId,
    spaceData,
    onSuccess,
    isCancel = true,
    isInHost = true,
    isBookingRequest = false,
}) => {
    const pathname = usePathname();
    const [selectedReason, setSelectedReason] = useState<CancellationReason | null>(null);

    const { data: reasonsData, isLoading: isLoadingReasons } = useGetCancellationReasons();
    const cancelReasons: CancellationReason[] = React.useMemo(
        () => reasonsData?.data?.rows || [],
        [reasonsData],
    );

    const { data: cancellationData, isLoading: isLoadingCancellationData } = useGetCancellationData(
        reservationId,
        isCancel && open,
    );

    const hasHostGST = spaceData?.Financial?.hostGst;
    const csgt = Number(spaceData?.Financial?.cgstAmount) || 0;
    const ssgt = Number(spaceData?.Financial?.sgstAmount) || 0;
    const tcsAmount = Number(spaceData?.Financial?.tcsAmount) || 0;
    const hostPlatformFee =
        Number(spaceData?.Financial?.hostPlatformFeeAmount) ||
        (Number(spaceData?.amount) * Number(spaceData?.hostPlatformFeePer)) / 100;
    const hostTDSFee =
        Number(spaceData?.Financial?.tdsAmount) ||
        (Number(spaceData?.amount) * Number(spaceData?.hostTDSPer)) / 100;

    const amount = Number(spaceData?.Financial?.baseAmount) || Number(spaceData?.amount) || 0;

    let totalHostAmount = amount - hostPlatformFee - hostTDSFee || 0;

    if (hasHostGST) {
        totalHostAmount = totalHostAmount + csgt + ssgt - tcsAmount;
    }

    const penaltyAmount = cancellationData?.data?.penaltyAmount || 0;
    const penaltyPercent = cancellationData?.data?.penaltyPercent || 0;

    useEffect(() => {
        if (cancelReasons.length) {
            setSelectedReason(cancelReasons[0]);
        }
    }, [cancelReasons]);

    const { mutate: cancelMutation, isPending: isCancelLoading } = useCancelBooking({
        onSuccess: (data) => {
            toast.success(data?.message);
            setTimeout(() => {
                onClose();
                onSuccess(data);
            }, 5000);
        },
        onError: (err) => console.error('Failed to cancel booking', err),
    });

    const { mutate: rejectMutation, isPending: isRejectLoading } = useRejectBooking({
        onSuccess: (data) => {
            toast.success(data?.message);
            setTimeout(() => {
                onClose();
                onSuccess(data);
            }, 5000);
        },
        onError: (err) => console.error('Failed to reject booking', err),
    });

    const handleCancelBooking = () => {
        if (!reservationId || !selectedReason) return;

        if (isCancel) {
            cancelMutation({
                bookingId: reservationId.toString(),
                reasonId: selectedReason.id.toString(),
            });
            return;
        }
        rejectMutation({
            bookingId: reservationId.toString(),
            reasonId: selectedReason.id.toString(),
        });
    };

    if (isCancel && isLoadingCancellationData) {
        return (
            <Modal
                open={open}
                onClose={onClose}
                showClose={false}
                className="sm:max-w-96 rounded-xl p-6 bg-white relative"
                ariaLabel="Cancel Booking Modal"
                closeOnOverlay={false}
            >
                <div className="flex flex-col items-center justify-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
                    <Typography className="mt-4" color="text-gray-600" weight="medium">
                        Loading cancellation details...
                    </Typography>
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            showClose={false}
            className="sm:max-w-96 rounded-xl p-6 bg-white relative"
            ariaLabel="Cancel Booking Modal"
            closeOnOverlay={false}
        >
            <AlertTriangle className="mx-auto w-20 h-20 text-red-500" />
            <h2 className="text-gray-900 text-2xl font-semibold text-center">
                {isCancel ? 'Cancel Booking' : 'Reject Booking'}
            </h2>

            <div className="p-4 mt-4 bg-gray-100 flex flex-col w-full gap-2 rounded-lg">
                <Typography
                    color="text-zinc-800"
                    weight="semibold"
                    size="base"
                    className="truncate"
                >
                    {spaceData?.Space?.title || '-'}
                </Typography>
                <Typography color="text-zinc-800" weight="normal" size="sm">
                    {spaceData?.Space?.CategoryMaster?.name ||
                        (spaceData?.Space?.SpaceTypes && spaceData.Space.SpaceTypes.length > 0
                            ? spaceData.Space.SpaceTypes[0].type
                            : '-') ||
                        '-'}
                </Typography>

                <div className="flex gap-2 flex-col">
                    <div className="flex items-center gap-2">
                        <Clock className="text-gray-500" />
                        <Typography color="text-gray-500" weight="normal" size="sm">
                            {spaceData?.startDatetime || spaceData?.start_datetime
                                ? new Date(
                                      spaceData.startDatetime || spaceData?.start_datetime,
                                  ).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: true,
                                  })
                                : '-'}
                        </Typography>
                        <MoveRight className="text-gray-500" />
                        <Typography color="text-gray-500" weight="normal" size="sm">
                            {spaceData?.endDatetime || spaceData?.end_datetime
                                ? new Date(
                                      spaceData.endDatetime || spaceData.end_datetime,
                                  ).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: true,
                                  })
                                : '-'}
                        </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                        <User2 className="text-gray-500" />
                        <Typography color="text-gray-500" weight="normal" size="sm">
                            {spaceData?.User
                                ? `${spaceData.User.first_name || ''} ${
                                      spaceData.User.last_name
                                          ? spaceData.User.last_name[0] + '.'
                                          : ''
                                  }`.trim()
                                : '-'}
                        </Typography>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <IndianRupee className="text-gray-500" />
                    <Typography color="text-zinc-800" weight="semibold" size="base">
                        {isInHost ? '0.00' : totalHostAmount.toFixed(2) || '-'}
                    </Typography>
                </div>
                <Typography color="text-gray-500" weight="normal" size="sm">
                    {spaceData?.guest_message || ''}
                </Typography>
            </div>

            {isCancel && cancellationData?.data && penaltyAmount > 0 && (
                <div className="flex flex-col gap-2">
                    <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-center gap-3">
                            <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <Typography color="text-amber-800" weight="medium" size="xs">
                                        Penalty:
                                    </Typography>
                                    <Typography color="text-amber-900" weight="semibold" size="xs">
                                        ₹{penaltyAmount.toFixed(2)} ({penaltyPercent}%)
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    </div>
                    {cancellationData?.data?.reason?.length > 0 && (
                        <Typography
                            color="text-gray-500"
                            weight="normal"
                            size="xs"
                            className="ml-1 italic"
                        >
                            {cancellationData?.data?.reason || ''}
                        </Typography>
                    )}
                </div>
            )}

            <div className="space-y-1 mt-4">
                <label className="text-gray-700 text-sm font-medium">
                    Reason for {isCancel ? 'Cancellation' : 'Rejection'}
                </label>
                <Select
                    value={selectedReason?.reason || ''}
                    onValueChange={(val) =>
                        setSelectedReason(cancelReasons.find((r) => r.reason === val) || null)
                    }
                    disabled={isLoadingReasons || !cancelReasons.length}
                >
                    <SelectTrigger className="w-full [&>span]:truncate">
                        <SelectValue
                            placeholder={isLoadingReasons ? 'Loading...' : 'Select reason'}
                        />
                    </SelectTrigger>
                    <SelectContent>
                        {cancelReasons.map((r) => (
                            <SelectItem
                                key={r.id}
                                value={r.reason}
                                className="overflow-hidden text-ellipsis whitespace-nowrap"
                            >
                                {r.reason}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col space-y-2 mt-6">
                <Button
                    variant="destructive"
                    onClick={handleCancelBooking}
                    disabled={!selectedReason || isCancelLoading || isRejectLoading}
                >
                    {isCancel
                        ? isCancelLoading
                            ? 'Canceling...'
                            : 'Cancel Booking'
                        : isRejectLoading
                          ? 'Rejecting...'
                          : 'Reject Booking'}
                </Button>
                <Button variant="outline" onClick={onClose}>
                    Go Back
                </Button>
            </div>
        </Modal>
    );
};
