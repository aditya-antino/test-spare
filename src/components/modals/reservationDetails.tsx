import React from 'react';
import { Modal } from '../ui/modal';
import Typography from '../ui/typoGraphy';
import { formatGSTForDisplay } from '@/utils/gstHelpers';

interface ReservationDetailsProps {
    isOpen: boolean;
    onClose: (value: boolean) => void;
    data?: any;
    activeTab?: string;
}

const ReservationDetails: React.FC<ReservationDetailsProps> = ({ isOpen, onClose, data, activeTab }) => {
    if (!data) return null;

    const {
        startDatetime,
        amount = 0,
        endDatetime,
        tds_percent = 0,
        User = {},
        Space = {},
        attendees = 0,
        status = 'N/A',
        tcs_percent = 0,
        discountAmount = 0,
        couponCode = '',
        Financial: {
            baseAmount = 0,
            hostGst = false,
            tcsAmount = 0,
            tdsAmount = 0,
            cgstAmount = 0,
            sgstAmount = 0,
            guestPlatformFeeAmount = 0,
            guestPlatformFeeCgstAmount = 0,
            guestPlatformFeeSgstAmount = 0,
            hostPlatformFeeAmount = 0,
            hostPlatformFeeCgstAmount = 0,
            hostPlatformFeeSgstAmount = 0,
            penaltyAmount = 0,
            refundPercentage = 0,
        } = {},
    } = data;

    // Guest calculations
    const guestBaseAmount = Number(baseAmount);
    const guestPlatformFee = Number(guestPlatformFeeAmount);

    // Calculate booking hours
    let bookingHours = 1;
    if (startDatetime && endDatetime) {
        const start = new Date(startDatetime).getTime();
        const end = new Date(endDatetime).getTime();
        if (!isNaN(start) && !isNaN(end)) {
            bookingHours = Math.ceil((end - start) / (1000 * 60 * 60));
        }
    }
    bookingHours = Math.max(bookingHours, 1);

    // Reconstruct gross amount and host discount
    const hourlyRate = parseFloat(Space?.SpaceListing?.price_per_hour) || 0;
    const grossAmount = hourlyRate > 0 ? hourlyRate * bookingHours : guestBaseAmount;

    const hostDiscountAmount = Math.max(0, grossAmount - guestBaseAmount);
    const totalHostDiscountPerc = grossAmount > 0 ? Math.round((hostDiscountAmount / grossAmount) * 100) : 0;

    // Segregate host discount into space and hourly components
    const hourlyDiscountPerc = bookingHours >= 6 ? parseFloat(String(Space?.SpaceListing?.extra_discount_per || '0')) : 0;
    const spaceDiscountPerc = Math.max(0, totalHostDiscountPerc - hourlyDiscountPerc);

    const spaceDiscountAmt = grossAmount * (spaceDiscountPerc / 100);
    const hourlyDiscountAmt = Math.max(0, hostDiscountAmount - spaceDiscountAmt);

    const discount = Number(discountAmount || 0);

    // Subtotal: gross amount - host discount + platform fee - coupon discount
    const guestSubtotal = guestBaseAmount - discount + guestPlatformFee;

    // Total GST for guest (calculated over subtotal after admin discount)
    const cgstRate = (Number(data?.cgst_percent) || 9) / 100;
    const sgstRate = (Number(data?.sgst_percent) || 9) / 100;
    const totalGuestCGST = guestSubtotal * cgstRate;
    const totalGuestSGST = guestSubtotal * sgstRate;
    const totalGuestGST = totalGuestCGST + totalGuestSGST;

    const guestTotalAmount = Math.max(0, guestSubtotal + totalGuestGST);

    // Pre-compute GST items for guest display
    const guestGSTItems = formatGSTForDisplay(
        Space?.City?.state,
        totalGuestCGST,
        totalGuestSGST
    );

    // Host calculations
    const hostBaseAmount = Number(baseAmount);
    const hostGSTAmount = Number(cgstAmount) + Number(sgstAmount);
    const hostSubtotal = hostGst ? hostBaseAmount + hostGSTAmount : hostBaseAmount;

    const hostPlatformFee = Number(hostPlatformFeeAmount);
    const hostPlatformFeeGST = Number(hostPlatformFeeCgstAmount) + Number(hostPlatformFeeSgstAmount);
    const hostTCS = Number(tcsAmount);
    const hostTDS = Number(tdsAmount);
    const hostPenalty = Number(penaltyAmount);

    // Calculate final payout
    let finalPayout = hostSubtotal - hostPlatformFee - hostPlatformFeeGST - hostTDS;

    // Deduct TCS only if host has GST
    if (hostGst) {
        finalPayout = finalPayout - hostTCS;
    }

    // Deduct penalty only if penaltyAmount > 0 AND refundPercentage !== 100
    const shouldDeductPenalty = hostPenalty > 0 && refundPercentage !== 100;
    if (shouldDeductPenalty) {
        finalPayout = finalPayout - hostPenalty;
    }

    // Round to 2 decimal places to avoid floating-point precision issues
    finalPayout = Number(finalPayout.toFixed(2));

    const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

    return (
        <Modal
            className="w-full max-w-xs md:max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6 shadow-lg mx-auto"
            open={isOpen}
            onClose={() => onClose(false)}
        >
            <div className="flex flex-col w-full gap-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <Typography color="text-gray-900" size="lg" weight="font-semibold">
                        Booking Details
                    </Typography>
                    <div className="px-2 py-1 rounded bg-gray-100">
                        <Typography color="text-gray-600" size="xs" weight="font-semibold">
                            {hostGst ? 'GST Registered' : 'Non-GST'}
                        </Typography>
                    </div>
                </div>

                {/* Space Details */}
                <div className="flex flex-col gap-1">
                    <Typography color="text-gray-900" size="lg" weight="font-semibold">
                        {Space?.title || 'Untitled Space'}
                    </Typography>
                    <Typography color="text-gray-600" size="sm" weight="font-medium">
                        {Space?.City?.city || 'Unknown City'},{' '}
                        {Space?.City?.state || 'Unknown State'}
                    </Typography>
                    {startDatetime && endDatetime && (
                        <>
                            <div className="flex flex-row items-center justify-between mt-2">
                                <Typography color="text-gray-600" size="sm" weight="font-medium">
                                    {new Date(startDatetime).toLocaleDateString([], {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </Typography>
                                <Typography color="text-gray-600" size="sm" weight="font-medium">
                                    {new Date(startDatetime).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true,
                                    })}{' '}
                                    –{' '}
                                    {new Date(endDatetime).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true,
                                    })}
                                </Typography>
                            </div>
                        </>
                    )}
                    <div className="flex items-center justify-between mt-1">
                        <Typography color="text-gray-500" size="sm" weight="font-medium">
                            Status: {(status || 'N/A').toUpperCase()}
                        </Typography>
                    </div>
                </div>

                {/* Guest Information */}
                <div className="flex justify-between items-center">
                    <Typography color="text-gray-900" size="base" weight="font-semibold">
                        Guest
                    </Typography>
                    <Typography color="text-gray-600" size="base" weight="font-medium">
                        {User ? (
                            <>
                                {User.first_name || 'Guest'}
                                {User.last_name ? ` ${User.last_name[0]}.` : ''}
                                {activeTab !== "completed" && User.phone_number && ` (${User.phone_number})`}
                            </>
                        ) : (
                            'Guest'
                        )}
                    </Typography>
                </div>

                {/* Guest Paid Section with boxed background */}
                <div className="flex flex-col gap-4 p-4 bg-yellow-50 rounded-lg">
                    <div className="flex justify-between items-center">
                        <Typography color="text-gray-900" size="base" weight="font-semibold">
                            Guest Paid Amount
                        </Typography>
                        <Typography color="text-green-700" size="sm" weight="font-semibold">
                            Total: {formatCurrency(guestTotalAmount)}
                        </Typography>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Typography color="text-gray-600" size="sm" weight="font-medium">
                                Base Amount
                            </Typography>
                            <Typography color="text-gray-600" size="sm" weight="font-medium">
                                {formatCurrency(grossAmount)}
                            </Typography>
                        </div>

                        {spaceDiscountPerc > 0 && spaceDiscountAmt > 0 && (
                            <div className="flex justify-between text-green-600 font-medium">
                                <Typography color="text-green-600" size="sm" weight="font-medium">
                                    Space discount ({spaceDiscountPerc}%)
                                </Typography>
                                <Typography color="text-green-600" size="sm" weight="font-medium">
                                    -{formatCurrency(spaceDiscountAmt)}
                                </Typography>
                            </div>
                        )}

                        {hourlyDiscountPerc > 0 && hourlyDiscountAmt > 0 && (
                            <div className="flex justify-between text-green-600 font-medium">
                                <Typography color="text-green-600" size="sm" weight="font-medium">
                                    Hourly discount ({hourlyDiscountPerc}%)
                                </Typography>
                                <Typography color="text-green-600" size="sm" weight="font-medium">
                                    -{formatCurrency(hourlyDiscountAmt)}
                                </Typography>
                            </div>
                        )}

                        <div className="flex justify-between">
                            <Typography color="text-gray-600" size="sm" weight="font-medium">
                                Platform Fee
                            </Typography>
                            <Typography color="text-gray-600" size="sm" weight="font-medium">
                                {formatCurrency(guestPlatformFee)}
                            </Typography>
                        </div>

                        {discount > 0 && (
                            <div className="flex justify-between text-green-600 font-medium">
                                <Typography color="text-green-600" size="sm" weight="font-medium">
                                    Coupon discount {couponCode ? `(${couponCode})` : ''}
                                </Typography>
                                <Typography color="text-green-600" size="sm" weight="font-medium">
                                    -{formatCurrency(discount)}
                                </Typography>
                            </div>
                        )}

                        <div className="flex justify-between border-t border-gray-200 pt-2">
                            <Typography color="text-gray-900" size="sm" weight="font-semibold">
                                Subtotal
                            </Typography>
                            <Typography color="text-gray-900" size="sm" weight="font-semibold">
                                {formatCurrency(guestSubtotal)}
                            </Typography>
                        </div>

                        {/* GST Display - Shows IGST for non-Delhi states, CGST+SGST for Delhi */}
                        {guestGSTItems.map((gstItem, index) => (
                            <div key={index} className="flex justify-between">
                                <Typography color="text-gray-600" size="sm" weight="font-medium">
                                    {gstItem.label}
                                </Typography>
                                <Typography color="text-gray-600" size="sm" weight="font-medium">
                                    {formatCurrency(gstItem.amount)}
                                </Typography>
                            </div>
                        ))}

                        <div className="flex justify-between border-t border-gray-200 pt-2">
                            <Typography color="text-gray-900" size="sm" weight="font-semibold">
                                Total Amount Paid
                            </Typography>
                            <Typography color="text-gray-900" size="sm" weight="font-semibold">
                                {formatCurrency(guestTotalAmount)}
                            </Typography>
                        </div>
                    </div>
                </div>

                {/* Host Payout Section with boxed background */}
                <div className="flex flex-col gap-4 p-4 bg-yellow-50 rounded-lg">
                    <div className="flex justify-between items-center">
                        <Typography color="text-gray-900" size="base" weight="font-semibold">
                            Host Payout Breakdown
                        </Typography>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Typography color="text-gray-600" size="sm" weight="font-medium">
                                Base Amount
                            </Typography>
                            <Typography color="text-gray-600" size="sm" weight="font-medium">
                                {formatCurrency(hostBaseAmount)}
                            </Typography>
                        </div>

                        {hostGst && (
                            <div className="flex justify-between">
                                <Typography color="text-gray-600" size="sm" weight="font-medium">
                                    GST
                                </Typography>
                                <Typography color="text-green-600" size="sm" weight="font-medium">
                                    +{formatCurrency(hostGSTAmount)}
                                </Typography>
                            </div>
                        )}

                        <div className="flex justify-between border-t border-gray-200 pt-2">
                            <Typography color="text-gray-900" size="sm" weight="font-semibold">
                                Subtotal
                            </Typography>
                            <Typography color="text-gray-900" size="sm" weight="font-semibold">
                                {formatCurrency(hostSubtotal)}
                            </Typography>
                        </div>

                        <div className="flex justify-between">
                            <Typography color="text-gray-600" size="sm" weight="font-medium">
                                Platform Fee
                            </Typography>
                            <Typography color="text-red-600" size="sm" weight="font-medium">
                                -{formatCurrency(hostPlatformFee)}
                            </Typography>
                        </div>

                        <div className="flex justify-between">
                            <Typography color="text-gray-600" size="sm" weight="font-medium">
                                GST on Platform Fee
                            </Typography>
                            <Typography color="text-red-600" size="sm" weight="font-medium">
                                -{formatCurrency(hostPlatformFeeGST)}
                            </Typography>
                        </div>

                        {hostGst && (
                            <div className="flex justify-between">
                                <Typography color="text-gray-600" size="sm" weight="font-medium">
                                    TCS ({tcs_percent}%)
                                </Typography>
                                <Typography color="text-red-600" size="sm" weight="font-medium">
                                    -{formatCurrency(hostTCS)}
                                </Typography>
                            </div>
                        )}

                        <div className="flex justify-between">
                            <Typography color="text-gray-600" size="sm" weight="font-medium">
                                TDS ({tds_percent}%)
                            </Typography>
                            <Typography color="text-red-600" size="sm" weight="font-medium">
                                -{formatCurrency(hostTDS)}
                            </Typography>
                        </div>

                        {shouldDeductPenalty && (
                            <div className="flex justify-between">
                                <Typography color="text-gray-600" size="sm" weight="font-medium">
                                    Penalty
                                </Typography>
                                <Typography color="text-red-600" size="sm" weight="font-medium">
                                    -{formatCurrency(hostPenalty)}
                                </Typography>
                            </div>
                        )}

                        <div className="flex justify-between border-t border-gray-200 pt-2">
                            <Typography color="text-gray-900" size="sm" weight="font-semibold">
                                Final Payout to Host
                            </Typography>
                            <Typography color="text-gray-900" size="sm" weight="font-semibold">
                                {formatCurrency(finalPayout)}
                            </Typography>
                        </div>
                    </div>
                </div>

                {/* Attendees */}
                <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                    <Typography color="text-gray-600" size="sm" weight="font-medium">
                        Attendees
                    </Typography>
                    <Typography color="text-gray-600" size="sm" weight="font-medium">
                        {attendees ?? 0}
                    </Typography>
                </div>
            </div>
        </Modal>
    );
};

export default ReservationDetails;
