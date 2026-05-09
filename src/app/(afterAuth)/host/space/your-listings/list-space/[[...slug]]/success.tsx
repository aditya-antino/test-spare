import BookingCard from '@/components/common/bookingCard/bookingCard';
import ConguratulationsModal from '@/components/modals/ConguratulationsModal';
import { Button } from '@/components/ui/button';
import { PATHS } from '@/constants/path';
import { useGetSpaceDetails } from '@/services';
import { Eye, SquarePen } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

const Success = () => {
    const searchParams = useSearchParams();
    const spaceId = searchParams.get('spaceId');

    const params = React.useMemo(() => ({ spaceId: Number(spaceId) }), [spaceId]);

    const { data: spaceDetails } = useGetSpaceDetails(params);

    const router = useRouter();

    const mapApiToSpace = (apiData: any): any => {
        const data = apiData?.data;
        return {
            id: data?.id,
            title: data?.title,
            description: data?.description,
            address: data?.address ?? null,
            location: data?.City?.city ?? null,
            city: data?.City?.city ?? null,
            state: data?.City?.state,
            seats: data?.capacity,
            category_id: data?.CategoryMaster?.id ?? 0,
            space_type_id: data?.SpaceType?.id ?? 0,
            status: data?.status,
            height_ft: data?.height_ft,
            size_sqft: data?.size_sqft,
            created_at: data?.created_at,
            updated_at: data?.updated_at,
            rating: data?.avg_rating,
            reviews: data?.total_reviews,
            price: data?.SpaceListing?.price_per_hour,
            SpaceImages: data?.SpaceImages?.map((data) => data.image_url),
            SpaceType: data?.SpaceTypes?.map((item) => item.type).join(', '),
            computed_status: data?.computed_status,
            discountAmount: data?.SpaceListing?.discountAmount,
            slug: data?.slug,
        };
    };

    return (
        <div className="mt-8">
            <div className="text-gray-900 text-2xl font-semibold">Congratulations 🎉</div>
            <div className="text-gray-500 text-sm">
                Your listing has been successfully submitted and is now under review. You’ll be
                notified once it’s approved and goes live.
            </div>
            <div className="self-stretch h-[1px] my-8 bg-gray-200" />
            <div className="text-gray-900 text-lg font-semibold mb-8">This is your listing</div>
            <div className="grid sm:grid-cols-4 gap-4">
                <BookingCard space={mapApiToSpace(spaceDetails)} />
            </div>
            <div className="flex gap-4 items-center mt-6">
                <Button
                    onClick={() => {
                        router.replace(
                            `${PATHS.SPACE_LIST_PATH}?spaceId=${spaceId}&step=1&isEdit=true`,
                        );
                    }}
                    variant="outline"
                >
                    <SquarePen className="w-4 h-4 mr-2" /> Edit
                </Button>
                <Button
                    onClick={() => {
                        router.replace(PATHS.SPACE_DETAILS + `?spaceId=${spaceId}`);
                    }}
                >
                    <Eye className="w-4 h-4 mr-2" /> Preview
                </Button>
            </div>
            <ConguratulationsModal />
        </div>
    );
};

export default Success;
