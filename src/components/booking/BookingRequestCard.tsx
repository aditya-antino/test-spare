import React, { useState } from 'react';
import { BookingRequest } from '@/types/reservations';
import Typography from '../ui/typoGraphy';
import { ChevronUp } from 'lucide-react';
import { Button } from '../ui/button';
import { HOST_PLATFORM_FEE_PER, HOST_TDS_PER } from '@/constants';
import Link from 'next/link';
import { PATHS } from '@/constants/path';

interface CardProps {
    item: BookingRequest;
    onAccept: () => void;
    onReject: () => void;
}

const BookingCardTypo = ({
    label,
    value,
    href,
}: {
    label: string;
    value: string | number;
    href?: string;
}) => {
    return (
        <div className="flex flex-col gap-1">
            <Typography color="text-neutral-500" size="sm">
                {label}
            </Typography>
            {href ? (
                <Link href={href} className="hover:underline" target="_blank">
                    <Typography color="text-neutral-800" weight="semibold" size="sm">
                        {value}
                    </Typography>
                </Link>
            ) : (
                <Typography color="text-neutral-800" weight="semibold" size="sm">
                    {value}
                </Typography>
            )}
        </div>
    );
};

const BookingRequestCard = ({ onAccept, onReject, item }: CardProps) => {
    const [collapsed, setCollapsed] = useState(false);
    const hostPlatformFee = (Number(item?.amount) * Number(item?.hostPlatformFeePer)) / 100;
    const hostTDSFee = (Number(item?.amount) * Number(item?.hostTDSPer)) / 100;
    const totalHostAmount = item.totalHostAmount ?? (Number(item.amount) - (hostPlatformFee + hostTDSFee) || 0);

    return (
        <div className="flex flex-col w-full bg-white rounded-2xl outline outline-offset-[-1px] overflow-hidden outline-black/30">
            {/* Header */}
            <div className="p-4 flex justify-between border-b items-center">
                <Typography weight="semibold" color="text-black" size="base">
                    {item?.CategoryMaster?.name}
                </Typography>
                <button
                    onClick={() => setCollapsed((prev) => !prev)}
                    className={`cursor-pointer hover:text-gray-500 transition-transform duration-300 ${
                        collapsed ? 'rotate-180' : ''
                    }`}
                >
                    <ChevronUp />
                </button>
            </div>

            {/* Collapsible body with CSS transition */}
            <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    collapsed ? 'max-h-0' : 'max-h-[1000px]'
                }`}
            >
                <div className="grid grid-cols-2 gap-4 p-4 w-full">
                    <BookingCardTypo
                        label="Activity Category"
                        value={item.activityCategory || 'N/A'}
                    />
                    <BookingCardTypo label="Space Name" value={item.listing} />

                    <BookingCardTypo
                        label="Guest"
                        value={`${item.guest}`}
                        href={`${PATHS.GUEST_DETAILS}/${item.guestId}`}
                    />

                    <BookingCardTypo label="Attendees" value={item.attendees} />

                    <BookingCardTypo label="Date" value={item.date} />
                    <BookingCardTypo label="Time" value={`${item.startTime} to ${item.endTime}`} />

                    <BookingCardTypo
                        label="Amount"
                        value={`₹${Number(totalHostAmount).toFixed(2)}`}
                    />
                </div>
                <div className="px-4">
                    <BookingCardTypo label="Guest Message" value={item.guestMessage} />
                </div>

                <div className="flex gap-2 p-4">
                    <Button
                        onClick={onReject}
                        className="text-gray-700 flex items-center justify-center w-full text-base font-semibold"
                        variant="outline"
                    >
                        Reject
                    </Button>
                    <Button
                        onClick={onAccept}
                        className="text-gray-700 flex items-center justify-center w-full text-base font-semibold"
                        variant="default"
                    >
                        Accept
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default BookingRequestCard;
