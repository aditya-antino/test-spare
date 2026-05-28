import React from 'react';
import { guestArticles, hostArticles } from '../../constants/articlesContent';
import { Header } from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import HelpHome from '@/components/articles/HelpHome';
import { Metadata } from 'next';
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
    const headersList = await headers();
    const host = headersList.get("host");

    const protocol = host?.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    const title = "Help Center | Spare Space";
    const description =
        "Find answers to your questions about using Spare Space as a guest or host. Explore our comprehensive guides and articles.";

    return {
        title,
        description,

        openGraph: {
            title,
            description,
            url: `${baseUrl}`,
            siteName: "Spare Space",
            images: [
                {
                    url: `${baseUrl}/og-image.png`,
                    width: 1200,
                    height: 630,
                    alt: "Spare Space Help Center",
                },
            ],
            type: "website",
        },

        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [`${baseUrl}/og-image.png`],
        },
    };
}

interface HelpArticleType {
    id: string;
    slug?: string;
    category: string;
    title: string;
    content: string;
    updated_at?: string;
}

interface HelpCategoryType {
    title: string;
    icon: string;
    description: string;
    articles?: HelpArticleType[];
}

type HelpSection = 'guests' | 'hosts';

const HELP_SECTIONS: Record<HelpSection, HelpCategoryType> = {
    guests: {
        title: 'Guests',
        icon: 'Users',
        description: 'Everything Spare Space guests need to know about booking inspiring spaces.',
        articles: guestArticles,
    },
    hosts: {
        title: 'Hosts',
        icon: 'User',
        description: 'Everything Spare Space hosts need to know about listing and managing spaces.',
        articles: hostArticles,
    },
};

export default function HelpCenter() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-1 pb-20">
                <HelpHome
                    sections={Object.fromEntries(
                        Object.entries(HELP_SECTIONS).map(([key, value]) => [
                            key,
                            {
                                title: value.title,
                                icon: value.icon,
                                description: value.description,
                            },
                        ]),
                    )}
                />
            </main>

            <Footer />
        </div>
    );
}
