'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { clearBookingData, updateBookingDetails, updateMessage } from '@/store/slice/bookingSlice';
import {
    useGetGuestSpaceDetails,
    useRequestBooking,
    useRazopayBookingOrder,
    useGuestInstantBooking,
    useGetGuestBookingDetails,
    useGetKYCDoc,
} from '@/services';
import {
    openRazorpayPayment,
    formatRazorpayAmount,
    generateReceipt,
    RazorpayPaymentOptions,
} from '@/lib/razorpay';
import { toast } from 'react-toastify';
import BookingSuccessModal from '@/components/modals/BookingSuccessModal';
import BookingReview from '../../space-details/BookingReview';
import { PATHS } from '@/constants/path';
import { handleApiError } from '@/hooks/handleApiError';
import { BookingReviewSkeleton } from '@/components/skeletons';

import { useBookingReview } from './useBookingReview';

export default function BookingReviewClient() {
    const { data: kycDoc } = useGetKYCDoc();
    const isKycVerified = useMemo(() => {
        const docs = kycDoc?.data?.filter((doc: any) => doc.type !== 'pan' && doc.type !== 'gst') || [];
        return docs.length > 0;
    }, [kycDoc]);

    const {
        spaceDetails,
        isSpaceLoading,
        bookingDetails,
        currentBookingData,
        isInstantBooking,
        showSuccessModal,
        handleInstantBookingPayment,
        handleRequestToBook,
        handleBack,
        handleSuccessModalClose,
        handleMessageChange,
        handleBookingDetailsChange,
        isLoading,
    } = useBookingReview();

    // Show skeleton while space data is being fetched
    if (isSpaceLoading || !spaceDetails?.data) {
        return <BookingReviewSkeleton />;
    }

    // Show loading state for instant booking or Razorpay order creation
    if (isInstantBooking && isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-lg">
                    {spaceDetails.data?.SpaceListing?.instant_booking
                        ? 'Creating payment order...'
                        : 'Processing instant booking...'}
                </div>
            </div>
        );
    }

    return (
        <>
            <BookingReview
                spaceData={spaceDetails.data}
                bookingDetails={{
                    ...currentBookingData.bookingDetails,
                    customRules: currentBookingData.customRules,
                    cancellationPolicy: currentBookingData.cancellationPolicy,
                }}
                bookingSettings={bookingDetails?.data}
                message={currentBookingData.message}
                isInstantBooking={isInstantBooking}
                onMessageChange={handleMessageChange}
                onBookingDetailsChange={handleBookingDetailsChange}
                onBack={handleBack}
                onRequestToBook={handleRequestToBook}
                onInstantBookingPayment={handleInstantBookingPayment}
                isLoading={isLoading}
            />

            <BookingSuccessModal
                isOpen={showSuccessModal}
                onClose={handleSuccessModalClose}
                title="Your request has been taken."
                message={
                    isKycVerified
                        ? "Your booking request has been sent to the host. Once accepted, your booking will be confirmed. You will be notified of any updates."
                        : "Your booking request has been sent to the host. Once accepted, your booking will be confirmed. NOTE: Please verify your KYC details within 6 hours under your profile to prevent automatic cancellation."
                }
            />
        </>
    );
}
