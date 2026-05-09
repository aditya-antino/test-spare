import React from 'react';
import { guestArticles, hostArticles } from '../../../constants/articlesContent';
import { Header } from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { ServerGet } from '@/services/serverApi';
import { endpoints } from '@/services/endPoints';
import { Metadata } from 'next';
import ArticleCategoryClient from './ArticleCategoryClient';

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

export async function generateMetadata({
    params,
}: {
    params: Promise<{ section: string }>;
}): Promise<Metadata> {
    const { section } = await params;
    const sectionKey = section as HelpSection;
    const sectionInfo = HELP_SECTIONS[sectionKey];

    return {
        title: `${sectionInfo?.title || 'Help'} | Spare Space Help Center`,
        description: sectionInfo?.description || 'Find help and articles for Spare Space.',
    };
}

// Since we need search functionality (searchTerm),
// we'll keep the interactive parts in a client component.
// But we'll fetch the initial articles on the server.

async function getInitialArticles(section: string) {
    try {
        const articleType = section === 'guests' ? 'guest' : 'host';
        const response: any = await ServerGet(endpoints.GET_ARTICLES(articleType));

        const data = response?.category || [];
        const flatArticles: HelpArticleType[] = [];

        // Reverse the categories so the first created is at the top
        const reversedData = [...data].reverse();

        reversedData.forEach((cat: any) => {
            const categoryName = cat.name;
            if (cat.articles && Array.isArray(cat.articles)) {
                // Reverse the articles inside the category as well
                const reversedArticles = [...cat.articles].reverse();

                reversedArticles.forEach((art: any) => {
                    flatArticles.push({
                        id: String(art.id),
                        slug: art.slug,
                        category: categoryName,
                        title: art.title,
                        content: art.description || '',
                    });
                });
            }
        });
        return flatArticles;
    } catch (error) {
        console.error(`Error fetching ${section} articles:`, error);
        return [];
    }
}

export default async function CategoryPage({ params }: { params: Promise<{ section: string }> }) {
    const { section } = await params;
    const sectionKey = section as HelpSection;
    const initialArticles = await getInitialArticles(sectionKey);

    const sanitizedSections = Object.fromEntries(
        Object.entries(HELP_SECTIONS).map(([key, value]) => [
            key,
            {
                title: value.title,
                icon: value.icon,
                description: value.description,
            },
        ]),
    );

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-1 pb-20">
                <ArticleCategoryClient
                    section={sectionKey}
                    initialArticles={initialArticles}
                    sections={sanitizedSections}
                />
            </main>

            <Footer />
        </div>
    );
}
