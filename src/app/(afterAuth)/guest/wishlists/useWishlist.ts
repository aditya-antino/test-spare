'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { handleApiError } from '@/hooks/handleApiError';
import { getWishList } from '@/services/guest/wishlist.services';
import { getCategoriesData } from '@/services/guest/categories.services';
import { Space } from '@/services';
import { mapApiToSpace } from '@/utils/mappers';

interface Tab {
    label: string;
    value: string;
    showBadge?: boolean;
}

export const useWishlist = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<string>('all');
    const [tabOptions, setTabOptions] = useState<Tab[]>([{ label: 'All', value: 'all' }]);
    const [pagination, setPagination] = useState({ currPage: 1, totalPage: 1 });
    const [wishListData, setWishListData] = useState<Space[]>([]);
    const [loading, setLoading] = useState(false);
    const [tabLoading, setTabLoading] = useState(false);

    const refetchWishlist = () => {
        setPagination({ currPage: 1, totalPage: 1 });
        fetchWishList(1, false, activeTab);
    };

    const fetchWishList = async (page = 1, append = false, categoryId?: string) => {
        try {
            if (page === 1) setLoading(true);

            const response =
                categoryId && categoryId !== 'all'
                    ? await getWishList(page, Number(categoryId))
                    : await getWishList(page, undefined);

            if (response.status === 200) {
                const { records, count } = response.data.data;
                setPagination({
                    currPage: page,
                    totalPage: Math.ceil(count / 10),
                });
                setWishListData((prev) =>
                    append ? [...prev, ...records.map(mapApiToSpace)] : records.map(mapApiToSpace),
                );
            }
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            setTabLoading(true);
            const response = await getCategoriesData();
            if (response?.status === 200) {
                const { categories } = response.data?.data || {};
                const data: Tab[] =
                    categories?.map((item: any) => ({
                        label: item?.CategoryMaster?.name ?? '-',
                        value: String(item.categoryId),
                    })) || [];
                setTabOptions([{ label: 'All', value: 'all' }, ...data]);
            }
        } catch (error) {
            handleApiError(error);
            setTabOptions([{ label: 'All', value: 'all' }]);
        } finally {
            setTabLoading(false);
        }
    };

    const handleLoadMore = () => {
        if (pagination.currPage < pagination.totalPage) {
            const nextPage = pagination.currPage + 1;
            setPagination((prev) => ({ ...prev, currPage: nextPage }));
            fetchWishList(nextPage, true, activeTab);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (!activeTab) return;
        setPagination({ currPage: 1, totalPage: 1 });
        fetchWishList(1, false, activeTab);
    }, [activeTab]);

    return {
        activeTab,
        setActiveTab,
        tabOptions,
        pagination,
        wishListData,
        loading,
        tabLoading,
        handleLoadMore,
        refetchWishlist,
        router,
    };
};
