
import React from 'react';
import { Phone } from 'lucide-react';
import { BookingDetailsType } from '@/types/booking.types';
import { capitalizeWord } from '@/utils/helperFunctions';
import { format } from 'date-fns';

interface ContactInfoProps {
    bookingDetails: BookingDetailsType;
    isInHost: boolean;
}

export const ContactInfo = ({ bookingDetails, isInHost }: ContactInfoProps) => {
    const phoneNumber = isInHost
        ? bookingDetails?.hostUserMobileNumber
        : bookingDetails?.receiver?.phoneNumber;

    // Hide phone number if booking is completed
    const isCompleted = bookingDetails?.status?.toLowerCase() === 'completed';

    if (!phoneNumber || isCompleted) return null;

    return (
        <div className="flex items-center gap-2 pt-2 text-gray-700 font-semibold">
            <Phone className="w-4 h-4 text-gray-600" />
            <span className="text-sm">{phoneNumber}</span>
        </div>
    );
};

interface AddressInfoProps {
    bookingDetails: BookingDetailsType;
    displayFullDetails: boolean;
}

export const AddressInfo = ({ bookingDetails, displayFullDetails }: AddressInfoProps) => {
    if (displayFullDetails) {
        const addressParts = [
            bookingDetails.address,
            bookingDetails.area,
            bookingDetails.locality,
            bookingDetails.city,
            bookingDetails.state,
            bookingDetails.pincode ? bookingDetails.pincode : null,
        ].filter(Boolean);

        if (addressParts.length === 0) return null;

        return (
            <div className="flex flex-row gap-2 items-start">
                <p className="text-sm text-gray-600">{addressParts.join(', ')}</p>
            </div>
        );
    }

    const hiddenAddress = [bookingDetails.city, bookingDetails.state].filter(Boolean);

    if (hiddenAddress.length === 0) return null;

    return <p className="text-sm text-gray-600">{hiddenAddress.join(', ')}</p>;
};

interface TimeInfoProps {
    bookingDetails: BookingDetailsType;
}

export const TimeInfo = ({ bookingDetails }: TimeInfoProps) => {
    const startTime = bookingDetails.startDateTime
        ? format(new Date(bookingDetails.startDateTime), 'dd MMM yyyy, hh:mm a')
        : '-';

    const endTime = bookingDetails.endDateTime
        ? format(new Date(bookingDetails.endDateTime), 'hh:mm a')
        : '-';

    return (
        <p className="text-sm text-gray-600">
            {startTime} - {endTime}
        </p>
    );
};

export const BookingInfoSection = ({
    bookingDetails,
    displayFullDetails,
    onNavigateSpace,
    statusLabel,
}: {
    bookingDetails: BookingDetailsType;
    displayFullDetails: boolean;
    onNavigateSpace: () => void;
    statusLabel: string;
}) => (
    <div className="space-y-1">
        <p
            className="font-medium text-gray-800 cursor-pointer hover:underline"
            onClick={onNavigateSpace}
        >
            {capitalizeWord(bookingDetails.spaceName || '-')}
        </p>
        <AddressInfo bookingDetails={bookingDetails} displayFullDetails={displayFullDetails && !statusLabel.toLocaleLowerCase().includes('completed')} />
        <TimeInfo bookingDetails={bookingDetails} />

        {bookingDetails.duration && (
            <p className="text-sm text-gray-600">Duration: {bookingDetails.duration}</p>
        )}

        {bookingDetails.spaceData?.capacity > 0 && (
            <p className="text-sm text-gray-700">Guests: {bookingDetails?.guests || ''}</p>
        )}
        {bookingDetails?.id && (
            <p className="text-sm text-gray-700">Booking Id: {bookingDetails?.id || ''}</p>
        )}
    </div>
);
