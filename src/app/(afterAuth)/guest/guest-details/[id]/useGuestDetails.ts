'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { handleApiError } from '@/hooks/handleApiError';
import { getGuestRatingAndDetails } from '@/services/ratings.services';
import { capitalizeWord } from '@/utils/helperFunctions';

interface GuestData {
    id: number;
    name: string;
    avatar: string;
    rating: number;
    reviewCount: number;
    bio: string;
    languages: string[];
    joinedDate: string;
    reviews: any[];
    jobTitle: string;
}

interface Pagination {
    currentPage: number;
    totalPages: number;
    totalReviews: number;
    limit: number;
}

export const useGuestDetails = () => {
    const { id } = useParams();
    const guestId = id as string;

    const [guestData, setGuestData] = useState<GuestData>({
        id: 0,
        name: '',
        avatar: '',
        rating: 0,
        reviewCount: 0,
        bio: '',
        languages: [],
        joinedDate: '',
        reviews: [],
        jobTitle: '',
    });

    const [pagination, setPagination] = useState<Pagination>({
        currentPage: 1,
        totalPages: 1,
        totalReviews: 0,
        limit: 5,
    });

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const fetchGuestProfile = async (append = false) => {
        try {
            append ? setIsLoadingMore(true) : setIsLoading(true);

            const response = await getGuestRatingAndDetails(guestId, page);

            if (response.status === 200) {
                const apiData = response.data?.data;
                const guest = apiData.guest;
                const reviews = apiData.reviews || [];
                const paginationData = apiData.pagination || {
                    currentPage: 1,
                    totalPages: 1,
                    totalReviews: 0,
                    limit: 1,
                };

                const transformedData: GuestData = {
                    id: guest.id,
                    name: guest?.first_name
                        ? capitalizeWord(
                              `${guest.first_name}${guest.last_name ? ` ${guest.last_name[0]}.` : ''}`,
                          )
                        : '-',
                    avatar: guest.avatar || '',
                    rating: guest.average_rating || 0,
                    reviewCount: paginationData.totalReviews || 0,
                    bio: guest.about || 'No bio available',
                    languages: guest.languages || [],
                    joinedDate: new Date(guest.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                    }),
                    reviews: append ? [...guestData.reviews, ...reviews] : reviews,
                    jobTitle: guest.jobTitle || '',
                };

                setGuestData(transformedData);
                setPagination(paginationData);
            }
        } catch (err) {
            setError('Failed to fetch guest profile');
            handleApiError(err);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        if (guestId) fetchGuestProfile();
    }, [guestId]);

    const handleSeeMore = () => {
        if (page < pagination.totalPages && !isLoadingMore) setPage((prev) => prev + 1);
    };

    useEffect(() => {
        if (page > 1) fetchGuestProfile(true);
    }, [page]);

    return {
        guestData,
        pagination,
        isLoading,
        error,
        isLoadingMore,
        handleSeeMore,
        fetchGuestProfile,
    };
};
