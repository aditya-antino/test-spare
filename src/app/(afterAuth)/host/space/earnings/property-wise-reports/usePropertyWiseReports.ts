import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetSpaceWiseRevenue } from '@/services';
import { PATHS } from '@/constants/path';

export interface Image {
    id: number;
    imageUrl: string;
}

export interface Listing {
    id: number;
    title: string;
    SpaceImages: Image[];
}

export const usePropertyWiseReports = () => {
    const router = useRouter();
    const [page, setPage] = useState(1);

    const {
        data: propertyWiseReportsData,
        isLoading,
        isFetching,
        error,
    } = useGetSpaceWiseRevenue(page, true);

    const listings: Listing[] = propertyWiseReportsData?.data?.listings?.rows ?? [];
    const pagination = propertyWiseReportsData?.data?.pagination ?? {
        currentPage: 1,
        totalPages: 1,
    };

    const handleCardClick = (id: number) => {
        router.push(`${PATHS.HOST_EARNINGS_PROPERTY_WISE_REPORTS_DETAILS}/${id}`);
    };

    return {
        page,
        setPage,
        listings,
        pagination,
        isLoading,
        isFetching,
        error,
        handleCardClick,
    };
};
