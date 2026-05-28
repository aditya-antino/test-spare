'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import fallbackImage from '@/assets/Login.png';
import { Button } from '@/components/ui/button';

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
                    // group-hover:text-primary-p1
                        className="text-lg sm:text-xl font-bold mb-3 text-gray-900  transition-colors duration-300 line-clamp-2 leading-tight group-hover/title:scale-[1.03]"
                        dangerouslySetInnerHTML={{ __html: post?.title ?? '' }}
                    />
                </Link>

                <div
                    className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4 line-clamp-3 flex-1"
                    dangerouslySetInnerHTML={{ __html: post?.description || post?.excerpt || '' }}
                />

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50/0">
                    <Link
                        href={`/blogs/${post?.slug || post?.id}`}
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
                                <span className="truncate max-w-[100px] sm:max-w-[120px] text-gray-700">{post.author_name}</span>
                            )}
                            {formattedDate && <span>{formattedDate}</span>}
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}

export default function BlogListClient({ initialPosts }: { initialPosts: Post[] }) {
    const [visibleCount, setVisibleCount] = useState(6);

    const handleShowMore = () => {
        setVisibleCount((prev) => Math.min(prev + 6, initialPosts.length));
    };

    const visiblePosts = Array.isArray(initialPosts) ? initialPosts.slice(0, visibleCount) : [];

    if (initialPosts.length === 0) {
        return <p className="text-center text-gray-500 py-16">No posts available yet.</p>;
    }

    return (
        <>
            <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {visiblePosts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                ))}
            </div>

            {visibleCount < initialPosts.length && (
                <div className="flex justify-center mt-12 sm:mt-16">
                    <Button
                        onClick={handleShowMore}
                        // className="group relative px-8 py-3 sm:px-10 sm:py-4 bg-gradient-to-br from-[#FEFAEE] via-white to-[#FDF8E4] border border-[#F6CD28]/30 text-gray-900 font-bold tracking-wide rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden"
                    >
                        Show More Blogs
                    </Button>
                </div>
            )}

            {initialPosts.length > 6 && (
                <div className="text-center mt-6 text-sm text-gray-500">
                    Showing {visibleCount} of {initialPosts.length} blogs
                </div>
            )}
        </>
    );
}
