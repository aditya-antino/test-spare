import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { ServerGet } from '@/services/serverApi';
import { endpoints } from '@/services/endPoints';
import fallbackImage from '@/assets/Login.png';
import { Metadata } from 'next';
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    const headersList = await headers();
    const host = headersList.get("host");

    const protocol = host?.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    const title = "Blogs | Spare Space";
    const description = "Dive into expert insights, stories, and guides about finding and listing spare spaces.";

    return {
        title,
        description,
        
        alternates: {
            canonical: `${baseUrl}/blogs`,
        },

        openGraph: {
            title,
            description,
            url: `${baseUrl}/blogs`, // ✅ important
            siteName: "Spare Space",
            images: [
                {
                    url: `${baseUrl}/og-image.png`, // ✅ MUST exist
                    width: 1200,
                    height: 630,
                    alt: "Spare Space Blogs",
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

};

interface Post {
    id: number;
    slug?: string;
    title: string;
    description?: string;
    excerpt?: string;
    image?: string;
    img_url?: string;
    created_at?: string;
    author_name?: string | null;
}

function BlogCard({ post }: { post: Post }) {
    const featuredImg = post?.img_url || post.image || fallbackImage.src;

    const postDate = post?.created_at;
    const formattedDate = postDate
        ? new Date(postDate).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
        : '';

    return (
        <article className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full border border-gray-100">
            <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden">
                <Image
                    src={featuredImg}
                    alt={post?.title || 'Blog Image'}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110 cursor-pointer"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
            </div>

            <div className="p-5 sm:p-6 flex flex-col flex-1">
                <Link href={`/blogs/${post?.slug || post?.id}`} className="group/title">
                    <h3
                        className="text-lg sm:text-xl font-bold mb-3 text-gray-900 group-hover:text-primary-p2 transition-colors duration-300 line-clamp-2 leading-tight group-hover/title:text-primary-p2"
                        dangerouslySetInnerHTML={{ __html: post?.title ?? '' }}
                    />
                </Link>

                <div
                    className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4 line-clamp-3 flex-1"
                    dangerouslySetInnerHTML={{ __html: post?.description || post?.excerpt || '' }}
                />

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50/0">
                    <Link
                        href={`/blogs/${post?.slug}`}
                        className="inline-flex items-center gap-2 text-primary-p3 font-semibold text-sm sm:text-base hover:text-primary-p2 transition-all duration-300 group/link shrink-0"
                    >
                        <span>Read more</span>
                        <svg
                            className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                        </svg>
                    </Link>

                    {(formattedDate || (post.author_name && post.author_name.trim() !== '')) && (
                        <div className="flex flex-col items-end gap-0.5 text-[11px] sm:text-xs text-gray-500 font-medium text-right overflow-hidden ml-3">
                            {post.author_name && post.author_name.trim() !== '' && (
                                <span className="truncate max-w-[100px] sm:max-w-[120px] text-gray-700">
                                    {post.author_name}
                                </span>
                            )}
                            {formattedDate && <span>{formattedDate}</span>}
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}

// Client part for pagination
import BlogListClient from './BlogListClient';

async function getInitialPosts() {
    try {
        const response: any = await ServerGet(endpoints.GET_BLOGS);
        console.log('HI ', response);
        return response?.data || [];
    } catch (error) {
        console.error('Error fetching blogs:', error);
        return [];
    }
}

export default async function BlogPage() {
    const posts = await getInitialPosts();

    return (
        <div className="min-h-screen">
            <Header />

            <section className="relative overflow-hidden">
                <div className="bg-gradient-to-br from-[#FEFAEE] via-white to-[#FDF8E4] py-16 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-8 tracking-tight text-gray-900">
                            Blogs
                        </h1>
                        <p className="text-lg sm:text-xl md:text-2xl text-gray-800 max-w-2xl mx-auto leading-relaxed font-medium">
                            Dive into expert insights, stories, and guides.
                        </p>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-16 md:py-20">
                <BlogListClient initialPosts={posts} />
            </div>
            <Footer />
        </div>
    );
}
