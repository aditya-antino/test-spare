'use client';

import React from 'react';
import { Star, MessageCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Footer from '@/components/layout/footer';
import Reviews from '@/components/common/Reviews';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { capitalizeWord } from '@/utils/helperFunctions';
import { useGuestDetails } from './useGuestDetails';

const GuestProfileClient = () => {
    const {
        guestData,
        pagination,
        isLoading,
        error,
        isLoadingMore,
        handleSeeMore,
        fetchGuestProfile,
    } = useGuestDetails();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F6CD28] mx-auto mb-3" />
                    <p className="text-gray-600">Loading guest profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full p-8 bg-white rounded-xl">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Something went wrong!
                        </h3>
                        <p className="text-gray-600 mb-6 text-sm">{error}</p>
                        <Button
                            onClick={() => fetchGuestProfile()}
                            className="w-full bg-[#F6CD28] hover:bg-[#F6CD28]/90 text-black font-semibold"
                        >
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    <div className="lg:col-span-1">
                        <Card className="p-4 sm:p-6 lg:sticky lg:top-8">
                            <div className="text-center mb-6">
                                <Avatar className="w-24 h-24 sm:w-32 sm:h-32 mx-auto">
                                    <AvatarImage
                                        src={guestData.avatar || ''}
                                        alt={guestData.name}
                                    />
                                    <AvatarFallback className="text-xl bg-gray-200 text-gray-600">
                                        {guestData.name
                                            ?.split(' ')
                                            .map((n) => n[0])
                                            .join('')
                                            .toUpperCase() || '-'}
                                    </AvatarFallback>
                                </Avatar>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-4">
                                    {guestData.name}
                                </h1>
                                {guestData.jobTitle && (
                                    <div className="flex items-center justify-center gap-3 text-gray-600">
                                        <span className="text-sm">
                                            {capitalizeWord(guestData.jobTitle)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-center gap-1 mt-2">
                                    <Star className="w-4 h-4 text-[#F6CD28] fill-current" />
                                    <span className="text-sm text-gray-700 font-medium">
                                        {guestData.rating.toFixed(1)} ({guestData.reviewCount}{' '}
                                        reviews)
                                    </span>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">About</h3>
                                <p className="text-gray-600 text-sm">{guestData.bio}</p>
                            </div>
                            <div className="space-y-3 mb-6">
                                {guestData.languages.length > 0 && (
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <MessageCircle className="w-4 h-4" />
                                        <span className="text-sm">
                                            Speaks: {guestData.languages.join(', ')}
                                        </span>
                                    </div>
                                )}

                                {guestData.joinedDate && (
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-sm">
                                            Joined on {guestData.joinedDate}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                            Reviews from <span className="text-[#F6CD28]">Hosts</span>
                        </h2>

                        <Reviews
                            reviews={guestData.reviews}
                            pagination={pagination}
                            onReviewUpdate={() => fetchGuestProfile()}
                            onViewMore={handleSeeMore}
                            isLoadingMore={isLoadingMore}
                            isGuestMode={true}
                        />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default GuestProfileClient;
