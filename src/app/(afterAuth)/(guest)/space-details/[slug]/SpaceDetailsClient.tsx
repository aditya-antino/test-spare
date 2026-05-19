'use client';
import Amenities from '@/components/common/Amenities';
import HeaderGallery from '@/components/common/HeaderGallery';
import HostInformation from '@/components/common/HostInformation';
import LocationSection from '@/components/common/LocationSection';
import Reviews from '@/components/common/Reviews';
import SpaceInformation from '@/components/common/SpaceInformation';
import SpaceOverview from '@/components/common/SpaceOverview';
import SpaceRates from '@/components/common/SpaceRates';
import ThingsToKnow from '@/components/common/ThingsToKnow';
import RecommendedSpaces from '@/components/common/RecommendedSpaces';
import Footer from '@/components/layout/footer';
import React from 'react';
import BookingForm from '../bookingForm';
import { PATHS } from '@/constants/path';
import VerificationRequiredModal from '@/components/modals/VerificationRequiredModal';
import { SpaceDetailsSkeleton } from '@/components/skeletons';
import { EmptyState } from '@/components/common';
import { useSpaceDetails } from './useSpaceDetails';

interface SpaceDetailsClientProps {
    initialSpaceData?: any;
}

const SpaceDetailsClient = ({ initialSpaceData }: SpaceDetailsClientProps) => {
    const {
        spaceData: fetchedSpaceData,
        isLoading,
        error,
        isAuthenticated,
        bookingDetails,
        handleNavigateToReview,
        handleInstantBooking,
        showVerificationModal,
        setShowVerificationModal,
        router,
    } = useSpaceDetails(initialSpaceData);

    const spaceData = fetchedSpaceData || initialSpaceData;

    // Handle loading state
    if (!spaceData && isLoading) {
        return <SpaceDetailsSkeleton />;
    }

    // Handle error state
    if (error && !spaceData) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <EmptyState
                    title="Something went wrong"
                    description="We couldn't load the space details. Please try again later."
                    actionLabel="Go Back"
                    onAction={() => router.back()}
                />
            </div>
        );
    }

    // Handle case when space details are not available
    if (!spaceData) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <EmptyState
                    title="Space not found"
                    description="The space you are looking for does not exist or has been removed."
                    actionLabel="Browse Spaces"
                    onAction={() => router.push(PATHS.SPACE_LISTING_PAGE_GUEST)}
                />
            </div>
        );
    }

    return (
        <>
            <div className="px-2 md:px-12 my-4 ">
                <HeaderGallery
                    id={spaceData.id}
                    images={spaceData?.SpaceImages?.map((img) => ({
                        id: img.id,
                        image_url: img.image_url,
                        is_featured: img.is_featured,
                    }))}
                    data={{
                        id: spaceData?.id,
                        title: spaceData?.title,
                        location: spaceData?.City?.city ?? '',
                    }}
                    isInWishlist={spaceData?.isWishlist}
                    showHeader={false}
                />
            </div>

            <div className="flex px-2 md:px-12 flex-col gap-10">
                <div className="flex w-full gap-10 h-fit items-start">
                    <div className="flex-1 flex flex-col gap-10 min-w-0">
                        <SpaceOverview
                            data={spaceData}
                            bookingDetails={bookingDetails}
                            bookingSettings={bookingDetails}
                            isAuthenticated={isAuthenticated}
                        />
                        <SpaceInformation description={spaceData?.detailedDescription} />
                        <Amenities data={spaceData} />
                        <SpaceRates
                            listing={spaceData?.SpaceListing}
                            bookingSettings={bookingDetails}
                        />
                        <HostInformation
                            user={spaceData?.User}
                            city={spaceData?.City}
                            categoryMaster={spaceData?.CategoryMaster}
                            hostReviewStats={spaceData?.hostReviewStats}
                        />
                        {/* <Reviews reviews={spaceData?.Reviews || []} /> */}
                        {spaceData?.Reviews &&
                            spaceData.Reviews.length > 0 &&
                            !spaceData.Reviews.some((r: any) => r.isDummy) && (
                                <Reviews reviews={spaceData.Reviews} />
                        )}
                        <LocationSection
                            location={spaceData?.location}
                            address={spaceData?.address}
                            city={spaceData?.City}
                            area={spaceData?.area}
                            locality={spaceData?.locality}
                            street={spaceData?.street}
                        />
                        <ThingsToKnow listing={spaceData?.SpaceListing} />
                    </div>

                    <div className="w-[430px] sticky top-10 h-[calc(100vh-5rem)] overflow-y-auto shrink-0 md:block hidden">
                        <BookingForm
                            spaceData={spaceData}
                            bookingDetails={bookingDetails}
                            onNavigateToReview={handleNavigateToReview}
                            onInstantBooking={handleInstantBooking}
                            openVerificationModal={setShowVerificationModal}
                        />
                    </div>
                </div>

                {spaceData?.id && <RecommendedSpaces spaceId={spaceData?.id} />}
                <Footer />
            </div>

            <VerificationRequiredModal
                isAuthenticated={isAuthenticated}
                isOpen={showVerificationModal}
                onClose={() => setShowVerificationModal(false)}
                verificationPath={PATHS.GUEST_VERIFICATION}
            />
        </>
    );
};

export default SpaceDetailsClient;