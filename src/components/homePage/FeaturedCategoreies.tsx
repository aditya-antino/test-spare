'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import dummyImage from '@/assets/Login.png';
import ArrowScrollWrapper from '@/components/ui/arrowScrollWrapper';
import { handleApiError } from '@/hooks/handleApiError';
import { getCategoriesData } from '@/services/guest/categories.services';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setSelectedCategories } from '@/store/slice/homePageSearchSlice';
import { toast } from 'react-toastify';
import { PATHS } from '@/constants/path';

interface Category {
    categoryId: number;
    CategoryMaster: {
        name: string;
        imgUrl: string;
    };
}

interface FeaturedCategoriesProps {
    initialCategories?: Category[];
}

interface CategoryCardProps {
    category: Category;
    onClick: (category: Category) => void;
}

const CategoryCard = React.memo(function CategoryCard({ category, onClick }: CategoryCardProps) {
    const handleClick = useCallback(() => {
        onClick(category);
    }, [onClick, category]);

    return (
        <div
            className="group min-w-[240px] w-full cursor-pointer p-2 relative"
            onClick={handleClick}
        >
            <div className="relative w-full h-[340px] overflow-hidden rounded-[2rem] shadow-sm transition-all duration-500 ease-out group-hover:shadow-[0_20px_40px_-15px_rgba(247,205,41,0.25)] group-hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/80 z-10 transition-opacity duration-300 opacity-60 group-hover:opacity-80" />
                <Image
                    src={category?.CategoryMaster?.imgUrl || dummyImage}
                    alt={category?.CategoryMaster?.name || 'Category'}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    unoptimized
                />

                <div className="absolute bottom-6 left-6 right-6 z-20 transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                    <h3 className="text-white text-xl font-bold tracking-wide">
                        {category?.CategoryMaster?.name || 'Untitled'}
                    </h3>
                    <div className="h-1 w-8 bg-[#F7CD29] rounded-full mt-2 transition-all duration-300 group-hover:w-16" />
                </div>
            </div>
        </div>
    );
});

const FeaturedCategories = React.memo(function FeaturedCategories({
    initialCategories = [],
}: FeaturedCategoriesProps) {
    const router = useRouter();
    const dispatch = useDispatch();
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialCategories.length === 0) {
            fetchCategories();
        }
    }, [initialCategories.length]);

    async function fetchCategories() {
        try {
            setLoading(true);
            const response = await getCategoriesData();
            if (response?.status === 200) {
                const { categories } = response.data?.data || {};
                setCategories(categories || []);
            } else {
                setCategories([]);
            }
        } catch (error) {
            handleApiError(error);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    }

    const handlePressSearch = useCallback(
        (category: Category) => {
            if (category) {
                const formattedCategory = {
                    item: {
                        id: category.categoryId,
                        name: category.CategoryMaster.name,
                    },
                    type: 'spaces',
                };

                dispatch(setSelectedCategories([formattedCategory]));
                router.push(PATHS.SPACE_LISTING_PAGE_GUEST || '/space-list');
                return;
            }
            toast.error('Something went wrong!!');
        },
        [dispatch, router],
    );

    if (Array.isArray(categories) && categories.length <= 0 && !loading) return null;

    return (
        <section className="py-4 px-4 md:px-16 relative w-full ">
            <div className="text-center mb-12 flex flex-col items-center">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                    Featured <span className="text-[#F7CD29]">Categories</span>
                </h2>
                <p className="text-black text-sm md:text-base font-medium mt-3 max-w-lg">
                    Explore our most popular space types, perfectly tailored for thousands of
                    different needs and ideas.
                </p>
            </div>

            <ArrowScrollWrapper>
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="min-w-[240px] w-full p-2">
                            <div className="relative w-full h-[340px] overflow-hidden rounded-[2rem] bg-slate-200 animate-pulse" />
                            <div className="pt-4 px-2">
                                <div className="h-5 w-3/4 bg-slate-200 rounded-md animate-pulse" />
                            </div>
                        </div>
                    ))
                ) : categories.length > 0 ? (
                    categories.map((category) => (
                        <CategoryCard
                            key={category.categoryId}
                            category={category}
                            onClick={handlePressSearch}
                        />
                    ))
                ) : (
                    <p className="text-slate-500 text-center w-full font-medium">
                        No categories found.
                    </p>
                )}
            </ArrowScrollWrapper>
        </section>
    );
});

export default FeaturedCategories;
