import { Metadata } from 'next';
import { headers } from 'next/headers';
import FeaturedCategories from '@/components/homePage/FeaturedCategoreies';
import BrowseByActivities from '@/components/homePage/BrowseByActivities';
import WhyChoseSpaceSpare from '@/components/homePage/WhyChoseSpaceSpare';
import ExploreSpaceInCities from '@/components/homePage/ExporeSpaceInCities';
import HappeningCities from '@/components/homePage/HappeningCities';
import StayUpdatedWithSpareSpace from '@/components/homePage/StayUpdatedWithSpareSpace';
import BecameHostBanner from '@/components/homePage/BecameHostBanner';
import HomeHeroSection from '@/components/homePage/HomeHeroSection';
import StayUpated from '@/components/homePage/StayUpated';
import Footer from '@/components/layout/footer';
import { TestimonialSection } from '@/components';
import LandingPageTracker from '@/components/homePage/LandingPageTracker';
import AfterAuthLayout from './(afterAuth)/layout';

export async function generateMetadata(): Promise<Metadata> {
    const headersList = await headers();
    const host = headersList.get("host");

    const protocol = host?.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;
    console.log("BASE ", baseUrl)

    return {
        title: "Find Unique Spaces for Activities | Spare Space",
        description:
        "Discover unique spaces for events, activities, meetings and more.",

        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },

        openGraph: {
            title: "Find Unique Spaces for Activities | Spare Space",
            description: "Discover unique spaces for events, activities, meetings and more.",
            url: baseUrl,
            siteName: "Spare Space",
            images: [
                {
                    url: `${baseUrl}/guest-home.png`,
                    width: 1200,
                    height: 630,
                    alt: "Spare Space",
                },
            ],
            type: "website",
        },

        twitter: {
            card: "summary_large_image",
            title: "Find Unique Spaces for Activities | Spare Space",
            description: "Discover unique spaces for events, activities, meetings and more.",
            images: [`${baseUrl}/guest-home.png`],
        },
    };
}

export default function Home() {
    return (
        <AfterAuthLayout>
            <div className="flex flex-col w-full gap-8 md:gap-24">
                <LandingPageTracker />
                <HomeHeroSection />
                <BrowseByActivities />
                <FeaturedCategories />
                <ExploreSpaceInCities />
                <WhyChoseSpaceSpare />
                <div>
                    {/* <HappeningCities /> */}
                    <TestimonialSection />
                    <BecameHostBanner />
                </div>
                <StayUpdatedWithSpareSpace />
                <StayUpated />
                <Footer />
            </div>
        </AfterAuthLayout>
    );
}
