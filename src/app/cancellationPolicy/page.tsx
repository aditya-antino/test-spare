'use client';
import Footer from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { useGetStaticPages } from '@/services';

export default function CancellationPolicy() {
    const { data: staticPageDataResponse, isLoading, error } = useGetStaticPages(3);

    const pageContent = staticPageDataResponse?.data?.data?.description || '';

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white text-gray-800">
                <Header />
                <div className="max-w-5xl mx-auto px-4 py-12">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white text-gray-800">
                <Header />
                <div className="max-w-5xl mx-auto px-4 py-12 text-center">
                    <div className="text-red-600">
                        Failed to load cancellation policy. Please try again later.
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-gray-800">
            <Header />

            <div className="max-w-5xl mx-auto px-4 py-12 space-y-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Cancellation Policy</h1>

                <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: pageContent }}
                />

                {!pageContent && (
                    <div className="text-center text-gray-500 py-12">
                        <p>No cancellation policy content available.</p>
                        <p className="text-sm">Please check back later.</p>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
