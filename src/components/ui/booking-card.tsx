import { StatusBadge } from './status-badge';
import { ArrowRight, MoreVertical } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { BookingStatus } from '@/constants/booking-status';

export interface BookingCardProps {
    id: string;
    status: BookingStatus;
    guestName: string;
    bookingDate: string;
    bookingTimeStart: string;
    bookingTimeEnd: string;
    mobileNumber: string;
    bookedDate: string;
    listingName: string;
    confirmationCode: string;
    totalPayout: string;
    onDetailsClick?: () => void;
    onMenuAction?: (action: string) => void;
}

export function BookingCard({
    status,
    guestName,
    bookingDate,
    bookingTimeStart,
    bookingTimeEnd,
    mobileNumber,
    bookedDate,
    listingName,
    confirmationCode,
    totalPayout,
    onDetailsClick,
    onMenuAction,
}: BookingCardProps) {
    return (
        <div className="min-w-[300px] w-full border border-gray-200 rounded-2xl p-4 shadow-sm bg-white space-y-3">
            {/* Top row: Status & menu */}
            <div className="flex justify-between items-start">
                <StatusBadge status={status} />

                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <button className="p-1 rounded-full hover:bg-gray-100">
                            <MoreVertical className="w-5 h-5 cursor-pointer" />
                        </button>
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Content
                        align="end"
                        sideOffset={4}
                        className="min-w-[160px] rounded-md bg-white shadow-lg p-1"
                    >
                        <DropdownMenu.Item
                            className="px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer rounded"
                            onClick={() => onMenuAction?.('edit')}
                        >
                            Rating and Review
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                            className="px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer rounded"
                            onClick={() => onMenuAction?.('duplicate')}
                        >
                            Download Invoice
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                            className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer rounded"
                            onClick={() => onMenuAction?.('cancel')}
                        >
                            Cancel
                        </DropdownMenu.Item>
                    </DropdownMenu.Content>
                </DropdownMenu.Root>
            </div>

            {/* Guest */}
            <div>
                <p className="text-[1rem] font-semibold text-gray-500">Guest</p>
                <p className="text-sm text-gray-800">{guestName}</p>
            </div>

            {/* Booking Date & Time */}
            <div className="flex gap-6">
                <div>
                    <p className="text-[1rem] font-semibold text-gray-500">Booking Date</p>
                    <p className="text-sm text-gray-800">{bookingDate}</p>
                </div>
                <div>
                    <p className="text-[1rem] font-semibold text-gray-500">Booking Time</p>
                    <p className="text-sm text-gray-800 flex items-center gap-1">
                        {bookingTimeStart} <ArrowRight className="w-4 h-4 text-yellow-500" />{' '}
                        {bookingTimeEnd}
                    </p>
                </div>
            </div>

            {/* Mobile Number */}
            <div>
                <p className="text-[1rem] font-semibold text-gray-500">Mobile Number</p>
                <p className="text-sm text-gray-800">{mobileNumber}</p>
            </div>

            {/* Booked On */}
            <div>
                <p className="text-[1rem] font-semibold text-gray-500">Booked</p>
                <p className="text-sm text-gray-800">{bookedDate}</p>
            </div>

            {/* Listing */}
            <div>
                <p className="text-[1rem] font-semibold text-gray-500">Listing</p>
                <p className="text-sm text-gray-800">{listingName}</p>
            </div>

            {/* Confirmation Code */}
            <div>
                <p className="text-[1rem] font-semibold text-gray-500">Confirmation code</p>
                <p className="text-sm text-gray-800">{confirmationCode}</p>
            </div>

            {/* Total Payout */}
            <div>
                <p className="text-[1rem] font-semibold text-gray-500">Total Payout</p>
                <p className="text-sm text-gray-800">{totalPayout}</p>
            </div>

            {/* Details Button */}
            {onDetailsClick && (
                <button
                    onClick={onDetailsClick}
                    className="w-full rounded-full border border-gray-300 text-gray-800 text-sm py-2 hover:bg-gray-50 transition"
                >
                    Details
                </button>
            )}
        </div>
    );
}
