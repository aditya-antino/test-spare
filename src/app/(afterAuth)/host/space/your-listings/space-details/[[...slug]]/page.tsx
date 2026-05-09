'use client';
import HeaderGallery from '@/components/common/HeaderGallery';
import SpaceOverview from '@/components/common/SpaceOverview';
import SpaceInformation from '@/components/common/SpaceInformation';
import Amenities from '@/components/common/Amenities';
import SpaceRates from '@/components/common/SpaceRates';
import HostInformation from '@/components/common/HostInformation';
import LocationSection from '@/components/common/LocationSection';
import ThingsToKnow from '@/components/common/ThingsToKnow';
import { useSearchParams } from 'next/navigation';
import { SpaceDetailsInterface, useGetSpaceDetails } from '@/services';
import Footer from '@/components/layout/footer';
import { useEffect } from 'react';
import { bookingDetails } from '@/data/chatMockData';
import Reviews from '@/components/common/Reviews';

import { SpaceDetailsSkeleton } from '@/components/skeletons';
import { useAuth } from '@/hooks';

export default function Page() {
    const searchParams = useSearchParams();
    const spaceId = searchParams.get('spaceId');
    const { isAuth } = useAuth();

    const { data: spaceDetails, refetch, isLoading } = useGetSpaceDetails({
        spaceId: Number(spaceId),
    });

    useEffect(() => {
        if (spaceId) {
            refetch();
        }
    }, [spaceId, refetch]);

    const response: SpaceDetailsInterface = spaceDetails?.data;

    if (isLoading) {
        return <SpaceDetailsSkeleton />;
    }

    return (
        <>
            <div className="sm:p-8 p-2 flex flex-col w-full gap-8">
                <HeaderGallery
                    id={spaceId}
                    images={response?.SpaceImages}
                    isDeactivated={response?.isDeactivated}
                    data={{
                        title: response?.title,
                        location: response?.City?.city ?? '',
                    }}
                    onSuccess={() => {
                        refetch();
                    }}
                />
                <SpaceOverview
                    data={response}
                    bookingDetails={bookingDetails}
                    isAuthenticated={isAuth}
                />
                <SpaceInformation description={response?.detailed_description} />
                <Amenities data={response} />
                <SpaceRates listing={response?.SpaceListing} />
                <HostInformation
                    user={response?.User}
                    city={response?.City}
                    categoryMaster={response?.CategoryMaster}
                    hostReviewStats={response?.hostReviewStats}
                />
                {response?.Reviews &&
                    response.Reviews.length > 0 &&
                    !response.Reviews.some((r: any) => r.isDummy) && (
                        <Reviews
                            reviews={response.Reviews}
                            reviewCount={parseInt(response?.total_reviews || '0')}
                            avgRating={parseFloat(response?.avg_rating || '0')}
                            spaceId={parseInt(spaceId || '0')}
                        />
                    )}
                <LocationSection
                    location={response?.location}
                    address={response?.address}
                    city={response?.City}
                    area={response?.area}
                    locality={response?.locality}
                    street={response?.street}
                />
                <ThingsToKnow listing={response?.SpaceListing} />
            </div>
            <Footer />
        </>
    );
}
