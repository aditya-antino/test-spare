import React from 'react';
import { HelpArticle } from '@/components';
import { Header } from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { ServerGet } from '@/services/serverApi';
import { endpoints } from '@/services/endPoints';
import { Metadata } from 'next';
import { headers } from 'next/headers';

interface HelpArticleType {
    id: string;
    slug?: string;
    category: string;
    title: string;
    content: string;
    updated_at?: string;
}

async function getArticleData(slug: string) {
    try {
        const response: any = await ServerGet(endpoints.GET_ARTICLE_DETAILS(slug));
        const details = response?.data || response;

        return {
            id: String(details?.id || ''),
            slug: details?.slug || slug,
            category: details?.category?.name || '',
            title: details?.title || '',
            content: details?.description || details?.content || '',
            updated_at: details?.updated_at,
        };
    } catch (error) {
        console.error('Error fetching article details:', error);
        return null;
    }
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ section: string; slug: string }>;
}): Promise<Metadata> {
    const { section, slug } = await params;
    const article = await getArticleData(slug);

    const headersList = await headers();
    const host = headersList.get("host");

    const protocol = host?.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    if (!article) {
        return {
            title: 'Article Not Found | Spare Space',
        };
    }

    const description = article.content
        ? article.content.substring(0, 160).replace(/<[^>]*>/g, '')
        : 'Read this article to learn more about Spare Space.';

    const ogImage = `${baseUrl}/og-image.png`;

    return {
        metadataBase: new URL(baseUrl),
        title: `${article.title} | Spare Space Help Center`,
        description: description,
        alternates: {
            canonical: `${baseUrl}/articles/${section}/${slug}`,
        },
        openGraph: {
            title: article.title,
            description: description,
            url: `${baseUrl}/articles/${section}/${slug}`,
            siteName: "Spare Space",
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: `${article.title} | Spare Space Help Center`,
                }
            ],
            type: 'article',
            publishedTime: article.updated_at,
        },
        twitter: {
            card: "summary_large_image",
            title: article.title,
            description: description,
            images: [ogImage],
        },
    };
}

export default async function ArticleDetailPage({
    params,
}: {
    params: Promise<{ section: string; slug: string }>;
}) {
    const { section, slug } = await params;
    const article = await getArticleData(slug);

    if (!article) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 flex justify-center items-center py-32">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
                        <p className="text-gray-500">
                            The article you are looking for does not exist.
                        </p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-1 pb-20">
                <HelpArticle article={article} section={section} />
            </main>

            <Footer />
        </div>
    );
}
