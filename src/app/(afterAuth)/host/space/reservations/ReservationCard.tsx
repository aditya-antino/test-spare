'use client';

import React, { useState } from 'react';
import { Reservation } from '@/services';
import Typography from '@/components/ui/typoGraphy';
import { Button } from '@/components/ui/button';
import { ChevronUp, MoreHorizontal } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import dayjs from 'dayjs';
import { PATHS } from '@/constants/path';
import Link from 'next/link';
import { formatToIST } from '@/utils/helperFunctions';
import { CalculatedAmounts } from './useReservations';

const ReservationCardTypo = ({
    label,
    value,
    href,
}: {
    label: string;
    value: string | number;
    href?: string;
}) => (
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

interface ReservationCardProps {
    data: Reservation;
    onClick: () => void;
    activeStatusTab: string;
    actions: {
        label: string;
        onClick: (row: Reservation) => void;
        allowedStatuses: string[];
        shouldShow?: (row: any) => boolean;
    }[];
    handleAddRatingAndReview: (booking: any) => void;
    calculateHostAmount: (row: Reservation) => CalculatedAmounts;
    isInHost: boolean;
}

export const ReservationCard = ({
    data,
    onClick,
    activeStatusTab,
    actions,
    handleAddRatingAndReview,
    calculateHostAmount,
    isInHost,
}: ReservationCardProps) => {
    const [collapsed, setCollapsed] = useState(false);
    const isInCancelledTab = activeStatusTab === 'cancelled';

    const { totalHostAmount } = calculateHostAmount(data);

    return (
        <div className="flex flex-col w-full bg-white rounded-2xl outline outline-offset-[-1px] overflow-hidden outline-black/30">
            <div className="p-4 flex justify-between border-b items-center">
                <Typography weight="semibold" color="text-black" size="base">
                    {data.Space.title}
                </Typography>
                <div className="flex items-center gap-2">
                    {['upcoming', 'completed', 'pending_payout'].includes(activeStatusTab.toLowerCase()) && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <MoreHorizontal className="h-5 w-5 rotate-90" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="cursor-pointer p-0" align="end">
                                {(activeStatusTab === 'completed' ||
                                    activeStatusTab === 'pending_payout') && (
                                        <DropdownMenuItem
                                            className="py-2 shadow-none rounded-none"
                                            onSelect={() => handleAddRatingAndReview(data)}
                                        >
                                            Add Guest Review
                                        </DropdownMenuItem>
                                    )}
                                {actions
                                    .filter(
                                        (action) =>
                                            action.allowedStatuses.includes(
                                                activeStatusTab.toLowerCase(),
                                            ) &&
                                            (!action.shouldShow || action.shouldShow(data)),
                                    )
                                    .map((action, index) => (
                                        <DropdownMenuItem
                                            key={index}
                                            className={`${index !== actions.length - 1 ? 'border-b' : ''} py-2 shadow-none rounded-none`}
                                            onClick={() => action.onClick(data)}
                                        >
                                            {action.label}
                                        </DropdownMenuItem>
                                    ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    <button
                        onClick={() => setCollapsed((prev) => !prev)}
                        className={`cursor-pointer hover:text-gray-500 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
                    >
                        <ChevronUp />
                    </button>
                </div>
            </div>

            <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${collapsed ? 'max-h-0' : 'max-h-[1000px]'
                    }`}
            >
                <div className="grid grid-cols-2 gap-4 p-4 w-full">
                    <ReservationCardTypo label="Booking Id" value={data?.id || ''} />
                    <ReservationCardTypo
                        label="Activity Category"
                        value={data.Space.CategoryMaster?.name || 'N/A'}
                    />
                    <ReservationCardTypo label="Space Name" value={data.Space.title} />

                    <ReservationCardTypo
                        label="Guest"
                        value={
                            data?.User
                                ? `${data.User.first_name || ''} ${data.User.last_name ? data.User.last_name[0] + '.' : ''
                                    }`.trim()
                                : '-'
                        }
                        href={`${PATHS.GUEST_DETAILS}/${data.User.id}`}
                    />
                    {(activeStatusTab === 'completed' || activeStatusTab === 'upcoming') && (
                        <ReservationCardTypo
                            label="Mobile Number"
                            value={data.User?.phone_number || 'N/A'}
                        />
                    )}
                    <ReservationCardTypo label="Attendees" value={data.attendees} />
                    <ReservationCardTypo
                        label="Date"
                        value={dayjs(data.startDatetime).format('DD MMMM, YYYY')}
                    />
                    <ReservationCardTypo
                        label="Time"
                        value={`${formatToIST(data.startDatetime)} to ${formatToIST(data.endDatetime)}`}
                    />
                    <ReservationCardTypo
                        label="Booked On"
                        value={dayjs(data.created_at).format('DD MMMM, YYYY')}
                    />
                    <ReservationCardTypo
                        label={isInCancelledTab ? 'Total Refund' : 'Total Payout'}
                        value={`₹${isInHost ? totalHostAmount : Number(data.totalAmount).toLocaleString()}`}
                    />
                </div>

                <div className="p-4 flex flex-col gap-2">
                    {['upcoming', 'completed', 'cancelled', 'pending_payout'].includes(activeStatusTab) && (
                        <Button
                            onClick={onClick}
                            className="text-gray-700 flex items-center justify-center w-full text-base font-semibold"
                            variant="outline"
                        >
                            Details
                        </Button>
                    )}

                    {(activeStatusTab === 'completed' || activeStatusTab === 'pending_payout') && (
                        <Button
                            onClick={() => handleAddRatingAndReview(data)}
                            className="text-gray-700 flex items-center justify-center w-full text-base font-semibold mt-2"
                            variant="outline"
                        >
                            Add Rating & Review
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
