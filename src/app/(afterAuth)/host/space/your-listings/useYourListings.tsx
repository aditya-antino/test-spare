'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { PATHS } from '@/constants/path';
import {
    useGetCategories,
    useGetKYCDoc,
    useGetPayoutDetails,
    useGetSpaceListFilter,
} from '@/services';

export const useYourListings = (itemsPerPage: number) => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [activeTab, setActiveTab] = useState<any>(null);
    const router = useRouter();

    const { isProfileCompleted = false, id: hostID = 0 } = useSelector(
        (data: any) => data?.auth?.user || {},
    );

    const { data: spaceListResponse, isLoading: isSpaceListLoading } = useGetSpaceListFilter({
        page: currentPage,
        category_id: activeTab,
    });

    const { data: kycDoc } = useGetKYCDoc();
    const isKYCVerified = kycDoc?.data?.length || 0;

    const { data: payoutData } = useGetPayoutDetails();
    const isPayOutDetails = payoutData?.data?.businessPan;

    const { data: spaceCategoryResponse } = useGetCategories({
        isForListing: true,
        hostId: hostID,
    });
    const spaceTypes = spaceCategoryResponse?.data?.categories ?? [];

    useEffect(() => {
        if (spaceTypes?.length && activeTab === null) {
            setActiveTab(spaceTypes[0].id);
        }
    }, [spaceTypes, activeTab]);

    const showProfileWarning = () => {
        toast.warn(
            <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-800">
                    Please complete your profile to list a space.
                </p>
                <button
                    className="w-fit bg-primary-p1 hover:bg-primary-p2 text-gray-800 font-semibold py-1 px-3 rounded text-sm"
                    onClick={() => {
                        router.push(PATHS.HOST_PROFILE);
                        toast.dismiss();
                    }}
                >
                    Go to Profile
                </button>
            </div>,
        );
    };

    const handleListSpace = () => {
        if (!isProfileCompleted || !isKYCVerified || !isPayOutDetails) {
            showProfileWarning();
            return;
        }
        router.replace(PATHS.SPACE_LIST_PATH);
    };

    const handleSpaceClick = (spaceId: number) => {
        router.push(PATHS.SPACE_DETAILS + `?spaceId=${spaceId}`);
    };

    return {
        currentPage,
        setCurrentPage,
        activeTab,
        setActiveTab,
        spaceListResponse,
        isSpaceListLoading,
        spaceTypes,
        handleListSpace,
        handleSpaceClick,
    };
};
