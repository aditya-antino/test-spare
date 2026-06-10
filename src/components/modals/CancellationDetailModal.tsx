'use client';
import React, { useEffect } from 'react';
import { Modal } from '../ui/modal';
import Typography from '../ui/typoGraphy';
import { Button } from '../ui/button';
import { handleApiError } from '@/hooks/handleApiError';
import { toast } from 'react-toastify';
import { getInvoices } from '@/services/invoice.services';
import { useGetCancellationDataByBookingID } from '@/services';
import { Info, Download } from 'lucide-react';
import { formatGSTForDisplay } from '@/utils/gstHelpers';

interface CancellationDetailModalProps {
    isOpen: boolean;
    onClose: (value: boolean) => void;
    data?: any;
    isInMyBookingsPage?: boolean;
}

interface InvoiceButtonProps {
    onClick: () => void;
    text: string;
    disabled?: boolean;
}

const InvoiceButton = ({ onClick, text, disabled }: InvoiceButtonProps) => (
    <Button
        variant="default"
        onClick={onClick}
        disabled={disabled}
        className="text-black px-4 py-2 flex items-center justify-center gap-2 text-xs w-full"
    >
        <Download className="w-3 h-3" />
        {text}
    </Button>
);

const CancellationDetailModal: React.FC<CancellationDetailModalProps> = ({
    isOpen,
    onClose,
    data,
    isInMyBookingsPage = false,
}) => {
    if (!isOpen) return null;


    const bookingId = data?.id;
    const {
        data: cancellationData,
        isLoading,
        error,
        refetch,
    } = useGetCancellationDataByBookingID(bookingId, {
        enabled: !!bookingId && isOpen,
    });

    useEffect(() => {
        if (isOpen && bookingId) {
            refetch();
        }
    }, [isOpen, bookingId, refetch]);

    if (isLoading) {
        return (
            <Modal
                className="w-full max-w-xs md:max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6 shadow-lg mx-auto"
                open={isOpen}
                onClose={() => onClose(false)}
            >
                <div className="flex flex-col items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                    <Typography color="text-gray-600" size="base" weight="font-medium">
                        Loading cancellation details...
                    </Typography>
                </div>
            </Modal>
        );
    }

    if (error) {
        handleApiError(error);

        return (
            <Modal
                className="w-full max-w-xs md:max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6 shadow-lg mx-auto"
                open={isOpen}
                onClose={() => onClose(false)}
            >
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <Typography color="text-red-500" size="lg" weight="font-semibold">
                        Error loading data
                    </Typography>
                    <Typography color="text-gray-600" size="sm" weight="font-medium">
                        Failed to load cancellation details
                    </Typography>
                    <Button onClick={() => refetch()}>Retry</Button>
                </div>
            </Modal>
        );
    }

    if (!cancellationData?.data) {
        return (
            <Modal
                className="w-full max-w-xs md:max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6 shadow-lg mx-auto"
                open={isOpen}
                onClose={() => onClose(false)}
            >
                <div className="flex flex-col items-center justify-center h-64">
                    <Typography color="text-gray-600" size="base" weight="font-medium">
                        No cancellation data available
                    </Typography>
                </div>
            </Modal>
        );
    }

    const { hostPayout, guestPayout, cancelledBy } = cancellationData?.data;

    const isCancelledByGuest = cancelledBy?.cancelledByType === 'guest';
    const hostRefundPercentage = Number(hostPayout?.refundPercentage) || 0;
    const isFullRefund = hostRefundPercentage === 100;
    const fin = data?.financial || data?.Financial || {};

    const baseAmount = isFullRefund
        ? (Number(fin.baseAmount) || Number(data?.amount) || 0)
        : (Number(hostPayout?.baseAmount) || 0);

    const hasHostGST = isFullRefund
        ? (fin.hostGst || false)
        : (hostPayout?.hostGst || false);

    const hostCgstAmount = isFullRefund
        ? (Number(fin.cgstAmount) || Number(data?.cgst) || 0)
        : (Number(hostPayout?.cgstAmount) || 0);

    const hostSgstAmount = isFullRefund
        ? (Number(fin.sgstAmount) || Number(data?.sgst) || 0)
        : (Number(hostPayout?.sgstAmount) || 0);

    const hostPlatformFeeAmount = isFullRefund
        ? (Number(fin.hostPlatformFeeAmount) || 0)
        : (Number(hostPayout?.hostPlatformFeeAmount) || 0);

    const hostPlatformFeeCgstAmount = isFullRefund
        ? (Number(fin.hostPlatformFeeCgstAmount) || 0)
        : (Number(hostPayout?.hostPlatformFeeCgstAmount) || 0);

    const hostPlatformFeeSgstAmount = isFullRefund
        ? (Number(fin.hostPlatformFeeSgstAmount) || 0)
        : (Number(hostPayout?.hostPlatformFeeSgstAmount) || 0);

    const toatalHostPlatformFeeWithGST =
        hostPlatformFeeAmount + hostPlatformFeeCgstAmount + hostPlatformFeeSgstAmount;

    const tdsAmount = isFullRefund
        ? (Number(fin.tdsAmount) || 0)
        : (Number(hostPayout?.tdsAmount) || 0);

    const hostTCSAmount = isFullRefund
        ? (Number(fin.tcsAmount) || 0)
        : (Number(hostPayout?.tcsAmount) || 0);

    const hostPenaltyAmount = isFullRefund
        ? (Number(hostPayout?.penaltyAmount || fin.penaltyAmount || 0) || 0)
        : (Number(hostPayout?.penaltyAmount) || 0);

    const guestBaseAmount = Math.abs(Number(guestPayout.baseAmount)) || 0;
    const guestCgstAmount = Math.abs(Number(guestPayout.cgstAmount)) || 0;
    const guestSgstAmount = Math.abs(Number(guestPayout.sgstAmount)) || 0;
    const guestPlatformFeeAmount = Math.abs(Number(guestPayout.guestPlatformFeeAmount)) || 0;
    const guestPlatformFeeCgstAmount = Math.abs(Number(guestPayout.guestPlatformFeeCgstAmount)) || 0;
    const guestPlatformFeeSgstAmount = Math.abs(Number(guestPayout.guestPlatformFeeSgstAmount)) || 0;
    const guestRefundPercentage = guestPayout.refundPercentage || 0;

    const multiplier = guestRefundPercentage === 50 ? 2 : 1;
    const originalBaseAmount = guestBaseAmount * multiplier;
    const originalPlatformFeeAmount = guestPlatformFeeAmount * multiplier;

    const discountAmount =
        Math.abs(Number((guestPayout as any)?.discountAmount)) ||
        Math.abs(Number(data?.financial?.discountAmount)) ||
        Math.abs(Number(data?.Financial?.discountAmount)) ||
        Math.abs(Number(data?.discountAmount)) ||
        0;
    const couponCode =
        (guestPayout as any)?.couponCode ||
        data?.financial?.couponCode ||
        data?.Financial?.couponCode ||
        data?.couponCode ||
        '';

    // Original subtotal calculated after platform fee and admin/coupon discount
    const originalSubtotal = originalBaseAmount + originalPlatformFeeAmount - discountAmount;

    // Original GST breakdown calculated over originalSubtotal
    const totalOriginalGuestCGST = originalSubtotal * 0.09;
    const totalOriginalGuestSGST = originalSubtotal * 0.09;

    const originalGSTItems = formatGSTForDisplay(
        data?.Space?.City?.state,
        totalOriginalGuestCGST,
        totalOriginalGuestSGST
    );

    // Original total amount paid (includes GST calculated over post-coupon subtotal)
    const originalTotal = originalSubtotal + totalOriginalGuestCGST + totalOriginalGuestSGST;

    // Remaining/current booking amount after refund percentage is applied
    const currentDiscountAmount = discountAmount * (1 - guestRefundPercentage / 100);
    const currentSubtotal = guestBaseAmount + guestPlatformFeeAmount - currentDiscountAmount;

    // Current GST breakdown calculated over currentSubtotal
    const totalCurrentGuestCGST = currentSubtotal * 0.09;
    const totalCurrentGuestSGST = currentSubtotal * 0.09;

    const currentGSTItems = formatGSTForDisplay(
        data?.Space?.City?.state,
        totalCurrentGuestCGST,
        totalCurrentGuestSGST
    );

    // Current total remaining after refund percentage is applied
    const currentTotal = currentSubtotal + totalCurrentGuestCGST + totalCurrentGuestSGST;

    // Calculate refund amount:
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

    const subtotalRefund = originalBaseAmount + (isCancelledByGuest ? 0 : originalPlatformFeeAmount) - discountAmount;
    const cgstRefund = subtotalRefund * 0.09;
    const sgstRefund = subtotalRefund * 0.09;
    const refundGSTItems = formatGSTForDisplay(
        data?.Space?.City?.state,
        cgstRefund,
        sgstRefund
    );

    const refundPercentage = Number(hostPayout.refundPercentage) || 0;

    // Calculate host payout following the correct structure:
    // Step 1: Calculate subtotal (Base + GST if host has GST)
    let hostSubtotal = baseAmount;
    if (hasHostGST) {
        hostSubtotal = baseAmount + hostCgstAmount + hostSgstAmount;
    }

    // Step 2: Deduct platform fee, platform fee GST, and TDS
    let hostTotal = hostSubtotal - hostPlatformFeeAmount - (hostPlatformFeeCgstAmount + hostPlatformFeeSgstAmount) - tdsAmount;

    // Step 3: Deduct TCS only if host has GST
    if (hasHostGST) {
        hostTotal = hostTotal - hostTCSAmount;
    }

    // Step 4: Deduct penalty only if penaltyAmount > 0 AND refundPercentage !== 100
    const shouldDeductPenalty = hostPenaltyAmount > 0 && refundPercentage !== 100;
    if (shouldDeductPenalty) {
        hostTotal = hostTotal - hostPenaltyAmount;
    }

    // Step 5: If full refund (100%), host amount is 0
    if (refundPercentage === 100) {
        hostTotal = 0;
    }

    const expectedPayout =
        hostSubtotal -
        hostPlatformFeeAmount -
        (hostPlatformFeeCgstAmount + hostPlatformFeeSgstAmount) -
        tdsAmount -
        (hasHostGST ? hostTCSAmount : 0);

    const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

    const hostGSTItems = formatGSTForDisplay(
        data?.Space?.City?.state,
        hostCgstAmount,
        hostSgstAmount
    );

    // Get refund status text based on view (host or guest)
    const getRefundStatusText = () => {
        if (isInMyBookingsPage) {
            // Guest view - show guest refund percentage
            if (guestRefundPercentage === 0) return 'No Refund';
            if (guestRefundPercentage === 50) return '50% Refunded';
            if (guestRefundPercentage === 100) return '100% Refunded';
            return `${guestRefundPercentage}% Refunded`;
        } else {
            // Host view - show host refund percentage
            if (hostRefundPercentage === 0) return '100% Host Payout';
            if (hostRefundPercentage === 50) return '50% Host Payout';
            if (hostRefundPercentage === 100) return 'No Host Payout';
            return `${hostRefundPercentage}% Host Payout`;
        }
    };

    // Get badge color based on view
    const getBadgeColor = () => {
        if (isInMyBookingsPage) {
            // Guest view colors
            if (guestRefundPercentage === 0) return { bg: 'bg-red-100', text: 'text-red-600' };
            if (guestRefundPercentage === 50)
                return { bg: 'bg-yellow-100', text: 'text-yellow-600' };
            return { bg: 'bg-green-100', text: 'text-green-600' };
        } else {
            // Host view colors
            if (hostRefundPercentage === 100) return { bg: 'bg-red-100', text: 'text-red-600' };
            if (hostRefundPercentage === 50)
                return { bg: 'bg-yellow-100', text: 'text-yellow-600' };
            return { bg: 'bg-green-100', text: 'text-green-600' };
        }
    };

    const handleDownloadInvoice = async (subType?: string, isCancellation?: boolean) => {
        const roleID = isInMyBookingsPage ? '3' : '2';
        try {
            const loadingToast = toast.loading('Opening invoice...');
            const response = await getInvoices(bookingId, roleID);
            toast.dismiss(loadingToast);

            if (response?.success) {
                const invoiceData = response.data;
                if (Array.isArray(invoiceData) && invoiceData.length > 0) {
                    let targetInvoice;

                    // Guest Logic: Filter by subType and Cancellation status
                    if (isInMyBookingsPage && subType) {
                        targetInvoice = invoiceData.find((inv: any) => {
                            const isMatchingSubType = inv.subType === subType;
                            if (isCancellation !== undefined) {
                                const isCancellationInvoice = inv.invoiceNumber?.startsWith('CN-');
                                return (
                                    isMatchingSubType &&
                                    (isCancellation
                                        ? isCancellationInvoice
                                        : !isCancellationInvoice)
                                );
                            }
                            return isMatchingSubType;
                        });
                    }
                    // Host Logic: Filter by Cancellation status (simple)
                    else if (!isInMyBookingsPage && isCancellation !== undefined) {
                        targetInvoice = invoiceData.find((inv: any) => {
                            const isCancellationInvoice = inv.invoiceNumber?.startsWith('CN-');
                            return isCancellation
                                ? isCancellationInvoice
                                : !isCancellationInvoice;
                        });
                    }
                    // Fallback
                    else {
                        targetInvoice = invoiceData.find((inv: any) => inv.invoiceUrl);
                    }

                    if (targetInvoice && targetInvoice.invoiceUrl) {
                        window.open(targetInvoice.invoiceUrl, '_blank');
                    } else {
                        toast.error(
                            `Invoice not found${isCancellation !== undefined ? ` (${isCancellation ? 'Cancellation' : 'Original'})` : ''}`
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

    const renderGuestPayoutTables = () => {
        // Only show guest refund details in guest view (isInMyBookingsPage = true)
        if (!isInMyBookingsPage) return null;

        if (guestRefundPercentage === 0) {
            return (
                <>
                    <div className="mb-4">
                        <Typography
                            color="text-gray-700"
                            size="sm"
                            weight="font-semibold"
                            className="mb-2"
                        >
                            Booking Amount (No Refund)
                        </Typography>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Typography color="text-gray-600" size="sm" weight="font-medium">
                                    Base Amount
                                </Typography>
                                <Typography color="text-gray-600" size="sm" weight="font-medium">
                                    {formatCurrency(originalBaseAmount)}
                                </Typography>
                            </div>
                            <div className="flex justify-between">
                                <Typography color="text-gray-600" size="sm" weight="font-medium">
                                    Platform Fee
                                </Typography>
                                <Typography color="text-gray-600" size="sm" weight="font-medium">
                                    {formatCurrency(originalPlatformFeeAmount)}
                                </Typography>
                            </div>

                            {discountAmount > 0 && (
                                <div className="flex justify-between text-gray-600">
                                    <Typography color="text-gray-600" size="sm" weight="font-medium">
                                        Admin Discount{couponCode ? ` (${couponCode})` : ''}
                                    </Typography>
                                    <Typography color="text-red-600" size="sm" weight="font-semibold">
                                        -{formatCurrency(discountAmount)}
                                    </Typography>
                                </div>
                            )}

                            <div className="flex justify-between border-t border-gray-200 pt-2">
                                <Typography color="text-gray-900" size="sm" weight="font-semibold">
                                    Subtotal
                                </Typography>
                                <Typography color="text-gray-900" size="sm" weight="font-semibold">
                                    {formatCurrency(originalSubtotal)}
                                </Typography>
                            </div>

                            {/* GST Display - Shows IGST for non-Delhi states, CGST+SGST for Delhi */}
                            {originalGSTItems.map((gstItem, index) => (
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
                                    Total Amount Charged
                                </Typography>
                                <Typography color="text-gray-900" size="sm" weight="font-semibold">
                                    {formatCurrency(originalTotal)}
                                </Typography>
                            </div>

                            <div className="flex justify-between border-t border-red-100 pt-2 bg-red-50 p-2 rounded">
                                <Typography color="text-red-600" size="sm" weight="font-semibold">
                                    Refund Amount
                                </Typography>
                                <Typography color="text-red-600" size="sm" weight="font-semibold">
                                    ₹0.00
                                </Typography>
                            </div>
                        </div>
                    </div>
                </>
            );
        }

        if (guestRefundPercentage === 100) {
            return (
                <>
                    <div className="mb-4">
                        <Typography
                            color="text-gray-700"
                            size="sm"
                            weight="font-semibold"
                            className="mb-2"
                        >
                            Original Booking Amount
                        </Typography>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Typography color="text-gray-600" size="sm" weight="font-medium">
                                    Base Amount
                                </Typography>
                                <Typography color="text-gray-600" size="sm" weight="font-medium">
                                    {formatCurrency(originalBaseAmount)}
                                </Typography>
                            </div>
                            <div className="flex justify-between">
                                <Typography color="text-gray-600" size="sm" weight="font-medium">
                                    Platform Fee
                                </Typography>
                                <Typography color="text-gray-600" size="sm" weight="font-medium">
                                    {formatCurrency(originalPlatformFeeAmount)}
                                </Typography>
                            </div>

                            {discountAmount > 0 && (
                                <div className="flex justify-between text-gray-600">
                                    <Typography color="text-gray-600" size="sm" weight="font-medium">
                                        Admin Discount{couponCode ? ` (${couponCode})` : ''}
                                    </Typography>
                                    <Typography color="text-red-600" size="sm" weight="font-semibold">
                                        -{formatCurrency(discountAmount)}
                                    </Typography>
                                </div>
                            )}

                            <div className="flex justify-between border-t border-gray-200 pt-2">
                                <Typography color="text-gray-900" size="sm" weight="font-semibold">
                                    Subtotal
                                </Typography>
                                <Typography color="text-gray-900" size="sm" weight="font-semibold">
                                    {formatCurrency(originalSubtotal)}
                                </Typography>
                            </div>

                            {/* GST Display - Shows IGST for non-Delhi states, CGST+SGST for Delhi */}
                            {originalGSTItems.map((gstItem, index) => (
                                <div key={index} className="flex justify-between">
                                    <Typography color="text-gray-600" size="sm" weight="font-medium">
                                        {gstItem.label}
                                    </Typography>
                                    <Typography color="text-gray-600" size="sm" weight="font-medium">
                                        {formatCurrency(gstItem.amount)}
                                    </Typography>
                                </div>
                            ))}

                            <div className="flex justify-between border-t border-gray-200 pt-1">
                                <Typography color="text-gray-900" size="sm" weight="font-semibold">
                                    Total Amount Paid
                                </Typography>
                                <Typography color="text-gray-900" size="sm" weight="font-semibold">
                                    {formatCurrency(originalTotal)}
                                </Typography>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <Typography
                            color="text-gray-700"
                            size="sm"
                            weight="font-semibold"
                            className="mb-2"
                        >
                            Full Refund (100%)
                        </Typography>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Typography color="text-gray-600" size="sm" weight="font-medium">
                                    Base Amount Refund
                                </Typography>
                                <Typography color="text-gray-600" size="sm" weight="font-medium">
                                    {formatCurrency(originalBaseAmount)}
                                </Typography>
                            </div>
                            <div className="flex justify-between">
                                <Typography color="text-gray-600" size="sm" weight="font-medium">
                                    Platform Fee Refund
                                </Typography>
                                <Typography color="text-gray-600" size="sm" weight="font-medium">
                                    {formatCurrency(isCancelledByGuest ? 0 : originalPlatformFeeAmount)}
                                </Typography>
                            </div>

                            {discountAmount > 0 && (
                                <div className="flex justify-between text-gray-600 mt-1">
                                    <Typography color="text-gray-600" size="sm" weight="font-medium">
                                        Admin Discount{couponCode ? ` (${couponCode})` : ''}
                                    </Typography>
                                    <Typography color="text-red-600" size="sm" weight="font-semibold">
                                        -{formatCurrency(discountAmount)}
                                    </Typography>
                                </div>
                            )}

                            <div className="flex justify-between border-t border-gray-200 pt-2">
                                <Typography color="text-gray-900" size="sm" weight="font-semibold">
                                    Subtotal Refund
                                </Typography>
                                <Typography color="text-gray-900" size="sm" weight="font-semibold">
                                    {formatCurrency(subtotalRefund)}
                                </Typography>
                            </div>

                            {/* GST Refund Display - Shows IGST for non-Delhi states, CGST+SGST for Delhi */}
                            {refundGSTItems.map((gstItem, index) => (
                                <div key={index} className="flex justify-between">
                                    <Typography color="text-gray-600" size="sm" weight="font-medium">
                                        {gstItem.label} Refund
                                    </Typography>
                                    <Typography color="text-gray-600" size="sm" weight="font-medium">
                                        {formatCurrency(gstItem.amount)}
                                    </Typography>
                                </div>
                            ))}

                            <div className="flex justify-between border-t border-green-100 pt-2 bg-green-50 p-2 rounded">
                                <Typography color="text-green-600" size="sm" weight="font-semibold">
                                    Total Refund Amount
                                </Typography>
                                <Typography color="text-green-600" size="sm" weight="font-semibold">
                                    {formatCurrency(refundAmount)}
                                </Typography>
                            </div>
                        </div>
                    </div>
                </>
            );
        }

        // 50% refund case (guest view only)
        return (
            <>
                <div className="mb-4">
                    <Typography
                        color="text-gray-700"
                        size="sm"
                        weight="font-semibold"
                        className="mb-2"
                    >
                        Original Booking Amount
                    </Typography>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Typography color="text-gray-600" size="sm" weight="font-medium">
                                Base Amount
                            </Typography>
                            <Typography color="text-gray-600" size="sm" weight="font-medium">
                                {formatCurrency(originalBaseAmount)}
                            </Typography>
                        </div>
                        <div className="flex justify-between">
                            <Typography color="text-gray-600" size="sm" weight="font-medium">
                                Platform Fee
                            </Typography>
                            <Typography color="text-gray-600" size="sm" weight="font-medium">
                                {formatCurrency(originalPlatformFeeAmount)}
                            </Typography>
                        </div>

                        {discountAmount > 0 && (
                            <div className="flex justify-between text-gray-600">
                                <Typography color="text-gray-600" size="sm" weight="font-medium">
                                    Admin Discount{couponCode ? ` (${couponCode})` : ''}
                                </Typography>
                                <Typography color="text-red-600" size="sm" weight="font-semibold">
                                    -{formatCurrency(discountAmount)}
                                </Typography>
                            </div>
                        )}

                        <div className="flex justify-between border-t border-gray-200 pt-2">
                            <Typography color="text-gray-900" size="sm" weight="font-semibold">
                                Subtotal
                            </Typography>
                            <Typography color="text-gray-900" size="sm" weight="font-semibold">
                                {formatCurrency(originalSubtotal)}
                            </Typography>
                        </div>

                        {/* GST Display - Shows IGST for non-Delhi states, CGST+SGST for Delhi */}
                        {originalGSTItems.map((gstItem, index) => (
                            <div key={index} className="flex justify-between">
                                <Typography color="text-gray-600" size="sm" weight="font-medium">
                                    {gstItem.label}
                                </Typography>
                                <Typography color="text-gray-600" size="sm" weight="font-medium">
                                    {formatCurrency(gstItem.amount)}
                                </Typography>
                            </div>
                        ))}

                        <div className="flex justify-between border-t border-gray-200 pt-1">
                            <Typography color="text-gray-900" size="sm" weight="font-semibold">
                                Total Amount Paid
                            </Typography>
                            <Typography color="text-gray-900" size="sm" weight="font-semibold">
                                {formatCurrency(originalTotal)}
                            </Typography>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <Typography
                        color="text-gray-700"
                        size="sm"
                        weight="font-semibold"
                        className="mb-2"
                    >
                        After 50% Refund
                    </Typography>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Typography color="text-gray-600" size="sm" weight="font-medium">
                                Base Amount
                            </Typography>
                            <Typography color="text-gray-600" size="sm" weight="font-medium">
                                {formatCurrency(guestBaseAmount)}
                            </Typography>
                        </div>
                        <div className="flex justify-between">
                            <Typography color="text-gray-600" size="sm" weight="font-medium">
                                Platform Fee
                            </Typography>
                            <Typography color="text-gray-600" size="sm" weight="font-medium">
                                {formatCurrency(guestPlatformFeeAmount)}
                            </Typography>
                        </div>

                        {discountAmount > 0 && (
                            <div className="flex justify-between text-gray-600">
                                <Typography color="text-gray-600" size="sm" weight="font-medium">
                                    Admin Discount{couponCode ? ` (${couponCode})` : ''}
                                </Typography>
                                <Typography color="text-red-600" size="sm" weight="font-semibold">
                                    -{formatCurrency(currentDiscountAmount)}
                                </Typography>
                            </div>
                        )}

                        <div className="flex justify-between border-t border-gray-200 pt-2">
                            <Typography color="text-gray-900" size="sm" weight="font-semibold">
                                Subtotal
                            </Typography>
                            <Typography color="text-gray-900" size="sm" weight="font-semibold">
                                {formatCurrency(currentSubtotal)}
                            </Typography>
                        </div>

                        {/* GST Display - Shows IGST for non-Delhi states, CGST+SGST for Delhi */}
                        {currentGSTItems.map((gstItem, index) => (
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
                                Amount After Refund
                            </Typography>
                            <Typography color="text-gray-900" size="sm" weight="font-semibold">
                                {formatCurrency(currentTotal)}
                            </Typography>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between border-t border-green-100 pt-2 bg-green-50 p-2 rounded">
                    <Typography color="text-green-600" size="sm" weight="font-semibold">
                        Refund Amount (50%)
                    </Typography>
                    <Typography color="text-green-600" size="sm" weight="font-semibold">
                        {formatCurrency(refundAmount)}
                    </Typography>
                </div>
            </>
        );
    };

    const renderHostPayoutTables = () => {
        // Only show host payout in host view (isInMyBookingsPage = false)
        if (isInMyBookingsPage) return null;

        return (
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
                            {formatCurrency(baseAmount)}
                        </Typography>
                    </div>

                    {hasHostGST && (
                        <>
                            {/* GST Display - Shows IGST for non-Delhi states, CGST+SGST for Delhi */}
                            {hostGSTItems.map((gstItem, index) => (
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
                                <Typography color="text-gray-700" size="sm" weight="font-semibold">
                                    Subtotal
                                </Typography>
                                <Typography color="text-gray-700" size="sm" weight="font-semibold">
                                    {formatCurrency(hostSubtotal)}
                                </Typography>
                            </div>
                        </>
                    )}

                    <div className="flex justify-between">
                        <Typography color="text-gray-600" size="sm" weight="font-medium">
                            Platform Fee
                        </Typography>
                        <Typography color="text-gray-600" size="sm" weight="font-medium">
                            -{formatCurrency(hostPlatformFeeAmount)}
                        </Typography>
                    </div>

                    <div className="flex justify-between">
                        <Typography color="text-gray-600" size="sm" weight="font-medium">
                            GST on Platform Fee
                        </Typography>
                        <Typography color="text-gray-600" size="sm" weight="font-medium">
                            -{formatCurrency(hostPlatformFeeCgstAmount + hostPlatformFeeSgstAmount)}
                        </Typography>
                    </div>

                    <div className="flex justify-between">
                        <Typography color="text-gray-600" size="sm" weight="font-medium">
                            TDS
                        </Typography>
                        <Typography color="text-gray-600" size="sm" weight="font-medium">
                            -{formatCurrency(tdsAmount)}
                        </Typography>
                    </div>

                    {hasHostGST && (
                        <div className="flex justify-between">
                            <Typography color="text-gray-600" size="sm" weight="font-medium">
                                TCS
                            </Typography>
                            <Typography color="text-gray-600" size="sm" weight="font-medium">
                                -{formatCurrency(hostTCSAmount)}
                            </Typography>
                        </div>
                    )}

                    {shouldDeductPenalty && (
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Typography color="text-gray-600" size="sm" weight="font-medium">
                                    Penalty
                                </Typography>
                            </div>
                            <Typography color="text-red-600" size="sm" weight="font-medium">
                                -{formatCurrency(hostPenaltyAmount)}
                            </Typography>
                        </div>
                    )}

                    {hostPenaltyAmount > 0 && refundPercentage === 100 && (
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Typography color="text-gray-600" size="sm" weight="font-medium">
                                    Penalty (Adjusted Later)
                                </Typography>
                                <button
                                    type="button"
                                    className="relative group"
                                    title="Penalty Information"
                                >
                                    <Info className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-48 z-10">
                                        This penalty will be adjusted against your future bookings.
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white border-r border-b border-gray-200 rotate-45"></div>
                                    </div>
                                </button>
                            </div>
                            <Typography color="text-red-600" size="sm" weight="font-medium">
                                -{formatCurrency(hostPenaltyAmount)}
                            </Typography>
                        </div>
                    )}

                    <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                        <Typography color="text-gray-900" size="sm" weight="font-semibold">
                            Expected Payout
                        </Typography>
                        <Typography color="text-gray-900" size="sm" weight="font-semibold">
                            {formatCurrency(expectedPayout)}
                        </Typography>
                    </div>

                    <div className="flex justify-between border-t border-gray-300 pt-2 mt-2">
                        <Typography color="text-gray-900" size="sm" weight="font-semibold">
                            Final Payout to Host
                        </Typography>
                        <Typography color="text-gray-900" size="sm" weight="font-semibold">
                            {formatCurrency(hostTotal)}
                        </Typography>
                    </div>
                </div>
            </div>
        );
    };

    const badgeColor = getBadgeColor();

    return (
        <Modal
            key={`cancellation-modal-${data?.id}`}
            className="w-full max-w-xs md:max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6 shadow-lg mx-auto"
            open={isOpen}
            onClose={() => onClose(false)}
        >
            <div className="flex flex-col w-full gap-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <Typography color="text-gray-900" size="lg" weight="font-semibold">
                        Cancellation Details
                    </Typography>
                    <div className="px-2 py-1 rounded bg-gray-100">
                        <Typography color="text-gray-600" size="xs" weight="font-semibold">
                            {isInMyBookingsPage ? 'Guest View' : 'Host View'}
                        </Typography>
                    </div>
                </div>

                {/* Space Details */}
                <div className="flex flex-col gap-1">
                    <Typography color="text-gray-900" size="lg" weight="font-semibold">
                        {data?.Space?.title || 'Untitled Space'}
                    </Typography>
                    <Typography color="text-gray-600" size="sm" weight="font-medium">
                        {data?.Space?.City?.city || 'Unknown City'},{' '}
                        {data?.Space?.City?.state || 'Unknown State'}
                    </Typography>
                    {data?.startDatetime && data?.endDatetime && (
                        <>
                            <div className="flex flex-row items-center justify-between mt-2">
                                <Typography color="text-gray-600" size="sm" weight="font-medium">
                                    {new Date(data.startDatetime).toLocaleDateString([], {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </Typography>
                                <Typography color="text-gray-600" size="sm" weight="font-medium">
                                    {new Date(data.startDatetime).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true,
                                    })}{' '}
                                    –{' '}
                                    {new Date(data.endDatetime).toLocaleTimeString([], {
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
                            Status: {(data?.status || 'N/A').toUpperCase()}
                        </Typography>
                        <div className={`px-2 py-1 rounded ${badgeColor.bg}`}>
                            <Typography color={badgeColor.text} size="xs" weight="font-semibold">
                                {getRefundStatusText()}
                            </Typography>
                        </div>
                    </div>
                </div>

                {/* Guest Payout Section (only for guest view) */}
                {isInMyBookingsPage && (
                    <div className="flex flex-col gap-4 p-4 bg-yellow-50 rounded-lg">
                        <div className="flex justify-between items-center">
                            <Typography color="text-gray-900" size="base" weight="font-semibold">
                                Guest Amount Breakdown
                            </Typography>
                        </div>
                        {renderGuestPayoutTables()}
                    </div>
                )}

                {/* Host Payout Section (only for host view) */}
                {renderHostPayoutTables()}

                {!isInMyBookingsPage && data?.status?.toLowerCase() === 'cancelled' && (
                    <div className="pt-4 border-t border-gray-200">
                        <div className={`grid grid-cols-1 ${refundPercentage !== 0 ? 'sm:grid-cols-2' : ''} gap-3`}>
                            {refundPercentage !== 0 &&
                                <InvoiceButton
                                    onClick={() => handleDownloadInvoice('', true)}
                                    text="Download Cancellation Invoice"
                                    disabled={isLoading}
                                />
                            }
                            <InvoiceButton
                                onClick={() => handleDownloadInvoice('', false)}
                                text="Download Original Invoice"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default CancellationDetailModal;
