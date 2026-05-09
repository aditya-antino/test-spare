// src/components/draftBookingCard/DraftBookingCard.tsx
import { Card, CardContent } from '@/components/ui/card';
import Typography from '@/components/ui/typoGraphy';
import { Heart, Lock, Circle as CircleIcon } from 'lucide-react';
import { Space } from '@/services';
import Image from 'next/image';
import DraftFileIcon from '@/assets/icons/DraftFile.svg';

interface DraftBookingCardProps {
    space: Space;
    onResume: () => void;
    showWishlist?: boolean;
    className?: string;
    onWishlistToggle?: () => void;
}

const DraftBookingCard: React.FC<DraftBookingCardProps> = ({
    space,
    onResume,
    showWishlist,
    className,
    onWishlistToggle,
}) => {
    const hasImages = Array.isArray(space?.SpaceImages) && space.SpaceImages.length > 0;
    const heroSrc = hasImages
        ? space.SpaceImages[0]?.url || space.SpaceImages[0]?.image_url || space.SpaceImages[0]
        : '/emptyPlaceHolder.svg';

    return (
        <Card
            onClick={onResume}
            role="button"
            aria-label="Open draft listing to continue setup"
            className={`cursor-pointer shadow-sm hover:bg-gray-50 relative p-0 min-w-72 flex-1 gap-4 rounded-3xl border-none bg-white inline-flex flex-col justify-start items-start overflow-hidden ${className}`}
        >
            {/* Hero (real image if present) */}
            <div className="w-full select-none h-48 relative">
                <img
                    src={heroSrc}
                    alt="Draft space"
                    className="w-full h-full object-cover blur-sm opacity-60"
                />

                {/* Lock overlay */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center z-20 gap-3">
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow">
                        <Lock className="w-7 h-7 text-amber-500" />
                    </div>
                    <Typography size="sm" weight="semibold" className="text-white/95">
                        Your listing awaits completion
                    </Typography>
                </div>

                {/* Wishlist */}
                {showWishlist && (
                    <div
                        className="cursor-pointer hover:bg-black/40 w-8 h-8 bg-black/30 flex justify-center items-center rounded-full absolute right-2 top-2 z-30"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Heart
                            className={`${space?.isWishlist ? 'text-rose-700' : 'text-white'} fill-current w-5`}
                        />
                    </div>
                )}
            </div>

            <div className="w-full flex justify-end items-center gap-1 px-4">
                <Image
                    src={DraftFileIcon}
                    alt="Draft file icon"
                    width={20}
                    height={20}
                    className="flex-shrink-0"
                />
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onResume();
                    }}
                    className="text-[14px] font-normal text-gray-500 hover:text-gray-600 underline-offset-2"
                >
                    {space?.computed_status ?? 'Draft'}
                </button>
            </div>

            {/* Hint at bottom */}
            <CardContent className="px-4 pb-4 mt-auto w-full">
                <div className="rounded-xl bg-gray-100/70 backdrop-blur-sm px-3 py-2">
                    <Typography size="xs" className="text-gray-600">
                        You’re almost there — finish a few steps to publish.
                    </Typography>
                </div>
            </CardContent>
        </Card>
    );
};

export default DraftBookingCard;
