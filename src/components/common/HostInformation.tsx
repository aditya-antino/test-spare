import { Card } from '@/components/ui/card';
import { formatDate } from 'date-fns';
import { Calendar, Clock, MessageCircle, Star, UserIcon } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useGuestMode } from '@/hooks';
import { PATHS } from '@/constants/path';

interface Address {
    state?: string;
    country?: string;
}
interface User {
    id?: number;
    avatar?: string;
    first_name: string;
    last_name: string;
    rating?: number;
    reviews_count?: number;
    places_count?: number;
    joined_at?: string; // e.g. "March 2023"
    response_rate?: string; // e.g. "100%"
    response_time?: string; // e.g. "within a few hours"
    bio?: string;
    created_at?: string;
    address?: Address;
    hostResponseTime?: number;
}

interface City {
    city: string;
    state?: string;
}

interface CategoryMaster {
    id: number;
    name: string;
}

interface HostInformationProps {
    user: User | null;
    city?: City;
    categoryMaster?: CategoryMaster;
    hostReviewStats?: {
        total_reviews: number | string;
        avg_rating: string | number;
    };
}

export default function HostInformation({
    user,
    city,
    categoryMaster,
    hostReviewStats,
}: HostInformationProps) {
    const router = useRouter();
    const { isGuestMode } = useGuestMode();
    const hours = user?.hostResponseTime || 0;
    const responseRatePercentage = Math.max(0, 100 - (hours / 24) * 100);

    const getResponseTimeText = (responseRatePercentage) => {
        if (!responseRatePercentage || responseRatePercentage < 0) return 'N/A';

        if (responseRatePercentage >= 80) {
            return 'within a few hours';
        } else if (responseRatePercentage >= 50) {
            return 'Responds within hours';
        } else {
            return 'Responds within days';
        }
    };

    if (!user) return null;

    const handleHostClick = () => {
        if (user?.id) {
            const categoryId = categoryMaster?.id;
            const url = categoryId
                ? `${PATHS.GUEST_HOST_PROFILE}/${user.id}?categoryId=${categoryId}`
                : `${PATHS.GUEST_HOST_PROFILE}/${user.id}`;
            router.push(url);
        }
    };

    return (
        <Card className="p-2 sm:p-8 flex flex-col gap-6">
            <h3 className="text-gray-900 text-2xl font-semibold">Host Information</h3>
            <div className="w-16 border-t" />

            {/* Host Avatar & Info */}
            <div
                className={`flex items-center gap-4 mb-2 transition-colors ${
                    isGuestMode ? 'cursor-pointer p-2 rounded-lg' : 'cursor-default'
                }`}
                onClick={isGuestMode ? handleHostClick : undefined}
            >
                {user.avatar ? (
                    <img
                        src={user.avatar || '/user-avatar.jpg'}
                        alt="host"
                        className="w-12 h-12 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserIcon className="w-8 h-8 text-gray-400" />
                    </div>
                )}
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-semibold ${isGuestMode ? 'hover:underline' : ''}`}>
                            {user
                                ? `${user.first_name || ''} ${
                                      user.last_name ? user.last_name[0] + '.' : ''
                                  }`.trim()
                                : '-'}
                        </span>
                        {hostReviewStats?.avg_rating && Number(hostReviewStats?.avg_rating) > 0 && (
                            <>
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span className="text-yellow-500 font-semibold">
                                    {Number(hostReviewStats?.avg_rating).toFixed(1) ?? '0'}
                                </span>
                            </>
                        )}
                        {hostReviewStats?.total_reviews &&
                            Number(hostReviewStats?.total_reviews) > 0 && (
                                <span className="text-muted-foreground">
                                    ({hostReviewStats?.total_reviews ?? '0'} reviews)
                                </span>
                            )}
                        {/* <span className="mx-2 text-muted-foreground">·</span>
                        <span className="text-muted-foreground">
                            {user.places_count ?? "-"} places
                        </span> */}
                    </div>

                    {user?.address && (
                        <p className="text-muted-foreground text-sm">
                            {[user.address.state, user.address.country]
                                .filter(Boolean)
                                .join(', ') || 'N/A'}
                        </p>
                    )}
                </div>
            </div>

            {/* Host Bio */}
            <p className="text-muted-foreground text-base leading-normal">{user.bio ?? ''}</p>

            {/* Host Details */}
            <div className="flex flex-col gap-2 text-sm">
                <div className="flex gap-2 items-center">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">
                        Joined in{' '}
                        {user.created_at
                            ? formatDate(new Date(user.created_at), 'MMMM yyyy')
                            : 'N/A'}
                    </span>
                </div>
                <div className="flex gap-2 items-center">
                    <MessageCircle className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">
                        Response rate -{' '}
                        {responseRatePercentage ? `${responseRatePercentage.toFixed(1)}%` : 'N/A'}
                    </span>
                </div>
                <div className="flex gap-2 items-center">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">
                        {/* Fast response - {user.response_time ?? 'N/A'} */}
                        Fast response - {getResponseTimeText(responseRatePercentage)}
                    </span>
                </div>
            </div>
        </Card>
    );
}
