'use client';
import { Card, CardContent } from '@/components/ui/card';
import Typography from '@/components/ui/typoGraphy';
import { Heart, MapPin, Star, Users, CircleIcon } from 'lucide-react';
import ImageCarousel from '../imageCarousel/imageCarousel';
import { Space, useGetGuestBookingDetails } from '@/services';
import { usePathname, useRouter } from 'next/navigation';
import { useGuestMode } from '@/hooks';
import { PATHS } from '@/constants/path';
import DraftBookingCard from '../draftBookingCard/draftBookingCard';
import { useState } from 'react';
import { handleApiError } from '@/hooks/handleApiError';
import { toggleWishlistItem } from '@/services/guest/wishlist.services';
import { toast } from 'react-toastify';
import Instant from '@/components/icons/Instant';
import { cn, formatCurrency } from '@/lib/utils';
import { trackEvent, PIXEL_IDS } from '@/utils/metaPixel';
import { capitalize } from '@/utils';
import Link from 'next/link';

interface BookingCardProps {
    space: Space;
    showWishlist?: boolean;
    onClick?: () => void;
    className?: string;
    isNotHomePage?: boolean;
    isInGuestMode?: boolean;
    onWishlistToggle?: () => void;
    // bookDetail: any;
}

const getStatusClasses = (status?: string) => {
    const s = (status || '').toLowerCase().trim();
    if (s.includes('pending')) return 'text-yellow-500 fill-yellow-500';
    if (s.includes('offline')) return 'text-red-500 fill-red-500';
    if (
        s.includes('live') ||
        s.includes('online') ||
        s.includes('active') ||
        s.includes('available')
    )
        return 'text-green-500 fill-green-500';
    return 'text-gray-400 fill-gray-400';
};

const BookingCard: React.FC<BookingCardProps> = ({
    space,
    showWishlist = true,
    onClick,
    className,
    isInGuestMode = false,
    isNotHomePage = true,
    onWishlistToggle,
    // bookDetail,
}) => {
    const router = useRouter();
    const { isGuestMode: urlGuestMode } = useGuestMode();
    const isDraft = space?.computed_status?.toLowerCase() === 'draft';
    const isGuestMode = urlGuestMode || isInGuestMode;

    const [isInWishList, setIsInWishList] = useState(space?.isWishlist ?? false);
    const [wishlistLoading, setWishListLoading] = useState(false);

    // console.log("Space", space) - here the discountPercent includes isRefundable extra 10 per discount already

    // discount percent on a space
    const discountPercent = space?.discountAmount ?? 0;
    // original price of a space
    const originalPrice = parseFloat(space?.price || space?.SpaceListing?.price_per_hour || '0');
    // effective discount percent on a space
    const effectiveDiscount = space?.isRefundable ? discountPercent + 10 : discountPercent;

    const hasDiscount = effectiveDiscount > 0;

    // discounted price of a space
    const discountedPrice = hasDiscount
        ? originalPrice - (originalPrice * effectiveDiscount) / 100
        : originalPrice;

    const finalOriginalPrice = originalPrice;
    const finalDiscountedPrice = discountedPrice;

    // Fetch dynamic pricing settings from API config
    const { data: bookingDetails } = useGetGuestBookingDetails();
    const platformFeePercentage = parseFloat(bookingDetails?.data?.guest_platform_fee || '5') / 100;
    const cgstPercentage = parseFloat(bookingDetails?.data?.cgst || '9') / 100;
    const sgstPercentage = parseFloat(bookingDetails?.data?.sgst || '9') / 100;
    const taxMultiplier = (1 + platformFeePercentage) * (1 + cgstPercentage + sgstPercentage);

    // adding platform fee and taxes in final original price
    const grossOriginalPrice = finalOriginalPrice * taxMultiplier;
    // adding platform fee and taxes in final discounted price
    const grossDiscountedPrice = finalDiscountedPrice * taxMultiplier;

    const navigateToNextStep = () => {
        const currentStep = space?.current_step ?? 1;
        const nextStep = Math.min(currentStep + 1, 9);
        router.push(
            `${PATHS.SPACE_LIST_PATH}?spaceId=${space.id}&step=${nextStep}&isEdit=false&isDraft=true`,
        );
    };

    const handleToggleWishlist = async (e: React.MouseEvent, id: number | string) => {
        e.stopPropagation();
        e.preventDefault();
        try {
            setWishListLoading(true);
            const response = await toggleWishlistItem(id);
            if (response.status === 201) {
                setIsInWishList((prev) => !prev);
                onWishlistToggle?.();
                toast.success('wishlist updated successfully!');
            }
        } catch (err) {
            handleApiError(err);
        } finally {
            setWishListLoading(false);
        }
    };

    if (isDraft) {
        return (
            <DraftBookingCard
                space={space}
                onResume={navigateToNextStep}
                showWishlist={showWishlist}
                className={className}
                onWishlistToggle={onWishlistToggle}
            />
        );
    }

    const handleCardPress = () => {
        trackEvent(PIXEL_IDS.SPACE_LISTING, 'PageView');

        if (onClick) {
            onClick();
            return;
        }

        if (!space?.slug) {
            toast.error('Something went wrong! Space details are missing.');
            return;
        }

        router.push(`/space-details/${space.slug}`, { scroll: true });
    };

    const cardLink = space?.slug ? `/space-details/${space.slug}` : '#';

    return (
        <Card
            className={cn(
                'shadow-sm hover:bg-gray-50 relative p-0 w-full flex-1 gap-3 rounded-3xl border-none bg-white inline-flex flex-col justify-start items-start overflow-hidden transition-transform duration-300 ease-in-out hover:scale-102 my-2 sm:max-w-xs min-w-xs group',
                className,
            )}
        >
            <Link
                href={cardLink}
                className="absolute inset-0 z-10"
                onClick={(e) => {
                    trackEvent(PIXEL_IDS.SPACE_LISTING, 'PageView');
                    if (onClick) {
                        e.preventDefault();
                        onClick();
                    }
                }}
                prefetch
            >
                <span className="sr-only">View {space?.title ?? 'Space'} Details</span>
            </Link>

            {hasDiscount && (
                <div
                    className={`absolute  ${isNotHomePage && showWishlist ? 'left-2' : 'right-2'} top-3 z-30 bg-red-500 text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1`}
                >
                    <span className="text-sm font-bold">{effectiveDiscount}% OFF</span>
                </div>
            )}

            {isNotHomePage && showWishlist && (
                <div
                    onClick={(e) => {
                        if (!wishlistLoading) {
                            handleToggleWishlist(e, space.id);
                        }
                    }}
                    className="cursor-pointer w-8 h-8 bg-black/30 hover:bg-black/40 flex justify-center items-center rounded-full absolute right-2 top-2 z-30"
                >
                    <Heart
                        className={`w-5 ${
                            isInWishList ? 'text-rose-600 fill-current' : 'text-white'
                        }`}
                    />
                </div>
            )}

            {/* Image */}
            <div
                className="w-full select-none h-48 relative z-20 bg-gray-100 cursor-pointer"
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleCardPress();
                }}
            >
                {Array.isArray(space.SpaceImages) && space?.SpaceImages?.length > 0 ? (
                    <ImageCarousel images={space?.SpaceImages} isBookingCard={true} />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                        No Image
                    </div>
                )}
            </div>

            {isNotHomePage && (
                <div className="w-full flex justify-end items-center gap-1 px-4 mt-2">
                    {space?.computed_status && (
                        <CircleIcon
                            className={`w-4 h-4 ${getStatusClasses(space?.computed_status)}`}
                        />
                    )}

                    <span className="text-sm font-normal text-gray-500">
                        {capitalize(space?.computed_status)}
                    </span>
                </div>
            )}
            <div className="w-full flex justify-end items-center gap-2 px-4 mt-2">
                {isGuestMode && space?.instantBooking && <Instant />}
            </div>

            <CardContent className="px-4 flex flex-col gap-2.5">
                <Typography size="sm" color="text-gray-500">
                    {(space?.SpaceType?.type as any) ||
                        space?.SpaceType ||
                        space?.CategoryMaster?.name ||
                        space?.category_name ||
                        '-'}
                </Typography>

                <Typography
                    size="lg"
                    weight="medium"
                    color="text-gray-800"
                    onClick={handleCardPress}
                    leading="leading-snug"
                    className="hover:underline cursor-pointer line-clamp-2 min-h-[48px] w-full p-1"
                >
                    {space?.title ?? 'Untitled Space'}
                </Typography>

                <div className="flex flex-col gap-1.5 w-full overflow-hidden ">
                    <div className="flex items-center gap-3 w-full min-w-0 overflow-hidden">
                        <MapPin className="text-gray-400 w-5 flex-shrink-0" />
                        <Typography
                            size="sm"
                            color="text-gray-500"
                            className="truncate flex-1 min-w-0 max-w-[220px]"
                        >
                            {[space?.area, space?.locality, space?.city].filter(Boolean).join(', ')}
                        </Typography>
                    </div>

                    <div className="flex items-center gap-3">
                        <Users className="text-gray-400 w-5" />
                        <Typography size="sm" color="text-gray-500">
                            {space?.seats ? `${space.seats} Seats` : '0 seats'}
                        </Typography>
                    </div>
                </div>
            </CardContent>

            <div className="flex w-full justify-between items-center px-4 pb-4 mt-auto">
                <div className="flex flex-col items-start">
                    {hasDiscount ? (
                        <div className="flex flex-row items-baseline gap-2">
                            <Typography size="lg" weight="semibold" className="text-gray-900">
                                ₹{formatCurrency(grossDiscountedPrice)}
                                <span className="text-gray-500 text-sm font-normal"> /hr</span>
                            </Typography>
                            <Typography size="xs" className="text-red-400 line-through">
                                ₹{formatCurrency(grossOriginalPrice)}
                                <span className="text-red-400 text-sm font-normal"> /hr</span>
                            </Typography>
                        </div>
                    ) : (
                        <Typography size="lg" weight="semibold" className="text-gray-900">
                            {finalOriginalPrice > 0 ? (
                                <>
                                    ₹{formatCurrency(grossOriginalPrice)}
                                    <span className="text-gray-500 text-sm font-normal"> /hr</span>
                                </>
                            ) : (
                                '—'
                            )}
                        </Typography>
                    )}

                    {/* Incl. of all taxes simple statement */}
                    {finalOriginalPrice > 0 && (
                        <span className="text-[10px] text-gray-500 font-medium mt-0.5 mr-1">
                            incl. of all taxes
                        </span>
                    )}
                </div>
                {space?.rating && Number(space.rating) > 0 ? (
                    <div className="flex items-center gap-1">
                        <Star className="text-[#F6CD28] fill-current w-4 h-4" />
                        <Typography size="sm" color="text-gray-800 font-normal">
                            {space?.rating ? Number(space.rating).toFixed(1) : '-'}
                            {/* {
                               
                                    <span className="text-gray-500 font-normal">
                                        ({space?.reviews || 'hi'})
                                    </span>     
                               
                            } */}
                        </Typography>
                    </div>
                ) : null}
            </div>
        </Card>
    );
};

export default BookingCard;
