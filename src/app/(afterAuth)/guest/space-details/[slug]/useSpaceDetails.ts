'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useAuth } from '@/hooks';
import {
    useGetGuestSpaceDetails,
    useGetGuestBookingDetails,
    useGetAuthGuestSpaceDetails,
} from '@/services';
import { setBookingData, setIsInstantBooking } from '@/store/slice/bookingSlice';

export const useSpaceDetails = (initialSpaceData?: any) => {
    const params = useParams();
    const router = useRouter();
    const dispatch = useDispatch();
    const slug = params.slug as string;
    const { isAuth: isAuthenticated } = useAuth();
    const [showVerificationModal, setShowVerificationModal] = useState(false);

    // Fetch space details based on auth status
    const authSpaceDetails = useGetAuthGuestSpaceDetails(
        { slug },
        { 
            enabled: isAuthenticated && !!slug,
            initialData: isAuthenticated && initialSpaceData ? { success: true, data: initialSpaceData } : undefined
        },
    );

    const publicSpaceDetails = useGetGuestSpaceDetails(
        { slug },
        { 
            enabled: !isAuthenticated && !!slug,
            initialData: !isAuthenticated && initialSpaceData ? { success: true, data: initialSpaceData } : undefined
        },
    );

    const spaceDetails = isAuthenticated ? authSpaceDetails : publicSpaceDetails;
    const spaceData = spaceDetails.data?.data;
    const spaceId = spaceData?.id;

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        // Prefetch booking review page for faster transition
        if (slug) {
            router.prefetch(`/booking-review/${slug}`);
        }
    }, [slug, router]);

    const { data: bookingDetails } = useGetGuestBookingDetails();

    const handleNavigateToReview = (data: any) => {
        dispatch(setBookingData(data));
        dispatch(setIsInstantBooking(false));
        router.push(`/booking-review/${slug}`);
    };

    const handleInstantBooking = (data: any) => {
        dispatch(setBookingData(data));
        dispatch(setIsInstantBooking(true));
        router.push(`/booking-review/${slug}`);
    };

    return {
        spaceId,
        spaceData,
        isLoading: spaceDetails.isLoading,
        error: spaceDetails.error,
        isAuthenticated,
        bookingDetails: bookingDetails?.data,
        handleNavigateToReview,
        handleInstantBooking,
        showVerificationModal,
        setShowVerificationModal,
        router,
    };
};
