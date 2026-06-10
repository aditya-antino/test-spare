
import React from 'react';
import { BookingDetailsType } from '@/types/booking.types';
import { AmountRow, TotalRow } from './BookingRows';
import {
    calculateHostPayout,
    getGuestPayoutAmounts,
    getHostPayoutAmounts
} from '@/utils/payoutCalculations';
import { useGetCancellationDataByBookingID } from '@/services';
import { formatCurrency } from '@/lib/utils';
import { formatGSTForDisplay } from '@/utils/gstHelpers';

interface RegularBookingAmountsProps {
    bookingDetails: BookingDetailsType;
    isInHost: boolean;
}

export const RegularBookingAmounts = ({ bookingDetails, isInHost }: RegularBookingAmountsProps) => {
    const {
        amount,
        hostPlatFormFee,
        hostPlatformFeeGST,
        hostTDS,
        hostGrandTotal,
        totalAmountNum,
        hasHostGST,
        hostSubtotal,
        cgst,
        sgst,
        tcsAmount,
        penaltyAmount,
        shouldDeductPenalty,
    } = calculateHostPayout(bookingDetails);

    const guestFeeNum = Number(
        bookingDetails?.financial?.guestPlatformFeeAmount || bookingDetails?.guestPlatformFee || 0,
    );

    const guestBaseAmount = Number(
        bookingDetails?.financial?.baseAmount || bookingDetails?.amount || 0,
    );

    const discountAmount =
        Number(bookingDetails?.financial?.discountAmount) ||
        Number((bookingDetails as any)?.discountAmount) ||
        0;
    const couponCode =
        bookingDetails?.financial?.couponCode ||
        (bookingDetails as any)?.couponCode ||
        '';

    // Calculate subtotal after platform fee and admin/coupon discount
    const guestSubtotal = guestBaseAmount + guestFeeNum - discountAmount;

    // Guest GST breakdown (calculated over subtotal after admin discount)
    const totalGuestCGST = guestSubtotal * 0.09;
    const totalGuestSGST = guestSubtotal * 0.09;

    const guestGSTItems = formatGSTForDisplay(
        bookingDetails.state || bookingDetails.spaceData?.City?.state,
        totalGuestCGST,
        totalGuestSGST,
    );

    if (isInHost) {
        return (
            <div className="mt-2 space-y-1">
                <AmountRow label="Base Amount" value={amount} />
                {hasHostGST && (
                    <AmountRow
                        label={(bookingDetails.state || bookingDetails.spaceData?.City?.state)?.toLowerCase() === 'delhi' ? "GST (CGST + SGST)" : "IGST"}
                        value={cgst + sgst}
                    />
                )}

                <div className="flex justify-between font-semibold border-t border-gray-200 pt-1">
                    <span>Subtotal</span>
                    <span>₹{formatCurrency(hostSubtotal)}</span>
                </div>

                <AmountRow label="Platform Fee" value={hostPlatFormFee} isNegative />
                {hostPlatformFeeGST > 0 && (
                    <AmountRow label="GST on Platform Fee" value={hostPlatformFeeGST} isNegative />
                )}

                {hasHostGST && <AmountRow label="TCS" value={tcsAmount} isNegative />}
                <AmountRow label="TDS" value={hostTDS} isNegative />

                {shouldDeductPenalty && (
                    <AmountRow label="Penalty Amount" value={penaltyAmount} isNegative />
                )}

                <TotalRow label="Total Payout" value={hostGrandTotal} />
            </div>
        );
    }

    return (
        <div className="mt-2 space-y-1">
            <AmountRow label="Base Amount" value={guestBaseAmount} />
            <AmountRow label="Platform Fee" value={guestFeeNum} />

            {discountAmount > 0 && (
                <AmountRow
                    label={`Admin Discount${couponCode ? ` (${couponCode})` : ''}`}
                    value={discountAmount}
                    isNegative
                />
            )}

            <div className="flex justify-between font-semibold border-t border-gray-200 pt-1 text-sm text-gray-600">
                <span>Subtotal</span>
                <span>₹{formatCurrency(guestSubtotal)}</span>
            </div>

            {guestGSTItems.map((item, i) => (
                <AmountRow key={i} label={item.label} value={item.amount} />
            ))}

            <TotalRow label="Total Amount" value={totalAmountNum} />
        </div>
    );
};

interface GuestCancellationAmountsProps {
    guestPayout: any;
    isCancelledByGuest?: boolean;
    state?: string;
    bookingDetails?: BookingDetailsType;
}

export const GuestCancellationAmounts = ({
    guestPayout,
    isCancelledByGuest = false,
    state,
    bookingDetails,
}: GuestCancellationAmountsProps) => {
    const guestRefundPercentage = guestPayout?.refundPercentage || 0;

    const guestBaseAmount = Math.abs(Number(guestPayout.baseAmount)) || 0;
    const guestPlatformFeeAmount = Math.abs(Number(guestPayout.guestPlatformFeeAmount)) || 0;

    const multiplier = guestRefundPercentage === 50 ? 2 : 1;

    const originalBaseAmount = guestBaseAmount * multiplier;
    const originalPlatformFeeAmount = guestPlatformFeeAmount * multiplier;

    const discountAmount =
        Math.abs(Number((guestPayout as any)?.discountAmount)) ||
        Math.abs(Number(bookingDetails?.financial?.discountAmount)) ||
        Math.abs(Number((bookingDetails as any)?.discountAmount)) ||
        0;
    const couponCode =
        (guestPayout as any)?.couponCode ||
        bookingDetails?.financial?.couponCode ||
        (bookingDetails as any)?.couponCode ||
        '';

    // 1. originalSubtotal = originalBaseAmount + originalPlatformFeeAmount - discountAmount
    const originalSubtotal = originalBaseAmount + originalPlatformFeeAmount - discountAmount;

    // 2. original GST breakdown calculated over originalSubtotal
    const totalOriginalGuestCGST = originalSubtotal * 0.09;
    const totalOriginalGuestSGST = originalSubtotal * 0.09;

    const originalGSTItems = formatGSTForDisplay(
        state,
        totalOriginalGuestCGST,
        totalOriginalGuestSGST,
    );

    // 3. originalTotal
    const originalTotal = originalSubtotal + totalOriginalGuestCGST + totalOriginalGuestSGST;

    // 4. Remaining/current booking amount after refund percentage is applied
    const currentDiscountAmount = discountAmount * (1 - guestRefundPercentage / 100);
    const currentSubtotal = guestBaseAmount + guestPlatformFeeAmount - currentDiscountAmount;

    // Current GST breakdown calculated over currentSubtotal
    const totalCurrentGuestCGST = currentSubtotal * 0.09;
    const totalCurrentGuestSGST = currentSubtotal * 0.09;

    const currentGSTItems = formatGSTForDisplay(
        state,
        totalCurrentGuestCGST,
        totalCurrentGuestSGST,
    );

    // Current total remaining after refund percentage is applied
    const currentTotal = currentSubtotal + totalCurrentGuestCGST + totalCurrentGuestSGST;

    // 5. Calculate refund amount
    let refundAmount = 0;
    if (guestRefundPercentage === 100) {
        if (isCancelledByGuest) {
            const subtotalRefund = originalBaseAmount - discountAmount;
            refundAmount = subtotalRefund * 1.18;
        } else {
            refundAmount = originalTotal;
        }
    } else if (guestRefundPercentage === 50) {
        refundAmount = originalTotal - currentTotal;
    }
    refundAmount = Math.max(0, refundAmount);

    // For 100% refund view subtotal and GST refunds
    const subtotalRefund = originalBaseAmount + (isCancelledByGuest ? 0 : originalPlatformFeeAmount) - discountAmount;
    const cgstRefund = subtotalRefund * 0.09;
    const sgstRefund = subtotalRefund * 0.09;
    const refundGSTItems = formatGSTForDisplay(
        state,
        cgstRefund,
        sgstRefund
    );

    if (guestRefundPercentage === 0) {
        return (
            <div className="space-y-3 mb-6">
                <h4 className="font-medium text-gray-700">
                    Booking Amount (No Refund)
                </h4>
                <div className="space-y-2">
                    <AmountRow label="Base Amount" value={originalBaseAmount} />
                    <AmountRow label="Platform Fee" value={originalPlatformFeeAmount} />

                    {discountAmount > 0 && (
                        <AmountRow
                            label={`Admin Discount${couponCode ? ` (${couponCode})` : ''}`}
                            value={discountAmount}
                            isNegative
                        />
                    )}

                    <div className="flex justify-between text-gray-600 font-semibold border-t border-gray-200 pt-1 text-sm">
                        <span>Subtotal</span>
                        <span>₹{formatCurrency(originalSubtotal)}</span>
                    </div>

                    {originalGSTItems.map((item, i) => (
                        <AmountRow key={i} label={item.label} value={item.amount} />
                    ))}

                    <TotalRow label="Total Amount Charged" value={originalTotal} />
                    <TotalRow label="Refund Amount" value={0} />
                </div>
            </div>
        );
    }

    if (guestRefundPercentage === 100) {
        return (
            <div className="space-y-6 mb-6">
                <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Original Booking Amount</h4>
                    <div className="space-y-2">
                        <AmountRow label="Base Amount" value={originalBaseAmount} />
                        <AmountRow label="Platform Fee" value={originalPlatformFeeAmount} />
                        {discountAmount > 0 && (
                            <AmountRow
                                label={`Admin Discount${couponCode ? ` (${couponCode})` : ''}`}
                                value={discountAmount}
                                isNegative
                            />
                        )}
                        <div className="flex justify-between text-gray-600 font-semibold border-t border-gray-200 pt-1 text-sm">
                            <span>Subtotal</span>
                            <span>₹{formatCurrency(originalSubtotal)}</span>
                        </div>
                        {originalGSTItems.map((item, i) => (
                            <AmountRow key={i} label={item.label} value={item.amount} />
                        ))}
                        <TotalRow label="Total Original Amount" value={originalTotal} />
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Full Refund (100%)</h4>
                    <div className="space-y-2">
                        <AmountRow label="Base Amount Refund" value={originalBaseAmount} />
                        <AmountRow
                            label="Platform Fee Refund"
                            value={isCancelledByGuest ? 0 : originalPlatformFeeAmount}
                        />
                        {discountAmount > 0 && (
                            <AmountRow
                                label={`Admin Discount Refund${couponCode ? ` (${couponCode})` : ''}`}
                                value={discountAmount}
                                isNegative
                            />
                        )}

                        <div className="flex justify-between text-gray-600 font-semibold border-t border-gray-200 pt-1 text-sm">
                            <span>Subtotal Refund</span>
                            <span>₹{formatCurrency(subtotalRefund)}</span>
                        </div>

                        {refundGSTItems.map((item, i) => (
                            <AmountRow key={i} label={`${item.label} Refund`} value={item.amount}/>
                        ))}

                        <TotalRow
                            label="Total Refund Amount"
                            value={refundAmount}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 mb-6">
            <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Original Booking Amount</h4>
                <div className="space-y-2">
                    <AmountRow label="Base Amount" value={originalBaseAmount} />
                    <AmountRow label="Platform Fee" value={originalPlatformFeeAmount} />
                    {discountAmount > 0 && (
                        <AmountRow
                            label={`Admin Discount${couponCode ? ` (${couponCode})` : ''}`}
                            value={discountAmount}
                            isNegative
                        />
                    )}
                    <div className="flex justify-between text-gray-600 font-semibold border-t border-gray-200 pt-1 text-sm">
                        <span>Subtotal</span>
                        <span>₹{formatCurrency(originalSubtotal)}</span>
                    </div>
                    {originalGSTItems.map((item, i) => (
                        <AmountRow key={i} label={item.label} value={item.amount} />
                    ))}
                    <TotalRow label="Total Original Amount" value={originalTotal} />
                </div>
            </div>

            <div className="space-y-3">
                <h4 className="font-medium text-gray-700">After 50% Refund</h4>
                <div className="space-y-2">
                    <AmountRow label="Base Amount" value={guestBaseAmount} />
                    <AmountRow label="Platform Fee" value={guestPlatformFeeAmount} />
                    {discountAmount > 0 && (
                        <AmountRow
                            label={`Admin Discount${couponCode ? ` (${couponCode})` : ''}`}
                            value={currentDiscountAmount}
                            isNegative
                        />
                    )}
                    <div className="flex justify-between text-gray-600 font-semibold border-t border-gray-200 pt-1 text-sm">
                        <span>Subtotal</span>
                        <span>₹{formatCurrency(currentSubtotal)}</span>
                    </div>
                    {currentGSTItems.map((item, i) => (
                        <AmountRow key={i} label={item.label} value={item.amount} />
                    ))}
                    <TotalRow label="Amount After Refund" value={currentTotal} />
                </div>
            </div>

            <TotalRow label="Refund Amount (50%)" value={refundAmount} />
        </div>
    );
};

interface HostCancellationAmountsProps {
    hostPayout: any;
    state?: string;
    bookingDetails?: any;
}

export const HostCancellationAmounts = ({ hostPayout, state, bookingDetails }: HostCancellationAmountsProps) => {
    let amounts = getHostPayoutAmounts(hostPayout);
    const refundPercentage = hostPayout?.refundPercentage || 0;
    const hostHasGST = hostPayout?.hostGst ?? bookingDetails?.financial?.hostGst ?? false;

    if (refundPercentage === 100 && bookingDetails) {
        const fin = bookingDetails.financial || {};
        amounts = {
            baseAmount: Number(fin.baseAmount) || Number(bookingDetails.amount) || 0,
            cgstAmount: Number(fin.cgstAmount) || Number(bookingDetails.cgst) || 0,
            sgstAmount: Number(fin.sgstAmount) || Number(bookingDetails.sgst) || 0,
            hostPlatformFee: Number(fin.hostPlatformFeeAmount) || 0,
            hostPlatformFeeCgst: Number(fin.hostPlatformFeeCgstAmount) || 0,
            hostPlatformFeeSgst: Number(fin.hostPlatformFeeSgstAmount) || 0,
            tdsAmount: Number(fin.tdsAmount) || 0,
            tcsAmount: Number(fin.tcsAmount) || 0,
            penaltyAmount: Number(hostPayout?.penaltyAmount || fin.penaltyAmount || 0) || 0,
            hostGst: fin.hostGst || false,
        };
    }

    const penaltyAmount = Number(amounts.penaltyAmount || 0);

    // Step 1: Calculate subtotal (Base + GST if host has GST)
    let hostSubtotal = amounts.baseAmount;
    if (hostHasGST) {
        hostSubtotal = amounts.baseAmount + amounts.cgstAmount + amounts.sgstAmount;
    }

    // Step 2: Deduct platform fee, platform fee GST, and TDS
    let hostTotal = hostSubtotal - amounts.hostPlatformFee - (amounts.hostPlatformFeeCgst + amounts.hostPlatformFeeSgst) - amounts.tdsAmount;

    // Step 3: Deduct TCS only if host has GST
    if (hostHasGST) {
        hostTotal = hostTotal - amounts.tcsAmount;
    }

    // Step 4: Deduct penalty only if penaltyAmount > 0 AND refundPercentage !== 100
    const shouldDeductPenalty = penaltyAmount > 0 && refundPercentage !== 100;
    if (shouldDeductPenalty) {
        hostTotal = hostTotal - penaltyAmount;
    }

    // Step 5: If full refund (100%), host amount is 0
    if (refundPercentage === 100) {
        hostTotal = 0;
    }

    const hostRefundPerc =
        refundPercentage === 0 ? 100 : refundPercentage === 100 ? 0 : refundPercentage;

    const expectedPayout =
        hostSubtotal -
        amounts.hostPlatformFee -
        (amounts.hostPlatformFeeCgst + amounts.hostPlatformFeeSgst) -
        amounts.tdsAmount -
        (hostHasGST ? amounts.tcsAmount : 0);

    return (
        <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Host Payout {`(${hostRefundPerc}%)`}</h4>

            <div className="space-y-2">
                <AmountRow label="Base Amount" value={amounts.baseAmount} />

                {hostHasGST && (
                    <AmountRow
                        label={state?.toLowerCase() === 'delhi' ? "GST (CGST + SGST)" : "IGST"}
                        value={+(amounts.cgstAmount + amounts.sgstAmount).toFixed(2)}
                    />
                )}

                <div className="flex justify-between font-semibold border-t border-gray-200 pt-1 text-sm text-gray-700">
                    <span>Subtotal</span>
                    <span>₹{formatCurrency(hostSubtotal.toFixed(2))}</span>
                </div>

                <AmountRow label="Platform Fee" value={amounts.hostPlatformFee} isNegative />

                <AmountRow
                    label="GST on Platform Fee"
                    value={(amounts.hostPlatformFeeCgst + amounts.hostPlatformFeeSgst)}
                    isNegative
                />

                {hostHasGST && <AmountRow label="TCS" value={amounts.tcsAmount} isNegative />}
                <AmountRow label="TDS" value={amounts.tdsAmount} isNegative />

                <div className="flex justify-between font-semibold border-t border-gray-200 pt-1 text-sm text-gray-700">
                    <span>Expected Payout</span>
                    <span>₹{formatCurrency(expectedPayout.toFixed(2))}</span>
                </div>

                {shouldDeductPenalty && (
                    <AmountRow label="Penalty Amount" value={penaltyAmount} isNegative />
                )}

                <TotalRow
                    label={'Total Payout'}
                    value={hostTotal.toFixed(2)}
                />
            </div>
        </div>
    );
};

interface BookingAmountsProps {
    bookingDetails: BookingDetailsType;
    isInHost: boolean;
    isCancelled: boolean;
    displayFullDetails: boolean;
}

export const BookingAmounts = ({
    bookingDetails,
    isInHost,
    isCancelled,
    displayFullDetails,
}: BookingAmountsProps) => {
    const { data: cancellationData, isLoading: isCancellationLoading } =
        useGetCancellationDataByBookingID(bookingDetails.id?.toString(), {
            enabled: isCancelled && !!bookingDetails.id,
        });

    if (isCancellationLoading) {
        return (
            <div className="text-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
                <p className="text-gray-600 text-sm mt-3">Loading cancellation details...</p>
            </div>
        );
    }

    if (isCancelled && cancellationData?.data) {
        const isCancelledByGuest = cancellationData?.data?.cancelledBy?.cancelledByType === 'guest';

        return (
            <div>
                {!isInHost && cancellationData.data.guestPayout && (
                    <GuestCancellationAmounts
                        guestPayout={cancellationData.data.guestPayout}
                        isCancelledByGuest={isCancelledByGuest}
                        state={bookingDetails.state || bookingDetails.spaceData?.City?.state}
                        bookingDetails={bookingDetails}
                    />
                )}

                {isInHost && cancellationData.data.hostPayout && (
                    <HostCancellationAmounts
                        hostPayout={cancellationData.data.hostPayout}
                        state={bookingDetails.state || bookingDetails.spaceData?.City?.state}
                        bookingDetails={bookingDetails}
                    />
                )}
            </div>
        );
    }

    if (!displayFullDetails) {
        const { hostGrandTotal, totalAmountNum } = calculateHostPayout(bookingDetails);
        return (
            <div>
                <p className="font-semibold text-gray-900 text-base">
                    <span>Total {isInHost ? 'Payout' : 'Amount'}: </span>₹
                    {isInHost ? hostGrandTotal.toFixed(2) : totalAmountNum.toFixed(2)}
                </p>
            </div>
        );
    }

    return <RegularBookingAmounts bookingDetails={bookingDetails} isInHost={isInHost} />;
};
