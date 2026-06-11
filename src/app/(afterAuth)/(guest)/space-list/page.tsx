import type { Metadata } from 'next';
import SpaceListClient from './spaceList-client';
import { headers } from 'next/headers';
import { CATEGORY_BANNERS } from '@/constants/categoryBanners';
import { ServerGet } from '@/services/serverApi';
import { endpoints } from '@/services/endPoints';

export const dynamic = 'force-dynamic';

const toSlug = (text: string) =>
    text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

type Props = {
    searchParams: Promise<{
        space?: string;
        activity?: string;
    }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const headersList = await headers();
    const host = headersList.get('host');

    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    const formatTitle = (str?: string) => {
        if (!str) return '';
        return str
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Next.js 15: searchParams is now a Promise
    const params = await searchParams;
    const space = params.space;
    const activity = params.activity;

    const formattedSpace = formatTitle(space);
    const formattedActivity = formatTitle(activity);

    let title = 'Browse Spaces | Spare Space';
    let description = 'Explore unique spaces for events, meetings, and activities.';

    if (space && activity) {
        title = `${formattedSpace} for ${formattedActivity} | Spare Space`;
        description = `Explore ${formattedSpace} for ${formattedActivity}. Book unique spaces on Spare Space.`;
    } else if (space) {
        title = `${formattedSpace} | Spare Space`;
        description = `Explore ${formattedSpace} for various activities. Book your perfect space.`;
    } else if (activity) {
        title = `Spaces for ${formattedActivity} | Spare Space`;
        description = `Find spaces perfect for ${formattedActivity}. Discover and book instantly.`;
    }

    let ogImageUrl = `${baseUrl}/og-image.png`;

    if (space) {
        try {
            const categoriesRes: any = await ServerGet(endpoints.GET_PUBLIC_CATEGORIES);
            const categories: any[] = categoriesRes?.data?.categories ?? [];
            const firstSlug = space.split(',')[0];

            const matched = categories.find(
                (c: any) => c.CategoryMaster?.name && toSlug(c.CategoryMaster.name) === firstSlug,
            );

            if (matched?.CategoryMaster?.imgUrl) {
                ogImageUrl = matched.CategoryMaster.imgUrl;
            }
        } catch (_) {}
    }

    if (ogImageUrl === `${baseUrl}/og-image.png`) {
        const categoryKey = activity || space;
        if (categoryKey && CATEGORY_BANNERS[categoryKey]) {
            const item = CATEGORY_BANNERS[categoryKey];
            let localPath = '';
            if (item.ogImage) {
                localPath = item.ogImage;
            } else if (item.parentCategory && CATEGORY_BANNERS[item.parentCategory]?.ogImage) {
                localPath = CATEGORY_BANNERS[item.parentCategory].ogImage;
            }
            if (localPath) ogImageUrl = `${baseUrl}${localPath}`;
        }
    }

    return {
        title,
        description,

        openGraph: {
            title,
            description,
            url: baseUrl,
            siteName: 'Spare Space',
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: 'Spare Space',
                },
            ],
            type: 'website',
        },

        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImageUrl],
        },
    };
}

async function getMetadata() {
    try {
        const response: any = await ServerGet(endpoints.GET_PUBLIC_CATEGORIES);
        return response?.data ?? null;
    } catch (error) {
        return null;
    }
}

async function getSpaceList(searchParams: any, metadata: any) {
    try {
        const params = new URLSearchParams();
        params.append('page', '1');
        params.append('limit', '10');

        if (searchParams.space && metadata?.categories) {
            const spaceSlugs = searchParams.space.split(',');
            const matchedCategoryIds = metadata.categories
                .filter(
                    (c: any) =>
                        c.CategoryMaster?.name &&
                        spaceSlugs.includes(toSlug(c.CategoryMaster.name)),
                )
                .map((c: any) => c.categoryId);

            if (matchedCategoryIds.length > 0) {
                params.append('categoryIds', matchedCategoryIds.join(','));
            }
        }

        if (searchParams.activity && metadata?.activities) {
            const activitySlugs = searchParams.activity.split(',');
            const matchedActivityIds = metadata.activities
                .filter((a: any) => a.activity && activitySlugs.includes(toSlug(a.activity)))
                .flatMap((a: any) => a.ids || [a.id]);

            if (matchedActivityIds.length > 0) {
                params.append('activityIds', matchedActivityIds.join(','));
            }
        }

        if (searchParams.minPrice) params.append('minPrice', searchParams.minPrice);
        if (searchParams.maxPrice) params.append('maxPrice', searchParams.maxPrice);
        if (searchParams.attendees) params.append('attendees', searchParams.attendees);
        if (searchParams.instant === 'true') params.append('instantBooking', 'true');

        const response: any = await ServerGet(`${endpoints.GUEST_SPACE_LIST}?${params.toString()}`);
        return response?.data ?? response ?? null;
    } catch (error) {
        console.error('Error fetching space list on server:', error);
        return null;
    }
}

export default async function ListingPage({ searchParams }: Props) {
    const params = await searchParams;
    const metadata = await getMetadata();
    const initialSpaceData = await getSpaceList(params, metadata);

    return <SpaceListClient initialSpaceData={initialSpaceData} />;
}
