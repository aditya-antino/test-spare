
import React from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookingDetailsType } from '@/types/booking.types';
import { PATHS } from '@/constants/path';
import { ContactInfo, BookingInfoSection } from './BookingInfo';
import { capitalizeWord } from '@/utils/helperFunctions';

interface BookingHeaderProps {
    bookingDetails: BookingDetailsType;
    isInHost: boolean;
    displayUser: any;
    statusLabel: string;
    textColor: string;
    displayFullDetails: boolean;
    isPast: boolean;
}

export const BookingHeader = ({
    bookingDetails,
    isInHost,
    displayUser,
    statusLabel,
    textColor,
    displayFullDetails,
    isPast,
}: BookingHeaderProps) => {
    const router = useRouter();

    const handleNavigateToGuestDetails = () => {
        const hostId = bookingDetails?.hostId;
        const receiverId = bookingDetails?.receiver?.id;

        if (!hostId && !receiverId) return;

        const url =
            isInHost && hostId
                ? `${PATHS.GUEST_DETAILS}/${hostId}`
                : receiverId
                    ? `${PATHS.GUEST_HOST_PROFILE}/${receiverId}`
                    : null;

        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const handleNavigateToSpace = () => {
        if (bookingDetails.spaceSlug) {
            router.push(`${PATHS.GUEST_SPACE_DETAILS}/${bookingDetails.spaceSlug}`);
        } else {
            console.warn('Space slug is missing, cannot navigate');
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-yellow-500">Booking Details</h2>

            <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                    <div className={`text-sm flex items-center ${textColor} mb-2`}>
                        <span className="inline-block w-2 h-2 rounded-full bg-[currentColor] mr-2 flex-shrink-0" />
                        <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${textColor}`}
                        >
                            {statusLabel}
                        </span>
                    </div>
                    {statusLabel === 'Pending Payout' && isPast && (
                        <p className="text-xs text-gray-500 mb-2 italic">
                            Your payout will be initiated on the next working day after the booking is successfully completed
                        </p>
                    )}

                    <h3
                        className="font-bold text-lg text-gray-900 cursor-pointer hover:underline break-words"
                        onClick={handleNavigateToGuestDetails}
                    >
                        {displayUser.name}
                    </h3>

                    {displayFullDetails && !statusLabel.toLocaleLowerCase().includes('completed') && (
                        <>
                            <ContactInfo bookingDetails={bookingDetails} isInHost={isInHost} />
                            <p className="font-bold pt-2 text-gray-700 text-sm">
                                {bookingDetails.dates || '-'}
                            </p>
                        </>
                    )}
                </div>

                <Avatar className="w-14 h-14 flex-shrink-0">
                    <AvatarImage src={displayUser.avatar} />
                    <AvatarFallback>
                        {displayUser.name
                            ?.split(' ')
                            .map((n: string) => n[0])
                            .join('') || '-'}
                    </AvatarFallback>
                </Avatar>
            </div>

            <BookingInfoSection
                bookingDetails={bookingDetails}
                statusLabel={statusLabel}
                displayFullDetails={displayFullDetails}
                onNavigateSpace={handleNavigateToSpace}
            />
        </div>
    );
};
