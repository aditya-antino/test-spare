'use client';

import { useState } from 'react';
import { TableWithPagination } from '@/components/ui/table-with-pagination';
import { Button } from '@/components/ui/button';
import { ChevronUp } from 'lucide-react';
import {
    Reservation,
    useCancelBulkBooking,
    useDeactivateSpace,
    useGetReservationList,
} from '@/services';
import dayjs from 'dayjs';
import emptyPlaceHolder from '@/assets/emptyPlaceHolder.svg';
import Typography from '@/components/ui/typoGraphy';
import Pagination from '@/components/ui/CustomPagination';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { CancelDeactivatedReservationsModal } from '@/components/modals/CancelDeactivatedReservationsModal';
import { DeactivateSpaceModal } from '@/components/modals/DeactivateSpaceModal';
import { DeactivateSpaceWarningModal } from '@/components/modals/DeactivateSpaceWarningModal';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { PATHS } from '@/constants/path';

const ReservationCardTypo = ({ label, value }: { label: string; value: string | number }) => {
    return (
        <div className="flex flex-col gap-1">
            <Typography color="text-neutral-500" size="sm">
                {label}
            </Typography>
            <Typography color="text-neutral-800" weight="semibold" size="sm">
                {value}
            </Typography>
        </div>
    );
};

const ReservationCard = ({ data, onClick }: { data: Reservation; onClick: () => void }) => {
    const [collapsed, setCollapsed] = useState(false);
    const startDate = dayjs(data.start_datetime);
    const endDate = dayjs(data.end_datetime);
    const bookedDate = dayjs(data.created_at);

    return (
        <div className="flex flex-col w-full bg-white rounded-2xl outline outline-offset-[-1px] overflow-hidden outline-black/30">
            {/* Header */}
            <div className="p-4 flex justify-between border-b items-center">
                <Typography weight="semibold" color="text-black" size="base">
                    {data.Space.title}
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
                    <ReservationCardTypo
                        label="Activity Category"
                        value={data.Space.CategoryMaster?.name || 'N/A'}
                    />
                    <ReservationCardTypo label="Space Name" value={data.Space.title} />

                    <ReservationCardTypo
                        label="Guest"
                        value={
                            data?.User
                                ? `${data.User.first_name || ''} ${
                                      data.User.last_name ? data.User.last_name[0] + '.' : ''
                                  }`.trim()
                                : '-'
                        }
                    />
                    <ReservationCardTypo label="Attendees" value={data.Space.capacity} />

                    <ReservationCardTypo label="Date" value={startDate.format('DD MMMM, YYYY')} />
                    <ReservationCardTypo
                        label="Time"
                        value={`${startDate.format('hh:mm A')} to ${endDate.format('hh:mm A')}`}
                    />

                    <ReservationCardTypo
                        label="Booked On"
                        value={bookedDate.format('DD MMM YYYY')}
                    />
                    <ReservationCardTypo
                        label="Total Payout"
                        value={`₹${Number(data.totalAmount).toLocaleString()}`}
                    />
                </div>

                <div className="p-4">
                    <Button
                        onClick={onClick}
                        className="text-gray-700 flex items-center justify-center w-full text-base font-semibold"
                        variant="outline"
                    >
                        Details
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default function Page() {
    const searchParams = useSearchParams?.();
    const [currentPage, setCurrentPage] = useState(1);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedReservationIds, setSelectedReservationIds] = useState<number[]>([]);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [showDeactivateWarningModal, setShowDeactivateWarningModal] = useState(false);
    const router = useRouter();
    const spaceId = searchParams.get('spaceId');
    const { mutate: deactivateSpace, isPending: isDeactivateLoading } = useDeactivateSpace({
        onSuccess: (data) => {
            toast.success(data?.message);
            router.push(PATHS.YOUR_LISTING);
            setShowDeactivateModal(false);
        },
        onError: (error) => {
            console.log(error);
        },
    });

    const { mutate: cancelBulkBooking, isPending: isCancelBulkBookingLoading } =
        useCancelBulkBooking({
            onSuccess: (data) => {
                toast.success(data?.message);
                refetchReservation();
                setSelectedReservationIds([]);
                setShowCancelModal(false);
            },
            onError: (error) => {
                toast.error(error?.message);
                console.log(error);
            },
        });

    const handleCancelBulkBooking = () => {
        if (selectedReservationIds.length === 0) {
            toast.error('Please select at least one reservation to cancel');
            return;
        }
        cancelBulkBooking({ bookingIds: selectedReservationIds, reasonId: '1' });
    };

    const handleDeactivateSpace = () => {
        deactivateSpace({ spaceIds: [Number(spaceId)], deactivate: true });
    };

    // Fetch reservations with filters and pagination
    const {
        data: reservationsData,
        isLoading,
        error,
        refetch: refetchReservation,
    } = useGetReservationList(
        { page: currentPage, limit: 10, status: 'upcoming', spaceId: Number(spaceId) },
        { enabled: true },
    );

    const reservations = reservationsData?.data?.rows || [];
    const totalPages = reservationsData?.data?.count;

    const handleCheckboxChange = (id: number, checked: boolean) => {
        setSelectedReservationIds((prev) =>
            checked ? [...prev, id] : prev.filter((reservationId) => reservationId !== id),
        );
    };

    const handleClearAll = () => {
        setSelectedReservationIds([]);
    };

    const columns = [
        {
            key: 'checkId',
            label: '',
            render: (_: any, row: Reservation) => (
                <Checkbox
                    className="cursor-pointer"
                    checked={selectedReservationIds.includes(row.id)}
                    onCheckedChange={(checked: boolean) => handleCheckboxChange(row.id, checked)}
                />
            ),
        },
        {
            key: 'guest',
            label: 'Guest',
            render: (_: any, row: Reservation) => (
                <div>
                    <div className="font-semibold text-zinc-800 text-sm">
                        {row?.User
                            ? `${row.User.first_name || ''} ${
                                  row.User.last_name ? row.User.last_name[0] + '.' : ''
                              }`.trim()
                            : '-'}
                    </div>
                    <div className="text-zinc-400 text-sm font-semibold">
                        {row.Space.capacity} Attendees
                    </div>
                </div>
            ),
        },
        {
            key: 'property',
            label: 'Listing',
            render: (_: any, row: Reservation) => (
                <div className="font-semibold text-zinc-800 text-sm">{row.Space.title}</div>
            ),
        },
        {
            key: 'space',
            label: 'Space name',
            render: (_: any, row: Reservation) => (
                <div className="font-semibold text-zinc-800 text-sm">{row.Space.address}</div>
            ),
        },
        {
            key: 'activityCategory',
            label: 'Activity Category',
            render: (_: any, row: Reservation) => (
                <div className="font-semibold text-zinc-800 text-sm">
                    {row.Space.CategoryMaster?.name || 'N/A'}
                </div>
            ),
        },
        {
            key: 'dateTime',
            label: 'Date and Time',
            render: (_: any, row: Reservation) => {
                const startDate = dayjs(row.start_datetime);
                const endDate = dayjs(row.end_datetime);

                return (
                    <div>
                        <div className="font-semibold text-zinc-800 text-sm">
                            {startDate.format('DD MMM YYYY')}
                        </div>
                        <div className="text-zinc-400 text-sm font-semibold">
                            {startDate.format('hh:mm A')} to {endDate.format('hh:mm A')}
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'bookedOn',
            label: 'Booked On',
            render: (_: any, row: Reservation) => {
                const bookedDate = dayjs(row.created_at);
                return (
                    <div>
                        <div className="font-semibold text-zinc-800 text-sm">
                            {bookedDate.format('DD MMM YYYY')}
                        </div>
                        <div className="text-zinc-400 text-sm font-semibold">
                            {bookedDate.format('hh:mm A')}
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'totalPayout',
            label: 'Total Payout',
            render: (_: any, row: Reservation) => (
                <div className="font-semibold text-zinc-800 text-sm">
                    ₹{Number(row.totalAmount).toLocaleString()}
                </div>
            ),
        },
        {
            key: 'cancelReservation',
            label: '',
            render: (_: any, row: Reservation) => (
                <Button
                    onClick={() => {
                        setShowCancelModal(true);
                        setSelectedReservationIds([row.id]);
                    }}
                    disabled={selectedReservationIds.length > 0}
                    variant={selectedReservationIds.length > 0 ? 'disabled' : 'outline'}
                >
                    Cancel Booking
                </Button>
            ),
        },
    ];

    if (error) {
        return (
            <div className="space-y-6 p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-center flex-1">
                    <div className="text-red-500">Failed to load reservations</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 px-6 py-4 sm:p-6 h-full flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <Typography size="4xl" weight="bold" color="text-[#F6CD28]">
                    Upcoming Reservations
                </Typography>
            </div>
            <Typography size="sm" color="black">
                Manage your upcoming reservations here. You can cancel individual bookings by
                selecting them and clicking 'Cancel Booking', or deactivate the listing entirely
                using 'Deactivate Listing'.
            </Typography>
            <div className="flex justify-between w-full items-center py-4">
                <div className="flex items-center">
                    <Typography size="2xl" weight="semibold" color="text-black">
                        {selectedReservationIds.length || 0} selected |
                    </Typography>
                    <Button
                        onClick={handleClearAll}
                        className="shadow-none border-0"
                        variant="outline"
                    >
                        Clear All
                    </Button>
                </div>
                <Button
                    disabled={selectedReservationIds.length === 0}
                    onClick={() => setShowCancelModal(true)}
                    variant={selectedReservationIds.length === 0 ? 'disabled' : 'outline'}
                >
                    Cancel Booking  
                </Button>
            </div>

            <div className="hidden h-full sm:flex">
                <TableWithPagination
                    columns={columns}
                    data={reservations}
                    showPagination={true}
                    emptyMessage={
                        isLoading ? (
                            'Loading...'
                        ) : (
                            <div className="flex text-center mx-auto mt-[12vh] max-w-96 items-center gap-4 flex-col h-full">
                                <Image
                                    src={emptyPlaceHolder}
                                    alt="No Listing"
                                    width={200}
                                    height={200}
                                />
                                <Typography color="text-neutral-800" size="2xl" weight="medium">
                                    No Data Available
                                </Typography>
                            </div>
                        )
                    }
                    currentPage={currentPage}
                    totalPages={totalPages || 1}
                    setCurrentPage={setCurrentPage}
                />
            </div>

            {reservations.length ? (
                <div className="sm:hidden">
                    <div className="flex flex-col sm:hidden gap-4 w-full">
                        {reservations?.map((data, index) => {
                            return <ReservationCard onClick={() => {}} data={data} key={index} />;
                        })}
                    </div>
                    <Pagination
                        limit={10}
                        count={totalPages}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            ) : (
                <div className="flex text-center mx-auto max-w-96 sm:hidden justify-end items-center gap-4 flex-col h-40">
                    <Typography color="text-neutral-800" size="2xl" weight="medium">
                        No Data Available
                    </Typography>
                </div>
            )}

            <CancelDeactivatedReservationsModal
                open={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onSubmit={handleCancelBulkBooking}
                isLoading={isCancelBulkBookingLoading}
            />

            <DeactivateSpaceModal
                open={showDeactivateModal}
                onClose={() => {
                    setShowDeactivateWarningModal(false);
                    setShowDeactivateModal(false);
                }}
                onSubmit={() => setShowDeactivateWarningModal(true)}
                isLoading={false}
            />

            <DeactivateSpaceWarningModal
                isLoading={isDeactivateLoading}
                open={showDeactivateWarningModal}
                onClose={() => {
                    setShowDeactivateWarningModal(false);
                    setShowDeactivateModal(false);
                }}
                onSubmit={() => {
                    handleDeactivateSpace();
                }}
            />

            <div className="flex w-full justify-end gap-4">
                <Button variant="outline" onClick={() => router.push(PATHS.YOUR_LISTING)}>
                    Cancel
                </Button>
                <Button onClick={() => setShowDeactivateModal(true)}>Deactivate Listing</Button>
            </div>
        </div>
    );
}
