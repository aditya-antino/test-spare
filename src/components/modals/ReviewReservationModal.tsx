'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, Flag, MapPin } from 'lucide-react';
import { useGetReview, useUpdateReviewFlag } from '@/services';
import { Button } from '@/components/ui/button';
import Typography from '../ui/typoGraphy';
import { Modal } from '../ui/modal';
import { toast } from 'react-toastify';

interface ReviewRatingModalProps {
    open: boolean;
    onClose: () => void;
    reservationId?: number;
}

export const ReviewReservationModal: React.FC<ReviewRatingModalProps> = ({
    open,
    onClose,
    reservationId,
}) => {
    const [rating, setRating] = useState(0);
    const { data: reviewDataResponse, isLoading, error, refetch } = useGetReview(reservationId);
    const reviewData = reviewDataResponse?.data;


    const updateReviewFlagMutation = useUpdateReviewFlag({
        onSuccess: (_, variables) => {
            toast.success(
                variables.flagged ? 'Review flagged successfully' : 'Review unflagged successfully',
            );
            refetch();
        },
        onError: (error) => {
            toast.error(error?.message || 'Failed to update review flag');
        },
    });

    useEffect(() => {
        setRating(reviewData?.rating || 0);
    }, [reviewData]);

    const handleFlagReview = () => {
        if (!reviewData?.id) return;

        updateReviewFlagMutation.mutate({
            bookingId: reviewData.id.toString(),
            flagged: !reviewData?.flagged,
        });
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="sm"
            showClose={false}
            className="sm:p-4 sm:w-80 min-w-[40vw] max-h-[80vh] overflow-y-auto"
        >
            {isLoading ? (
                <Typography size="sm" color="text-gray-500" className="text-center py-6">
                    Loading review details...
                </Typography>
            ) : error ? (
                <Typography size="sm" color="text-red-500" className="text-center py-6">
                    {(error as any)?.data?.message ||
                        error?.message ||
                        'Failed to load review details'}
                </Typography>
            ) : !reviewData ? (
                <Typography size="sm" color="text-gray-500" className="text-center py-6">
                    Review not found
                </Typography>
            ) : (
                <div className="space-y-4">
                    {/* Title */}
                    <Typography weight="semibold" size="base" color="text-gray-900">
                        Submitted Reviews and Ratings
                    </Typography>

                    {/* Image + Space details */}
                    <div className="border rounded-2xl overflow-hidden">
                        {reviewData?.Space?.SpaceImages?.[0]?.image_url ? (
                            <div className="w-full h-48 relative">
                                <Image
                                    src={reviewData.Space.SpaceImages[0].image_url}
                                    alt={reviewData?.Space?.title || 'Space Image'}
                                    fill
                                    className="object-cover rounded-b-lg"
                                />
                            </div>
                        ) : (
                            <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg">
                                <Typography size="sm" color="text-gray-500">
                                    No image available
                                </Typography>
                            </div>
                        )}

                        <div className="flex flex-col gap-2.5 w-full p-4">
                            <Typography size="sm" color="text-gray-800" weight="medium">
                                {reviewData?.Space?.title || 'Untitled Space'}
                            </Typography>
                            <div className="flex gap-2 items-center">
                                <MapPin className="text-gray-500 w-4 h-4" />
                                <Typography size="xs" color="text-gray-500">
                                    {reviewData?.Space?.address || 'No address available'}
                                </Typography>
                            </div>
                        </div>
                    </div>

                    {/* Review Text */}
                    <div className="space-y-2">
                        <Typography weight="semibold" color="text-gray-700" size="base">
                            Review
                        </Typography>
                        <Typography size="sm" weight="medium" color="text-zinc-800">
                            {reviewData?.comments || '-'}
                        </Typography>
                    </div>

                    {/* Rating */}
                    <div className="flex w-full space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`h-6 w-6 ${
                                    rating >= star
                                        ? 'text-[#F6CD28] fill-[#F6CD28]'
                                        : 'text-gray-300'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col font-semibold">
                        <button
                            className="w-full bg-red-500 px-4 py-2 rounded-full text-white flex items-center justify-center disabled:opacity-50"
                            onClick={handleFlagReview}
                            disabled={updateReviewFlagMutation.isPending}
                        >
                            <Flag className="w-4 h-4 mr-2" />
                            {updateReviewFlagMutation.isPending
                                ? 'Processing...'
                                : reviewData?.flagged
                                  ? 'Unflag Review'
                                  : 'Flag Review'}
                        </button>
                        <Button variant="outline" className="w-full mt-3" onClick={onClose}>
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};
