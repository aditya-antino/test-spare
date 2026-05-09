'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useState, useEffect } from 'react';
import { Star, TriangleAlert, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '../ui/button';
import { handleApiError } from '@/hooks/handleApiError';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { rateGuest, rateSpace } from '@/services/ratings.services';
import { toast } from 'react-toastify';

interface ReviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    space?: {
        title: string;
        address: string;
        image: string;
        user?: {
            id: string | number;
            first_name: string;
            last_name: string;
            avatar: string;
        } | null;
        bookingID: string | number;
    } | null;
    roleId?: number;
    state: 'non-reviewed' | 'reviewed' | 'expired';
    refreshData: () => void;
}

const ReviewHeader = ({
    isUserReview,
    displayImage,
    displayTitle,
    displaySubtitle,
}: {
    isUserReview: boolean;
    displayImage: string;
    displayTitle: string;
    displaySubtitle: string;
}) => {
    return (
        <div
            className={`rounded-xl overflow-hidden ${
                !isUserReview && 'border border-gray-200'
            } mb-4`}
        >
            {isUserReview ? (
                <div className="flex flex-col items-center py-4">
                    <Avatar className="w-20 h-20">
                        <AvatarImage src={displayImage} alt={displayTitle} />
                        <AvatarFallback>
                            {displayTitle
                                ?.split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase() || '-'}
                        </AvatarFallback>
                    </Avatar>

                    <h3 className="text-sm font-medium text-gray-900 mt-2">{displayTitle}</h3>
                    <p className="text-xs text-gray-500">{displaySubtitle}</p>
                </div>
            ) : (
                <>
                    <Image
                        src={displayImage}
                        alt={displayTitle}
                        width={400}
                        height={200}
                        className="w-full h-36 object-cover"
                        onError={(e) => {
                            e.currentTarget.src = '/placeholder-space.jpg';
                        }}
                    />
                    <div className="p-3">
                        <h3 className="text-sm font-medium text-gray-900">{displayTitle}</h3>
                        <p className="text-xs text-gray-500">{displaySubtitle}</p>
                    </div>
                </>
            )}
        </div>
    );
};

const ReviewForm = ({
    review,
    setReview,
    rating,
    setRating,
    hovered,
    setHovered,
    isSubmitting,
    handleSubmit,
    onCancel,
}) => {
    const length = review.length;
    const isTooShort = length > 0 && length < 50;
    const isValidLength = length >= 50 && length <= 700;

    function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setReview(e.target.value);
    }

    const RenderStars = () =>
        [1, 2, 3, 4, 5].map((star) => (
            <Star
                key={star}
                size={26}
                className={`cursor-pointer ${
                    (hovered ?? rating) >= star
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                }`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(null)}
            />
        ));

    return (
        <div>
            <p className="text-sm font-medium text-gray-800 mb-1">Review</p>
            <div className="w-full">
                <textarea
                    value={review}
                    onChange={handleChange}
                    placeholder="Write your review..."
                    className={`w-full border rounded-lg p-2 text-sm mb-2 outline-none focus:ring-2 focus:ring-yellow-400 ${
                        isTooShort ? 'border-red-500' : ''
                    }`}
                    maxLength={700}
                    rows={3}
                />
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>50–700 characters</span>
                    <span>{length}/700</span>
                </div>
                {isTooShort && (
                    <p className="text-xs text-red-500 mb-4">
                        Review must be at least 50 characters long
                    </p>
                )}
            </div>

            <div className="flex items-center justify-around mb-5">
                <RenderStars />
            </div>

            <div className="flex flex-col gap-2">
                <Button
                    variant="default"
                    onClick={handleSubmit}
                    disabled={!review.trim() || rating === 0 || isSubmitting || !isValidLength}
                    className={`bg-yellow-400 text-black rounded-full py-2 font-medium hover:bg-yellow-500 transition ${
                        !review.trim() || rating === 0 || isSubmitting || !isValidLength
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                    }`}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
                <Button
                    variant="outline"
                    onClick={onCancel}
                    className="border border-gray-300 text-gray-700 rounded-full py-2 font-medium hover:bg-gray-100 transition"
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
};

const AlreadyReviewed = ({ displayTitle }: { displayTitle: string }) => (
    <div className="flex flex-col items-center text-center space-y-3 py-6 px-4">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-yellow-50 border border-yellow-200">
            <TriangleAlert size={32} className="text-yellow-500" />
        </div>

        <h3 className="text-lg font-semibold text-gray-900">Review Already Submitted</h3>

        <p className="text-sm text-gray-600 max-w-xs">
            You've already left a review for{' '}
            <span className="font-semibold text-gray-800">{displayTitle}</span>. We appreciate your
            feedback and support!
        </p>
    </div>
);

const ReviewSuccess = ({ displayTitle }: { displayTitle: string }) => (
    <div className="flex flex-col items-center text-center space-y-4 py-6">
        <div className="flex items-center justify-center w-16 h-16 rounded-full border-4 border-yellow-400">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8 text-yellow-400"
            >
                <path d="M20 6L9 17l-5-5" />
            </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Review Submitted Successfully</h3>
        <p className="text-sm text-gray-600 max-w-[250px]">
            Thank you for sharing your feedback! Your review and rating for{' '}
            <span className="font-medium">{displayTitle}</span> have been submitted.
        </p>
    </div>
);

const ReviewExpired = () => (
    <div className="flex flex-col items-center text-center space-y-4 py-6">
        <div className="flex items-center justify-center w-16 h-16 rounded-full border-4 border-gray-300">
            <X size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Review Period Expired</h3>
        <p className="text-sm text-gray-600 max-w-[250px]">
            Sorry, this booking is no longer eligible for submitting reviews.
        </p>
    </div>
);

const ReviewModal = ({
    open,
    onOpenChange,
    space,
    roleId = 2,
    state,
    refreshData = () => {},
}: ReviewModalProps) => {
    const [review, setReview] = useState('');
    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reviewSubmitted, setReviewSubmitted] = useState(false);

    useEffect(() => {
        if (open && state === 'non-reviewed') {
            setReview('');
            setRating(0);
            setHovered(null);
            setIsSubmitting(false);
            setReviewSubmitted(false);
        }
    }, [open, state]);

    const handleSubmit = async () => {
        if (!review.trim() || rating === 0 || !space?.bookingID) {
            toast.error('Please provide a review and rating');
            return;
        }

        if (review.length < 50) {
            toast.error('Review must be at least 50 characters long');
            return;
        }

        if (review.length > 700) {
            toast.error('Review must be less than 700 characters');
            return;
        }

        if (roleId === 2) {
            if (!space?.user?.id) {
                toast.error('Guest information missing!');
                return;
            }
        }

        try {
            setIsSubmitting(true);
            const response =
                roleId === 2
                    ? await rateGuest(space.bookingID, space.user.id, review, rating)
                    : await rateSpace(space.bookingID, review, rating);

            if (response.status === 201 || response.status === 200) {
                toast.success(response.data?.message || 'Review submitted successfully');
                setReviewSubmitted(true);
                setTimeout(() => {
                    onOpenChange(false);
                    refreshData();
                    setReviewSubmitted(false);
                }, 2000);
            } else {
                toast.error('Failed to submit review.');
            }
        } catch (err) {
            handleApiError(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isUserReview = roleId === 2;

    const displayImage = isUserReview
        ? (space?.user?.avatar ?? '/placeholder-avatar.jpg')
        : (space?.image ?? '/placeholder-space.jpg');
    const displayTitle = isUserReview
        ? space?.user
            ? `${space.user.first_name || ''} ${space.user.last_name ? space.user.last_name[0] + '.' : ''}`.trim() ||
              '-'
            : '-'
        : (space?.title ?? '-');

    const displaySubtitle = isUserReview ? 'User' : (space?.address ?? 'Address not available');

    const getModalDescription = () => {
        switch (state) {
            case 'non-reviewed':
                return reviewSubmitted
                    ? 'Review submitted successfully'
                    : 'Add your review and rating';
            case 'reviewed':
                return 'Review already submitted';
            case 'expired':
                return 'Review period has expired';
            default:
                return 'Review modal';
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                <Dialog.Content
                    className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl w-[90%] max-w-sm transition-all"
                    aria-describedby="review-modal-description"
                >
                    <Dialog.Title className="sr-only">
                        {state === 'non-reviewed'
                            ? 'Add Review'
                            : state === 'reviewed'
                              ? 'Review Submitted Successfully'
                              : 'Review Period Expired'}
                    </Dialog.Title>

                    <div id="review-modal-description" className="sr-only">
                        {getModalDescription()}
                    </div>

                    <Dialog.Close className="absolute top-3 right-3 text-gray-500 hover:text-black">
                        <X size={18} />
                    </Dialog.Close>

                    {state === 'non-reviewed' && !reviewSubmitted && (
                        <>
                            <h2 className="text-lg font-semibold mb-3 text-gray-900">
                                Reviews and Ratings
                            </h2>
                            <ReviewHeader
                                isUserReview={isUserReview}
                                displayImage={displayImage}
                                displayTitle={displayTitle}
                                displaySubtitle={displaySubtitle}
                            />
                            <ReviewForm
                                review={review}
                                setReview={setReview}
                                rating={rating}
                                setRating={setRating}
                                hovered={hovered}
                                setHovered={setHovered}
                                isSubmitting={isSubmitting}
                                handleSubmit={handleSubmit}
                                onCancel={() => onOpenChange(false)}
                            />
                        </>
                    )}

                    {state === 'non-reviewed' && reviewSubmitted && (
                        <ReviewSuccess displayTitle={displayTitle} />
                    )}

                    {state === 'reviewed' && <AlreadyReviewed displayTitle={displayTitle} />}

                    {state === 'expired' && <ReviewExpired />}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default ReviewModal;
