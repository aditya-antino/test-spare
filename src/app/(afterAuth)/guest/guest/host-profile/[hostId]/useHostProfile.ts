'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    useGetHostProfile,
    useGetGuestSpaceCategories,
    useHostRatingAndDetails,
    useGetHostProfileSpaceData,
} from '@/services';

export const useHostProfileLogic = () => {
    const params = useParams();
    const router = useRouter();
    const hostId = params.hostId as string;

    const [activeTab, setActiveTab] = useState<number | null>(null);
    const [userHasClickedTab, setUserHasClickedTab] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [showAllSpaces, setShowAllSpaces] = useState(false);

    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewPage, setReviewPage] = useState(1);
    const [hasMoreReviews, setHasMoreReviews] = useState(false);
    const [reviewPagination, setReviewPagination] = useState<any>(null);

    const { data: categoriesResponse, isLoading: categoriesLoading } = useGetGuestSpaceCategories(
        Number(hostId),
        true,
        true,
    );

    const categoriesData = categoriesResponse?.data;

    useEffect(() => {
        if (categoriesData?.categories?.length && !userHasClickedTab) {
            setActiveTab(categoriesData.categories[0].id);
        }
    }, [categoriesData, userHasClickedTab]);

    useEffect(() => {
        setCurrentPage(1);
        setShowAllSpaces(false);
    }, [activeTab]);

    const {
        data: hostProfileData,
        isLoading: isHostLoading,
        error,
    } = useGetHostProfile({
        page: currentPage,
        limit: showAllSpaces ? 10 : 3,
        hostId: hostId ? parseInt(hostId) : undefined,
    });

    const { data: spaceDataResponse, isFetching: isSpacesLoading } = useGetHostProfileSpaceData({
        page: currentPage,
        limit: showAllSpaces ? 10 : 3,
        categoryId: activeTab!,
        hostId: hostId ? parseInt(hostId) : undefined,
    });

    const {
        data: reviewsData,
        isFetching: reviewsLoading,
        refetch: refetchReviews,
    } = useHostRatingAndDetails(hostId, reviewPage);

    useEffect(() => {
        const apiResponse = reviewsData?.data?.data;
        if (!apiResponse) return;

        const { reviews: newReviews = [], pagination } = apiResponse;
        const filteredReviews = newReviews.filter((review) => review?.isDummy === false);
        setReviews((prev) => (reviewPage === 1 ? filteredReviews : [...prev, ...filteredReviews]));

        if (pagination) {
            setHasMoreReviews(pagination.currentPage < pagination.totalPages);
            setReviewPagination({
                currentPage: pagination.currentPage,
                totalPages: pagination.totalPages,
                totalReviews: pagination.totalReviews,
                limit: pagination.limit,
            });
        }
    }, [reviewsData, reviewPage]);

    const handleSeeMoreReviews = () => {
        if (hasMoreReviews) setReviewPage((prev) => prev + 1);
    };

    const handleSpaceClick = (slug: string) => {
        if (slug) {
            router.push(`/space-details/${slug}`);
        } else {
            console.warn('Space slug is missing, cannot navigate');
        }
    };

    const handleShowMoreSpaces = () => {
        setShowAllSpaces(true);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => setCurrentPage(page);

    const apiData = hostProfileData as any;
    const hostSpaceData = spaceDataResponse as any;

    const hostData = apiData?.data
        ? {
              id: apiData.data.user.id,
              name: apiData?.data?.user
                  ? `${apiData.data.user.first_name || ''} ${apiData.data.user.last_name ? apiData.data.user.last_name[0] + '.' : ''}`.trim()
                  : '-',
              avatar: apiData.data.user.avatar,
              isVerified: true,
              bio: apiData.data.user.about || '',
              jobTitle: apiData.data.user?.jobTitle || '',
              location: apiData.data.user?.City?.city || '',
              languages: apiData.data.user.languages || [],
              joinedDate: new Date(apiData.data.user.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
              }),
              avg_rating: apiData.data.overallStats.avgRating || 0,
              review_count: apiData.data.overallStats.totalReviews || 0,
          }
        : null;

    const spaceData = hostSpaceData?.data
        ? {
              spaces: hostSpaceData.data.spaces.map((space: any) => ({
                  id: space.id,
                  title: space.title,
                  description: space.description || space.title,
                  address: space.address || `${space.locality}, ${space.City?.city}`,
                  city: space.City?.city || '',
                  state: space.City?.state || '',
                  price: parseFloat(space.SpaceListing?.price_per_hour || '0'),
                  rating: parseFloat(space.avg_rating || '0'),
                  reviews: parseInt(space.total_reviews || '0'),
                  SpaceImages: space.SpaceImages || [],
                  seats: space.capacity || 0,
                  CategoryMaster: space.CategoryMaster,
                  instantBooking: space.SpaceListing.instantBooking,
                  discountAmount: space?.SpaceListing?.discountAmount,
                  isRefundable: space?.SpaceListing?.isRefundable,
                  computed_status: space?.computed_status || space?.status,
                  slug: space.slug,
              })),
          }
        : null;

    return {
        hostId,
        activeTab,
        setActiveTab,
        setUserHasClickedTab,
        currentPage,
        showAllSpaces,
        reviews,
        reviewPagination,
        categoriesData,
        categoriesLoading,
        hostProfileData,
        isHostLoading,
        isSpacesLoading,
        error,
        spaceData,
        reviewsLoading,
        refetchReviews,
        handleSeeMoreReviews,
        handleSpaceClick,
        handleShowMoreSpaces,
        handlePageChange,
        hostData,
    };
};
