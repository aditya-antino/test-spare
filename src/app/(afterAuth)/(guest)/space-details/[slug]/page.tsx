import React from 'react';
import type { Metadata, ResolvingMetadata } from 'next';
import SpaceDetailsClient from './SpaceDetailsClient';
import { Suspense } from 'react';
import { SpaceDetailsSkeleton } from '@/components/skeletons';
import { ServerGet } from '@/services/serverApi';
import { endpoints } from '@/services/endPoints';

export const dynamic = 'force-dynamic';

type Props = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function getSpaceDetails(slug: string) {
    try {
        const endpoint = endpoints.GUEST_SPACE_DETAILS.replace(':slug', slug);
        const response: any = await ServerGet(endpoint);
        console.log("RESPONSEEEE ...... ",response.data)
        return response?.data ?? response ?? null;
    } catch (error) {
        console.error('Error fetching space details on server:', error);
        return null;
    }
}

export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
    const params = await props.params;
    const slug = params.slug;
    const spaceData = await getSpaceDetails(slug);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sparespace.co.in';

    if (!spaceData) {
        return {
            title: 'Space Not Found | Spare Space',
            description: 'The requested space could not be found.',
        };
    }

    const title = `${spaceData.title} | Spare Space`;
    const description =
        spaceData.description?.trim() || 'Book stunning spaces for your next event or meeting.';

    const rawImage = spaceData.SpaceImages?.[0]?.image_url;
    let ogImage = '/og-image.png'; // Fallback image

    if (rawImage && rawImage.trim() !== '') {
        ogImage = rawImage.startsWith('http') ? rawImage : `${baseUrl}${rawImage}`;
    } else {
        ogImage = `${baseUrl}${ogImage}`;
    }

    const ogImageObject = {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: title,
    };

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [ogImageObject],
            type: 'website',
            url: `${baseUrl}/space-details/${slug}`,
            siteName: 'Spare Space',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImage],
        },
    };
}

const Page = async (props: Props) => {
    const params = await props.params;
    const spaceData = await getSpaceDetails(params.slug);

    return (
        <Suspense fallback={<SpaceDetailsSkeleton />}>
            <SpaceDetailsClient initialSpaceData={spaceData} />
        </Suspense>
    );
};

export default Page;
