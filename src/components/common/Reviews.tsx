'use client';

import { Card } from '@/components/ui/card';
import { Star, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useUpdateReviewFlag } from '@/services';
import { toast } from 'react-toastify';
import { usePathname } from 'next/navigation';
import { useGuestMode } from '@/hooks';

interface Review {
    id: number;
    bookingId?: number;
    flagged: boolean;
    rating: number;
    comments: string;
    Space?: {
        id: number | string;
        title: string;
    };
    User?: {
        first_name: string;
        last_name?: string;
        avatar?: string;
    };
    host?: {
        first_name: string;
        last_name?: string;
        avatar?: string;
    };
}

interface Pagination {
    currentPage: number;
    totalPages: number;
    totalReviews: number;
    limit: number;
}

interface ReviewsProps {
    reviews: Review[];
    reviewCount?: number;
    avgRating?: number;
    spaceId?: number;
    pagination?: Pagination;
    onReviewUpdate?: () => void;
    isGuestMode?: boolean;
    onViewMore?: () => void;
    isLoadingMore?: boolean;
    maxHeight?: string;
}

export default function Reviews({
    reviews,
    reviewCount,
    avgRating,
    spaceId,
    pagination,
    onReviewUpdate,
    isGuestMode: parentGuestMode = false,
    onViewMore,
    isLoadingMore = false,
    maxHeight = '400px',
}: ReviewsProps) {
    const { isGuestMode: urlGuestMode } = useGuestMode();
    const isGuestMode = parentGuestMode || urlGuestMode;

    const updateReviewFlagMutation = useUpdateReviewFlag({
        onSuccess: () => {
            toast.success('Review flag status updated successfully');
            onReviewUpdate?.();
        },
        onError: (err) => {
            toast.error('Failed to update review flag status');
            console.error('Error updating review flag:', err);
        },
    });

    const handleFlagToggle = (bookingId: string, flagged: boolean) => {
        updateReviewFlagMutation.mutate({ bookingId, flagged: !flagged });
    };

    const renderStars = (rating: number) =>
        Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
            />
        ));

    const getDisplayName = (item: Review) => {
        if (item?.User?.first_name) {
            const firstName = item.User.first_name || '';
            const lastInitial = item.User.last_name ? item.User.last_name[0] + '.' : '';
            return `${firstName} ${lastInitial}`.trim();
        }

        return item?.host?.first_name || 'User';
    };

    const getAvatarSrc = (item: Review) => item.User?.avatar || item.host?.avatar || '';

    const showViewMore =
        onViewMore &&
        pagination &&
        reviews.length < pagination.totalReviews &&
        pagination.currentPage < pagination.totalPages;

    return (
        <Card className="p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
                <h3 className="text-xl font-semibold">Reviews ({reviewCount ?? reviews.length})</h3>
                {avgRating !== undefined && avgRating > 0 && (
                    <div className="flex items-center gap-1 text-base font-medium">
                        <Star className="w-4 h-4 fill-current text-black" />
                        <span>{avgRating.toFixed(1)}</span>
                    </div>
                )}
            </div>

            {reviews.length === 0 ? (
                <div className="text-muted-foreground">No reviews yet.</div>
            ) : (
                <div className="flex flex-col gap-4 overflow-y-auto pr-2" style={{ maxHeight }}>
                    {reviews.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-start gap-4 border-b pb-4 last:border-b-0 last:pb-0"
                        >
                            <Avatar className="w-10 h-10 rounded-full">
                                <AvatarImage src={getAvatarSrc(item)} alt={getDisplayName(item)} />
                                <AvatarFallback className="text-sm bg-gray-200 text-gray-600">
                                    {getDisplayName(item)
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1">
                                <div className="flex flex-wrap gap-2 items-center">
                                    <span className="font-semibold">{getDisplayName(item)}</span>
                                    {item.Space && item.Space.title && (
                                        <span className="text-gray-500 text-sm">
                                            reviewed for {item.Space.title}
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-1 mt-1">{renderStars(item.rating)}</div>
                                <p className="text-muted-foreground text-sm mt-1">
                                    {item.comments}
                                </p>
                            </div>

                            {!isGuestMode && item.bookingId && (
                                <div className="flex flex-col items-end gap-2">
                                    <button
                                        className={`rounded-full px-4 py-2 text-white font-medium transition-colors ${item.flagged
                                            ? 'bg-red-500 hover:bg-red-500'
                                            : 'bg-gray-500 hover:bg-gray-500'
                                            }`}
                                        onClick={() =>
                                            handleFlagToggle(
                                                item.bookingId!.toString(),
                                                item.flagged,
                                            )
                                        }
                                        disabled={updateReviewFlagMutation.isPending}
                                    >
                                        <Flag className="inline w-4 h-4 mr-1" />
                                        Flag
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {showViewMore && (
                <Button
                    variant="outline"
                    className="rounded-full mt-4"
                    onClick={onViewMore}
                    disabled={isLoadingMore}
                >
                    {isLoadingMore ? 'Loading...' : 'View More'}
                </Button>
            )}
        </Card>
    );
}
