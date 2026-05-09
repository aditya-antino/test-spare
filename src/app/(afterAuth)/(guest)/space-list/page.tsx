import type { Metadata } from "next";
import SpaceListClient from "./spaceList-client";
import { headers } from "next/headers";
import { CATEGORY_BANNERS } from "@/constants/categoryBanners";
import { ServerGet } from '@/services/serverApi';
import { endpoints } from '@/services/endPoints';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: {
    space?: string;
    activity?: string;
  };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {

  const headersList = await headers();
  const host = headersList.get("host");

  const protocol = host?.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const formatTitle = (str?: string) => {
    if (!str) return "";
    return str.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  const space = searchParams.space;
  const activity = searchParams.activity;

  const formattedSpace = formatTitle(space);
  const formattedActivity = formatTitle(activity);

  let title = "Browse Spaces | Spare Space";
  let description = "Explore unique spaces for events, meetings, and activities.";

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

  const categoryKey = activity || space;
  let ogImagePath = "/og-image.png"; // Fallback image

  if (categoryKey && CATEGORY_BANNERS[categoryKey]) {
    const item = CATEGORY_BANNERS[categoryKey];

    if (item.ogImage) {
      ogImagePath = item.ogImage;
    } else if (item.parentCategory && CATEGORY_BANNERS[item.parentCategory]?.ogImage) {
      ogImagePath = CATEGORY_BANNERS[item.parentCategory].ogImage;
    }
  }

  const ogImageUrl = `${baseUrl}${ogImagePath}`;

  return {
    title,
    description,

    openGraph: {
      title,
      description,
      url: baseUrl,
      siteName: "Spare Space",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "Spare Space",
        },
      ],
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

async function getSpaceList() {
    try {
        const response: any = await ServerGet(endpoints.GUEST_SPACE_LIST + '?page=1&limit=10');
        return response?.data ?? response ?? null;
    } catch (error) {
        console.error('Error fetching space list on server:', error);
        return null;
    }
}

export default async function ListingPage() {
  const initialSpaceData = await getSpaceList();
  
  return <SpaceListClient initialSpaceData={initialSpaceData} />;
}