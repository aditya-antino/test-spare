
import { BookingDetailsType } from '@/types/booking.types';

export const calculateHostPayout = (bookingDetails: BookingDetailsType) => {
    const amount =
        Number(bookingDetails?.financial?.baseAmount) || Number(bookingDetails?.amount || 0) || 0;

    // Get platform fee and platform fee GST
    const hostPlatFormFee = Number(bookingDetails?.financial?.hostPlatformFeeAmount) || 0;
    const hostPlatformFeeCgst = Number(bookingDetails?.financial?.hostPlatformFeeCgstAmount) || 0;
    const hostPlatformFeeSgst = Number(bookingDetails?.financial?.hostPlatformFeeSgstAmount) || 0;
    const hostPlatformFeeGST = hostPlatformFeeCgst + hostPlatformFeeSgst;

    // Get TDS and TCS amounts
    const hostTDS = Number(bookingDetails?.financial?.tdsAmount) || 0;
    const tcsAmount = Number(bookingDetails?.financial?.tcsAmount) || 0;

    // Get host GST details
    const hasHostGST = bookingDetails?.financial?.hostGst || false;
    const cgst = Number(bookingDetails?.financial?.cgstAmount) || Number(bookingDetails?.cgst) || 0;
    const sgst = Number(bookingDetails?.financial?.sgstAmount) || Number(bookingDetails?.sgst) || 0;

    // Get penalty and refund details
    const penaltyAmount = Number(bookingDetails?.financial?.penaltyAmount) || 0;
    const refundPercentage = Number(bookingDetails?.financial?.refundPercentage) || 0;

    // Calculate host amount following the correct structure:
    // Step 1: Calculate subtotal (Base + GST if host has GST)
    let hostSubtotal = amount;
    if (hasHostGST) {
        hostSubtotal = amount + cgst + sgst;
    }

    // Step 2: Deduct platform fee, platform fee GST, and TDS
    let hostGrandTotal = hostSubtotal - hostPlatFormFee - hostPlatformFeeGST - hostTDS;

    // Step 3: Deduct TCS only if host has GST
    if (hasHostGST) {
        hostGrandTotal = hostGrandTotal - tcsAmount;
    }

    // Step 4: Deduct penalty only if penaltyAmount > 0 AND refundPercentage !== 100
    const shouldDeductPenalty = penaltyAmount > 0 && refundPercentage !== 100;
    if (shouldDeductPenalty) {
        hostGrandTotal = hostGrandTotal - penaltyAmount;
    }

    const totalAmountNum = Number(bookingDetails?.totalAmount || 0);

    return {
        hostPlatFormFee,
        hostPlatformFeeGST,
        hostTDS,
        hostGrandTotal,
        totalAmountNum,
        amount,
        hasHostGST,
        hostSubtotal,
        cgst,
        sgst,
        tcsAmount,
        penaltyAmount,
        shouldDeductPenalty
    };
};

export const getGuestPayoutAmounts = (guestPayout: any) => {
    const baseAmount = parseFloat(guestPayout?.baseAmount || '0') || 0;
    const cgstAmount = parseFloat(guestPayout?.cgstAmount || '0') || 0;
    const sgstAmount = parseFloat(guestPayout?.sgstAmount || '0') || 0;
    const platformFee = parseFloat(guestPayout?.guestPlatformFeeAmount || '0') || 0;
    const platformFeeCgst = parseFloat(guestPayout?.guestPlatformFeeCgstAmount || '0') || 0;
    const platformFeeSgst = parseFloat(guestPayout?.guestPlatformFeeSgstAmount || '0') || 0;

    return {
        baseAmount,
        cgstAmount,
        sgstAmount,
        platformFee,
        platformFeeCgst,
        platformFeeSgst,
        total:
            baseAmount + cgstAmount + sgstAmount + platformFee + platformFeeCgst + platformFeeSgst,
    };
};

export const getHostPayoutAmounts = (hostPayout: any) => {
    const baseAmount = parseFloat(hostPayout?.baseAmount || '0') || 0;
    const cgstAmount = parseFloat(hostPayout?.cgstAmount || '0') || 0;
    const sgstAmount = parseFloat(hostPayout?.sgstAmount || '0') || 0;
    const hostPlatformFee = parseFloat(hostPayout?.hostPlatformFeeAmount || '0') || 0;
    const hostPlatformFeeCgst = parseFloat(hostPayout?.hostPlatformFeeCgstAmount || '0') || 0;
    const hostPlatformFeeSgst = parseFloat(hostPayout?.hostPlatformFeeSgstAmount || '0') || 0;
    const tdsAmount = parseFloat(hostPayout?.tdsAmount || '0') || 0;
    const tcsAmount = parseFloat(hostPayout?.tcsAmount || '0') || 0;
    const penaltyAmount = parseFloat(hostPayout?.penaltyAmount || '0') || 0;
    const hostGst = hostPayout.hostGst || false;

    return {
        baseAmount,
        cgstAmount,
        sgstAmount,
        hostPlatformFee,
        hostPlatformFeeCgst,
        hostPlatformFeeSgst,
        tdsAmount,
        tcsAmount,
        penaltyAmount,
        hostGst,
    };
};
