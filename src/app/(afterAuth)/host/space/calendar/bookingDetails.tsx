'use client';


import Loader from '@/components/ui/loader';
import { Modal } from '@/components/ui/modal';
import { Reservation } from '@/services';
import { capitalizeWord, formatToIST } from '@/utils/helperFunctions';
import { formatGSTForDisplay } from '@/utils/gstHelpers';
import dayjs from 'dayjs';
import React from 'react';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

// Reusable inline component
const LabelValue = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex flex-col gap-1">
        <div className="text-gray-700 text-base font-semibold">{label}</div>
        <div className="text-black text-sm">{value}</div>
    </div>
);

const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-IN', options);
};

const BookingDetails = ({
    onClose,
    open,
    isLoading,
    data,
    isInCalendor = false,
}: {
    onClose: () => void;
    open: boolean;
    isLoading: boolean;
    data?: Reservation;
    isInCalendor?: boolean;
}) => {
    const hostPayout = data?.Financial;

    // Host calculations - matching reservationDetails.tsx pattern
    const hasHostGST = hostPayout?.hostGst || false;
    const baseAmount = Number(hostPayout?.baseAmount) || 0;
    const hostCgstAmount = Number(hostPayout?.cgstAmount) || 0;
    const hostSgstAmount = Number(hostPayout?.sgstAmount) || 0;
    const hostGSTAmount = hostCgstAmount + hostSgstAmount;

    // Calculate host subtotal
    const hostSubtotal = hasHostGST ? baseAmount + hostGSTAmount : baseAmount;

    const hostPlatformFeeAmount = Number(hostPayout?.hostPlatformFeeAmount) || 0;
    const hostPlatformFeeCgstAmount = Number(hostPayout?.hostPlatformFeeCgstAmount) || 0;
    const hostPlatformFeeSgstAmount = Number(hostPayout?.hostPlatformFeeSgstAmount) || 0;
    const hostPlatformFeeGST = hostPlatformFeeCgstAmount + hostPlatformFeeSgstAmount;

    const tdsAmount = Number(hostPayout?.tdsAmount) || 0;
    const hostTCSAmount = Number(hostPayout?.tcsAmount) || 0;
    const hostPenaltyAmount = Number(hostPayout?.penaltyAmount) || 0;
    const refundPercentage = Number(hostPayout?.refundPercentage) || 0;

    // Calculate final payout - matching reservationDetails.tsx formula
    let finalPayout = hostSubtotal - hostPlatformFeeAmount - hostPlatformFeeGST - tdsAmount;

    // Deduct TCS only if host has GST
    if (hasHostGST) {
        finalPayout = finalPayout - hostTCSAmount;
    }

    // Deduct penalty only if penaltyAmount > 0 AND refundPercentage !== 100
    const shouldDeductPenalty = hostPenaltyAmount > 0 && refundPercentage !== 100;
    if (shouldDeductPenalty) {
        finalPayout = finalPayout - hostPenaltyAmount;
    }

    // Round to 2 decimal places
    finalPayout = Number(finalPayout.toFixed(2));

    const now = dayjs();

    const isConfirmed = data?.status === 'confirmed';

    const isUpcoming = data?.startDatetime && dayjs(data.startDatetime).isAfter(now);

    const isOngoing =
        data?.startDatetime &&
        data?.endDatetime &&
        dayjs(data.startDatetime).isSameOrBefore(now) &&
        dayjs(data.endDatetime).isSameOrAfter(now);

    const isNotPastBooking = isUpcoming || isOngoing;

    const shouldShowMobileNumber = isConfirmed && isNotPastBooking;


    return (
        <Modal className="min-w-80" onClose={onClose} open={open}>
            {isLoading ? (
                <div className="min-w-80 flex justify-center py-10">
                    <Loader />
                </div>
            ) : data ? (
                <div className="gap-6 flex flex-col">
                    <LabelValue
                        label="Guest"
                        value={
                            data.User
                                ? `${capitalizeWord(data.User.first_name || '')} ${data.User.last_name
                                    ? capitalizeWord(data.User.last_name[0]) + '.'
                                    : ''
                                    }`.trim()
                                : '-'
                        }
                    />

                    <div className="flex gap-8">
                        <LabelValue
                            label="Booking Date"
                            value={formatDate(data.startDatetime, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                        />
                        <LabelValue
                            label="Booking Time"
                            value={
                                <div className="flex items-center gap-2">
                                    <span>{formatToIST(data.startDatetime)}</span>
                                    <span>→</span>
                                    <span>{formatToIST(data.endDatetime)}</span>
                                </div>
                            }
                        />
                    </div>

                    {/* Mobile Number */}
                    {shouldShowMobileNumber && (
                        <LabelValue
                            label="Mobile Number"
                            value={data.User?.phone_number || '-'}
                        />
                    )}


                    {/* Booked Time */}
                    <LabelValue
                        label="Booked"
                        value={` ${dayjs(data.created_at).format('DD MMMM, YYYY')} ${formatToIST(data.created_at)}`}
                    />

                    {/* Listing */}
                    <LabelValue label="Listing" value={data.Space?.title || '-'} />

                    {/* Confirmation code */}
                    <LabelValue label="Booking Id" value={`${data.id}`} />

                    {/* Total Payout - using corrected calculation */}
                    <LabelValue
                        label="Total Payout"
                        value={isInCalendor ? `₹${finalPayout.toFixed(2)}` : `₹${data.totalAmount}`}
                    />
                </div>
            ) : (
                <div className="text-center py-10 text-gray-500">No booking details found.</div>
            )}
        </Modal>
    );
};

export default BookingDetails;
