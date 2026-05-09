'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { ChevronUp } from 'lucide-react';
import Typography from '../ui/typoGraphy';
import { StatusBadge } from '../ui/status-badge';
import { BookingStatus } from '@/constants/booking-status';
import { TabStatus } from '@/app/(afterAuth)/(guest)/my-bookings/useMyBookings';
import { GuestBooking } from '@/types/@types.guestBookings';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


interface CardProps {
    data: GuestBooking;
    onActionClick: () => void;
    onPayNowClick: () => void;
    activeTab: TabStatus;
    loading?: boolean;
    isProcessingPayment?: boolean;
    onCancellationDetail?: () => void;
}

const MyBookingCard = ({
    data,
    onActionClick,
    onPayNowClick,
    activeTab,
    loading = false,
    isProcessingPayment = false,
    onCancellationDetail,
}: CardProps) => {
    const [collapsed, setCollapsed] = useState(false);

    const CardTypo = ({
        label,
        value,
        spaceData = {},
    }: {
        label: string;
        value: string | number | null | undefined;
        spaceData?: any;
    }) => {
        const router = useRouter();
        const handlePressText = () => {
            if (label === 'Space Name') {
                if (spaceData?.slug) {
                    router.push(`/space-details/${spaceData.slug}`);
                } else {
                    console.warn('Space slug is missing, cannot navigate');
                }
            }
            if (label === 'Host') {
                if (spaceData?.id) {
                    router.push(`/host-profile/${spaceData?.User?.id}`);
                }
            }
        };
        return (
            <div className="flex flex-col gap-1">
                <Typography color="text-neutral-500" size="sm">
                    {label}
                </Typography>
                <Typography
                    color="text-neutral-800"
                    weight="semibold"
                    size="sm"
                    onClick={handlePressText}
                    className="truncate py-1"
                >
                    {loading ? 'Loading...' : value || '-'}
                </Typography>
            </div>
        );
    };

    const isPaid = data?.bookingStatus === 'confirmed';
    const isCancellationTab = activeTab == 'cancelled';
    const guestCancellationTotal = parseFloat(data?.Cancellations?.[0]?.refund_amount ?? 0);
    const showActionBtn =
        data?.bookingStatus === 'confirmed' || data?.bookingStatus === 'cancelled';

    const showCancellationBTN = activeTab === 'cancelled' && data?.bookingStatus === 'cancelled';

    const space = data?.Space;

    const fullAddress = [
        space?.street,
        space?.address,
        space?.area,
        space?.locality,
        space?.City?.city,
        space?.City?.state,
        space?.pincode,
    ]
        .filter(Boolean)
        .join(', ');

    const shortAddress = [space?.City?.city, space?.City?.state].filter(Boolean).join(', ');

    const location = isPaid && activeTab === 'upcoming' ? fullAddress || '-' : shortAddress || '-';

    const activityCategory = data?.Space?.CategoryMaster?.name || 'N/A';
    const host = data?.Space?.User
        ? `${data.Space.User.first_name || ''} ${data.Space.User.last_name ? data.Space.User.last_name[0] + '.' : ''
            }`.trim() || '-'
        : '-';
    const phone = data?.Space?.User?.phone_number || '-';

    const shouldShowPhoneNumber =
        activeTab !== 'completed' &&
        activeTab !== 'cancelled' &&
        data?.bookingStatus === 'confirmed';

    const start = data?.start_datetime ? new Date(data.start_datetime) : null;
    const end = data?.end_datetime ? new Date(data.end_datetime) : null;

    const date = start
        ? start.toLocaleDateString(undefined, {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
        : '-';

    const time =
        start && end
            ? `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()}`
            : '-';

    const totalPayout = `₹${isCancellationTab ? guestCancellationTotal : Number(data?.total_amount || 0).toLocaleString('en-IN')}`;

    const isPayToConfirm =
        data?.bookingStatus?.toLowerCase().replace(/_/g, ' ') === 'pay to confirm';

    return (
        <div className="flex flex-col w-full bg-white rounded-2xl border border-black/10 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-black/10">
                <div className="flex justify-between items-center mb-1">
                    <Link
                        href={data?.mapsUrl || '#'}
                        target={data?.mapsUrl ? '_blank' : undefined}
                        rel={data?.mapsUrl ? 'noopener noreferrer' : undefined}
                        className={`font-semibold text-zinc-800 text-sm min-w-[200px] xs:min-w-[280px] sm:min-w-[320px] md:min-w-[380px] lg:min-w-[420px] xl:min-w-[460px] 2xl:min-w-[500px] whitespace-pre-line ${data?.mapsUrl ? 'hover:underline cursor-pointer' : ''}`}
                    >
                        {location}
                    </Link>

                    <button
                        onClick={() => setCollapsed((prev) => !prev)}
                        className={`cursor-pointer transition-transform duration-300 ${collapsed ? 'rotate-180' : ''
                            }`}
                    >
                        <ChevronUp />
                    </button>
                </div>

                {activeTab === 'cancelled' && <StatusBadge status={data.refundStatus} />}
                {activeTab === 'upcoming' && (
                    <StatusBadge status={data.bookingStatus || BookingStatus.Pending} />
                )}
            </div>

            {/* Collapsible Section */}
            <div
                className={`transition-[max-height] duration-500 ease-in-out overflow-hidden ${collapsed ? 'max-h-0' : 'max-h-[1000px]'
                    }`}
            >
                <div className="grid grid-cols-2 gap-4 p-4 w-full">
                    <CardTypo label="Booking Id" value={data?.id} />

                    <CardTypo label="Activity Category" value={activityCategory} />
                    <CardTypo
                        label="Space Name"
                        value={data?.Space?.title}
                        spaceData={data?.Space}
                    />
                    <CardTypo label="Host" value={host} spaceData={data?.Space} />
                    {shouldShowPhoneNumber && (
                        <CardTypo label="Host Contact Number" value={phone} />
                    )}
                    <CardTypo label="Date" value={date} />
                    <CardTypo label="Time" value={time} />
                    <CardTypo
                        label={`Total ${isCancellationTab ? 'Refund' : 'Payout'}`}
                        value={totalPayout}
                    />
                </div>

                <div className="flex p-4 gap-4">
                    {isPayToConfirm && (
                        <Button
                            onClick={onPayNowClick}
                            className="text-gray-700 flex-1 text-base font-semibold"
                            variant="default"
                            disabled={isProcessingPayment}
                        >
                            {isProcessingPayment ? 'Processing...' : 'Pay Now'}
                        </Button>
                    )}
                    <>
                        {showActionBtn && (
                            <Button
                                onClick={onActionClick}
                                className="text-gray-700 flex-1 text-base font-semibold"
                                variant="outline"
                            >
                                Actions
                            </Button>
                        )}
                        {showCancellationBTN && (
                            <Button
                                onClick={onCancellationDetail}
                                className="text-gray-700 flex-1 text-base font-semibold"
                                variant="outline"
                            >
                                Details
                            </Button>
                        )}
                    </>
                </div>
            </div>
        </div>
    );
};

export default MyBookingCard;
