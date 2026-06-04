import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Calendar, Clock, User, BookOpen } from 'lucide-react';
import { ServerGet } from '@/services/serverApi';
import { endpoints } from '@/services/endPoints';
import { Metadata } from 'next';
import { headers } from 'next/headers';

async function getBlogPost(slug: string) {
    try {
        const response: any = await ServerGet(endpoints.GET_BLOG_DETAILS(slug));
        return response?.data || null;
    } catch (error) {
        console.error('Error fetching blog post:', error);
        return null;
    }
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const post = await getBlogPost(slug);

    const headersList = await headers();
    const host = headersList.get("host");

    const protocol = host?.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    if (!post) {
        return {
            title: 'Blog Not Found | Spare Space',
        };
    }

    const description = post.metaDescription && post.metaDescription.trim() !== ''
        ? post.metaDescription
        : (post.description || '')
            .replace(/<[^>]*>/g, '')
            .substring(0, 160);

    const ogImage = post.img_url || `${baseUrl}/og-image.png`;

    return {
        metadataBase: new URL(baseUrl),

        title: `${post.title} | Spare Space Blog`,
        description: description,

        keywords: ['blog', 'storage', 'spare space', post.title],

        alternates: {
            canonical: `${baseUrl}/blogs/${slug}`,
        },

        robots: {
            index: true,
            follow: true,
        },

        openGraph: {
            title: post.title,
            description: description,
            url: `${baseUrl}/blogs/${slug}`,
            siteName: "Spare Space",
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: `${post.title} | Spare Space Blogs`,
                }
            ],
            type: 'article',
            publishedTime: post.created_at,
            authors: [post.author?.node?.name || "Admin"],
        },

        twitter: {
            card: "summary_large_image",
            title: post.title,
            description,
            images: [ogImage],
        },
    };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getBlogPost(slug);

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-gray-600 bg-[#FEFBEF]/50">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <p className="text-2xl font-semibold mb-4">Blog not found</p>
                    <Link href="/blogs" className="text-[#D89D03] hover:underline">
                        Back to all blogs
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    const featureImg = post.img_url || post.image;
    const readingTime = post?.description
        ? Math.max(1, Math.round(post.description.split(/\s+/).length / 200))
        : 1;

    return (
        <div className="min-h-screen bg-[#FEFBEF]/50 text-[#2D2D2D]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BlogPosting",
                        headline: post.title,
                        description: post.metaDescription && post.metaDescription.trim() !== ''
                            ? post.metaDescription
                            : (post.description || '').replace(/<[^>]*>/g, '').substring(0, 160),
                        image: featureImg ? [featureImg] : [],
                        datePublished: post.created_at,
                        author: {
                            "@type": "Person",
                            name: post.author?.node?.name || post.author || "Admin",
                        },
                    }),
                }}
            />
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-p1/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-p2/5 rounded-full blur-[120px]" />
            </div>
            <Header />

            <section className="w-full border-b border-[#C8C8C8]/30 bg-white/80 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-end">
                    <div className="flex items-center gap-6 text-sm text-[#A8A8A8]">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                                {new Date(post.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </span>
                        </div>
                        <div className="w-1 h-1 bg-[#C8C8C8] rounded-full" />
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{readingTime} min read</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative w-full">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 left-10 w-96 h-96 bg-[#F7CD29]/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#F7CD29]/5 rounded-full blur-3xl" />
                </div>

                <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16 relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        {post.author?.node?.avatar?.url ? (
                            <Image
                                src={post.author.node.avatar.url}
                                alt={post.author.node.name}
                                width={48}
                                height={48}
                                className="rounded-full border-2 border-[#F7CD29]"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-[#F7CD29] flex items-center justify-center">
                                <User className="w-6 h-6 text-[#2D2D2D]" />
                            </div>
                        )}
                        <div>
                            <p className="font-bold text-[#2D2D2D]">
                                {post.author?.node?.name || post.author || 'Admin'}
                            </p>
                            <p className="text-[#A8A8A8] text-sm">Author</p>
                        </div>
                    </div>

                    <h1 className="text-5xl lg:text-6xl font-black text-[#2D2D2D] mb-8 leading-tight">
                        {post.title}
                    </h1>

                    {featureImg && (
                        <div className="w-full mb-12">
                            <Image
                                src={featureImg}
                                alt={post.title}
                                width={1200}
                                height={500}
                                className="w-full h-[400px] lg:h-[500px] object-cover rounded-2xl shadow-lg"
                            />
                        </div>
                    )}
                </div>
            </section>

            <section className="w-full">
                <div className="max-w-3xl mx-auto px-6 pb-20">
                    <article
                        className="prose prose-lg max-w-none
                      prose-headings:font-black prose-headings:text-[#2D2D2D]
                      prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl
                      prose-p:text-[#2D2D2D] prose-p:leading-relaxed prose-p:text-lg
                      prose-a:text-[#D89D03] hover:prose-a:text-[#C98D02]
                      prose-blockquote:border-l-4 prose-blockquote:border-[#F7CD29]
                      prose-strong:font-black prose-img:rounded-xl prose-img:shadow-lg"
                        dangerouslySetInnerHTML={{
                            __html:
                                post.description || post.content || '<p>No content available.</p>',
                        }}
                    />

                    <div className="mt-20 pt-12 border-t border-[#C8C8C8]/30 text-center">
                        <h3 className="text-2xl font-black text-[#2D2D2D] mb-4">
                            Discover more stories
                        </h3>
                        <p className="text-[#A8A8A8] mb-8 max-w-md mx-auto">
                            Explore our complete collection of blogs.
                        </p>
                        {/* bg-gradient-to-r from-primary-p1 to-primary-p2 */}
                        <Link
                            href="/blogs"
                            className="inline-flex items-center gap-3 px-10 py-4 bg-primary-p1 text-black font-black rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
                        >
                            <BookOpen className="w-5 h-5" />
                            View All Blogs
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
