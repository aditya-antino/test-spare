import { Card } from '@/components/ui/card';
import { SpaceDetailsInterface } from '@/services';
import { Star, User, Share, Building, Users, IndianRupee } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { useGuestMode } from '@/hooks';
import { PATHS } from '@/constants/path';
import { useState } from 'react';
import ProudlyNotAi from './ProudlyNotAi';
import MessageHostModal from '../modals/MessageHostModal';
import ShareModal from '../modals/ShareModal';
import Instant from '../icons/Instant';
import BookingForm from '../../app/(afterAuth)/(guest)/space-details/bookingForm';
import { setBookingData, setIsInstantBooking } from '@/store/slice/bookingSlice';
import { useDispatch } from 'react-redux';
import VerificationRequiredModal from '../modals/VerificationRequiredModal';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'react-toastify';

// ---------- Interfaces ----------
interface CategoryMaster {
    id: number;
    name: string;
}

interface City {
    id: number;
    city: string;
    state: string;
}

interface User {
    id: number;
    first_name: string;
    last_name: string;
}

interface SpaceListing {
    id: number;
    price_per_hour: number;
    instant_booking: boolean;
    min_booking_hours?: string | number;
}

export interface SpaceOverviewData {
    id: number;
    title: string;
    description: string | null;
    capacity: number;
    size_sqft: number;
    avg_rating: number | null;
    total_reviews: number;
    reviewCount?: string | number;
    CategoryMaster?: CategoryMaster;
    City?: City;
    User?: User;
    SpaceListing?: SpaceListing;
    sizeSqFt?: number;
}

// ---------- Component ----------
export default function SpaceOverview({
    data,
    bookingDetails,
    bookingSettings,
    isAuthenticated,
    openAuthModal,
}: {
    data: SpaceDetailsInterface;
    bookingDetails: any;
    bookingSettings?: {
        percentage?: string;
        gst?: string;
        cgst?: string;
        sgst?: string;
        processing_fee?: string;
        guest_platform_fee?: string;
    };
    isAuthenticated: boolean;
    openAuthModal?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const router = useRouter();
    const dispatch = useDispatch();
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const { isGuestMode } = useGuestMode();
    const [showVerificationModal, setShowVerificationModal] = useState(false);

    // Pricing logic consistent with bookingForm.tsx
    const basePrice = parseFloat(data?.SpaceListing?.price_per_hour) ?? 1000;
    let calculatedDiscountAmount = parseFloat(
        String((data?.SpaceListing as any)?.discountAmount || '0'),
    );

    if (data?.SpaceListing?.isRefundable === true) {
        calculatedDiscountAmount = calculatedDiscountAmount + 10;
    }

    // Calculate discounted price if discount is available
    const hasDiscount = calculatedDiscountAmount > 0;
    const discountPercentage = calculatedDiscountAmount / 100; // Convert percentage to decimal
    const discountedPrice = hasDiscount ? basePrice * (1 - discountPercentage) : basePrice;

    // GST and Platform Fee Calculation
    const platformFeePercentage = parseFloat(bookingSettings?.guest_platform_fee || '5') / 100;
    const cgstPercentage = parseFloat(bookingSettings?.cgst || '9') / 100;
    const sgstPercentage = parseFloat(bookingSettings?.sgst || '9') / 100;
    const taxMultiplier = (1 + platformFeePercentage) * (1 + cgstPercentage + sgstPercentage);

    const grossBasePrice = basePrice * taxMultiplier;
    const grossDiscountedPrice = discountedPrice * taxMultiplier;

    const handleMessageHost = () => {
        setShowMessageModal(true);
    };

    const handleShare = () => {
        setShowShareModal(true);
    };

    const handleBookClick = () => {
        setShowBookingForm(true);
    };

    const getCurrentUrl = () => {
        if (typeof window !== 'undefined') {
            return window.location.href;
        }
        return '';
    };

    return (
        <Card className="p-2 sm:p-8 flex flex-col gap-6">
            {/* Category + Instant Booking */}

            <div className="flex justify-between items-start">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {/* Proudly Not AI Unified Badge & Info Popover */}
                    <div className=''>
                        <ProudlyNotAi variant="badge" popoverAlign="right" />
                    </div>

                    {/* Category Tag */}
                    <div
                        data-dot="False"
                        data-remove-button="False"
                        data-size="Small"
                        data-theme="Indigo"
                        data-type="Basic"
                        className="px-2 sm:px-2.5 py-0.5 sm:py-2 bg-indigo-100 rounded-[10px] sm:rounded-[12px] inline-flex justify-center items-center"
                    >
                        <div className="text-center justify-start text-indigo-800 text-sm xs:text-xs sm:text-sm font-medium leading-none">
                            {data?.CategoryMaster?.name || ''}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {data?.SpaceListing?.instant_booking && (
                        <div className="flex items-center gap-2 text-muted-foreground hover:pointer-default">
                            <Instant />
                            <span className="xs:hidden sm:block text-xs sm:text-base">
                                Instant Booking
                            </span>
                        </div>
                    )}
                    {isGuestMode && (
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 text-muted-foreground hover:text-gray-700 transition-colors hover:cursor-pointer"
                        >
                            <Share className="w-4 h-4" /> Share
                        </button>
                    )}
                </div>
            </div>

            {/* Title */}
            <h1 className="justify-start text-gray-800 text-4xl font-bold font-['Figtree'] leading-10">
                {data?.title || 'Untitled Space'}
            </h1>

            {/* Description */}
            <div className="max-w-[739px] justify-start text-gray-600 text-base font-medium font-['Figtree'] leading-normal break-words whitespace-pre-wrap">
                {data?.description || 'No description available for this space.'}
            </div>

            {/* Rating + Location */}
            <div className="flex items-center gap-2 text-yellow-500 flex-wrap">
                <Star className="w-5 h-5" 
                fill="currentColor"/>
                <span className="font-semibold">
                    {data?.avg_rating ? Number(data.avg_rating).toFixed(1) : '0.0'}
                </span>
                {data?.reviewCount && Number(data?.reviewCount) > 0 && (
                    <>
                        <span className="text-muted-foreground whitespace-nowrap">
                            ({data?.reviewCount || 0} reviews)
                        </span>
                        <span className="mx-2">·</span>
                    </>
                )}
                <span className="text-muted-foreground whitespace-nowrap ">
                    {[data?.area, data?.locality, data?.City?.city].filter(Boolean).join(', ')}
                </span>
            </div>

            {/* Host */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    {isGuestMode && data?.User?.id ? (
                        <Link
                            href={`${PATHS.GUEST_HOST_PROFILE}/${data.User.id}`}
                            className="flex items-center gap-2 text-muted-foreground p-2 rounded-lg transition-colors cursor-pointer hover:bg-gray-50"
                        >
                            {data?.User?.avatar ? (
                                <img
                                    src={data?.User?.avatar || '/user-avatar.jpg'}
                                    alt="host"
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                    <User className="w-6 h-6 text-gray-500" />
                                </div>
                            )}
                            <div>
                                <div className="text-sm text-gray-500">Hosted by</div>
                                <span className="font-semibold text-black hover:underline">
                                    {data?.User
                                        ? `${data.User.first_name || ''} ${data.User.last_name
                                                ? data.User.last_name[0] + '.'
                                                : ''
                                            }`.trim()
                                        : '-'}
                                </span>
                            </div>
                        </Link>
                    ) : (
                        <div className="flex items-center gap-2 text-muted-foreground p-2 rounded-lg transition-colors cursor-default">
                            {data?.User?.avatar ? (
                                <img
                                    src={data?.User?.avatar || '/user-avatar.jpg'}
                                    alt="host"
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                    <User className="w-6 h-6 text-gray-500" />
                                </div>
                            )}
                            <div>
                                <div className="text-sm text-gray-500">Hosted by</div>
                                <span className="font-semibold text-black">
                                    {data?.User
                                        ? `${data.User.first_name || ''} ${data.User.last_name
                                                ? data.User.last_name[0] + '.'
                                                : ''
                                            }`.trim()
                                        : '-'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Price for Mobile View */}
                    {isGuestMode && (
                        <div className="flex flex-col items-end sm:hidden pr-2">
                            <div className="flex items-center gap-1">
                                <span className="text-gray-800 font-bold text-lg font-poppins text-nowrap">
                                    ₹{formatCurrency(grossDiscountedPrice)}
                                </span>
                                <span className="text-gray-500 text-xs font-poppins">/hr</span>
                            </div>
                            {hasDiscount && (
                                <div className="text-red-500 text-[10px] font-poppins flex items-center gap-1">
                                    <span className="line-through">
                                        ₹{formatCurrency(grossBasePrice)} /hr
                                    </span>
                                </div>
                            )}
                            <span className="text-gray-500 font-medium text-[10px] font-poppins">
                                incl. of all taxes
                            </span>
                        </div>
                    )}

                    <div className="hidden sm:block">
                        {isGuestMode && (
                            <Button
                                variant="outline"
                                onClick={handleMessageHost}
                                className="h-10 px-4 py-2 rounded-full bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                            >
                                Need Help? Chat
                            </Button>
                        )}
                    </div>
                </div>

                {/* Mobile buttons below host info */}
                {isGuestMode && (
                    <div className="flex justify-between gap-2 sm:hidden">
                        <Button
                            onClick={handleMessageHost}
                            className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 whitespace-nowrap text-sm"
                        >
                            Need Help? Chat
                        </Button>
                        <Button
                            onClick={handleBookClick}
                            className="flex-1 px-4 py-2 bg-[#F6CD28] hover:bg-yellow-500 text-black font-semibold rounded-full whitespace-nowrap"
                        >
                            Book Now
                        </Button>
                    </div>
                )}
            </div>
            {/* Divider */}
            <div className="border-t w-full" />

            {/* Extra Info */}
            <div className="sm:flex-row sm:gap-6  flex flex-col gap-4 text-muted-foreground">
                {data?.capacity ? (
                    <span className="flex items-center gap-1 sm:flex-row">
                        <Users /> {data.capacity} attendees
                    </span>
                ) : null}
                {(data?.size_sqft ?? data?.sizeSqft) ? (
                    <span className="flex items-center gap-1 sm:flex-row">
                        <Building /> size- {data.size_sqft ?? data.sizeSqft} sqft
                    </span>
                ) : null}
                {(data?.height_ft ?? data?.heightFt) ? (
                    <span className="flex items-center gap-1 sm:flex-row">
                        {' '}
                        <Building /> height- {data.height_ft ?? data.heightFt} ft
                    </span>
                ) : null}
                {data?.SpaceListing?.price_per_hour ? (
                    <span className="hidden sm:flex items-center gap-1 sm:flex-row">
                        {' '}
                        <IndianRupee /> {formatCurrency(grossDiscountedPrice)}/hour
                    </span>
                ) : null}
            </div>

            {/* Modals */}
            {isGuestMode && (
                <MessageHostModal
                    isOpen={showMessageModal}
                    spaceData={data}
                    bookingDetails={bookingDetails}
                    bookingSettings={bookingSettings}
                    onClose={() => setShowMessageModal(false)}
                />
            )}

            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                url={getCurrentUrl()}
                title="Share this space"
                spaceTitle={data?.title}
                location={[data?.area, data?.locality, data?.City?.city].filter(Boolean).join(', ')}
                image={data?.SpaceImages?.[0]?.image_url}
            />

            {/* Mobile Booking Form Modal */}
            {isGuestMode && showBookingForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 sm:hidden animate-in fade-in duration-300">
                    <div className="bg-white rounded-t-[32px] w-full max-h-[95vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 shadow-2xl">
                        {/* Mobile Handle Bar */}
                        <div className="flex justify-center py-4">
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                        </div>
                        <div className="flex items-center justify-between px-6 pb-4 border-b">
                            <h2 className="text-xl font-bold text-gray-900">Book This Space</h2>
                            <button
                                onClick={() => setShowBookingForm(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                        <div className="p-4">
                            <BookingForm
                                spaceData={data}
                                bookingDetails={bookingSettings}
                                onNavigateToReview={(bookingData) => {
                                    setShowBookingForm(false);
                                    dispatch(setBookingData(bookingData));
                                    dispatch(setIsInstantBooking(false));

                                    if (data?.slug) {
                                        router.push(`/booking-review/${data.slug}`);
                                    } else {
                                        toast.error(
                                            'Space slug is missing, cannot proceed to review',
                                        );
                                    }
                                }}
                                openVerificationModal={() => {
                                    setShowVerificationModal(true);
                                    setShowBookingForm(false);
                                }}
                                onInstantBooking={(bookingData) => {
                                    setShowBookingForm(false);
                                    dispatch(setBookingData(bookingData));
                                    dispatch(setIsInstantBooking(true));
                                    if (data?.slug) {
                                        router.push(`/booking-review/${data.slug}`);
                                    } else {
                                        toast.error(
                                            'Space slug is missing, cannot proceed to review',
                                        );
                                    }
                                }}
                                openAuthModal={(isOpen) => {
                                    if (openAuthModal) {
                                        openAuthModal(isOpen);
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
            {isGuestMode && (
                <VerificationRequiredModal
                    isAuthenticated={isAuthenticated}
                    isOpen={showVerificationModal}
                    onClose={() => setShowVerificationModal(false)}
                    verificationPath={PATHS.GUEST_VERIFICATION}
                />
            )}
        </Card>
    );
}
