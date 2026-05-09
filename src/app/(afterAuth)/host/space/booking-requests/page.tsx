'use client';

import BookingRequestCard from '@/components/booking/BookingRequestCard';
import Image from 'next/image';
import yellowTick from '@/assets/yellow-tick.svg';
import Pagination from '@/components/ui/CustomPagination';
import { TableWithPagination } from '@/components/ui/table-with-pagination';
import { BookingRequest } from '@/types/reservations';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { CancelReservationModal } from '@/components/modals/CancelReservationModal';
import AcceptReservationModal from '@/components/modals/AcceptReservationModal';
import Typography from '@/components/ui/typoGraphy';
import emptyPlaceHolder from '@/assets/emptyPlaceHolder.svg';
import { PATHS } from '@/constants/path';
import TooltipText from '@/components/ui/tooltip';
import Link from 'next/link';
import { transformBookingRequest, transformToReservation } from '@/utils/mappers';
import { AppErrorBoundary } from '@/components/errors/AppErrorBoundary';
import { useBookingRequests } from './useBookingRequests';
import { ErrorState } from '@/components/common';

export default function BookingRequestsPage() {
    const {
        bookingRequestsData,
        isLoading,
        error,
        refetch,
        isAcceptOpen,
        setIsAcceptOpen,
        isRejectOpen,
        setIsRejectOpen,
        currentPage,
        setCurrentPage,
        selectedRow,
        setSelectedRow,
        hostPlatformFeePercentage,
        hostTDSPercentage,
        calculateHostAmount,
        approveBooking,
        itemsPerPage,
        router,
    } = useBookingRequests();

    const EmptyListComponent = () => (
        <div className="flex flex-col mx-auto mt-[12vh] max-w-96 items-center gap-4 h-full justify-center text-center">
            <Image src={emptyPlaceHolder} alt="No Listing" width={200} height={200} />
            <Typography color="text-neutral-800" size="2xl" weight="medium">
                No Data Available
            </Typography>
        </div>
    );

    const columns = [
        {
            key: 'guest',
            label: 'Guest',
            render: (_: any, row: BookingRequest) => (
                <div>
                    <Link
                        href={`${PATHS.GUEST_DETAILS}/${row.guestId}`}
                        target="_blank"
                        className="font-semibold text-zinc-800 text-sm hover:underline"
                    >
                        {row.guest}
                    </Link>
                    <div className="text-zinc-400 text-sm font-semibold">
                        {row.attendees} Attendees
                    </div>
                </div>
            ),
        },
        {
            key: 'space',
            label: 'Space Name',
            render: (_: any, row: BookingRequest) => (
                <div
                    className="font-semibold text-zinc-800 text-sm hover:underline cursor-pointer"
                    onClick={() => router.push(`${PATHS.SPACE_DETAILS}?spaceId=${row.spaceId}`)}
                >
                    {row.listing}
                </div>
            ),
        },
        {
            key: 'activityCategory',
            label: 'Activity Category',
            render: (_: any, row: BookingRequest) => (
                <div className="font-semibold text-zinc-800 text-sm">{row.activityCategory}</div>
            ),
        },
        {
            key: 'dateTime',
            label: 'Date & Time',
            render: (_: any, row: BookingRequest) => (
                <div>
                    <div className="font-semibold text-zinc-800 text-sm">{row.date}</div>
                    <div className="text-zinc-400 text-sm font-semibold">
                        {row.startTime} to {row.endTime}
                    </div>
                </div>
            ),
        },
        {
            key: 'amount',
            label: 'Total Payout',
            render: (_: any, row: BookingRequest) => {
                const { totalHostAmount } = calculateHostAmount(Number(row?.amount) || 0);

                return (
                    <div className="font-semibold text-zinc-800 text-sm">
                        ₹{totalHostAmount}
                    </div>
                );
            },
        },
        {
            key: 'guestMessage',
            label: 'Guest Message',
            render: (_: any, row: BookingRequest) => (
                <TooltipText text={row.guestMessage} maxWidth="200px" />
            ),
        },
        {
            key: 'actions',
            label: '',
            render: (_: any, row: BookingRequest) => (
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full"
                        onClick={() => {
                            setSelectedRow({
                                ...row,
                                hostPlatformFeePer: hostPlatformFeePercentage,
                                hostTDSPer: hostTDSPercentage,
                            });
                            setIsRejectOpen(true);
                        }}
                    >
                        <X className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="yellow"
                        size="icon"
                        className="rounded-full"
                        onClick={() => {
                            setSelectedRow({
                                ...row,
                                hostPlatformFeePer: hostPlatformFeePercentage,
                                hostTDSPer: hostTDSPercentage,
                            });

                            approveBooking({ bookingId: row.id });
                        }}
                    >
                        <Check className="w-5 h-5" />
                    </Button>
                </div>
            ),
        },
    ];

    if (error) {
        return (
            <div className="p-6 h-full flex flex-col">
                <ErrorState
                    title="Failed to load booking requests"
                    description="We couldn't fetch your booking requests at this time. Please check your connection and try again."
                    onRetry={() => refetch()}
                />
            </div>
        );
    }

    return (
        <AppErrorBoundary>
            <div className="space-y-6 p-6 flex h-full flex-col">
                <div className="p-4 sm:p-6 h-full flex flex-col">
                    <Typography size="4xl" weight="bold" color="text-[#F6CD28]">
                        Booking Requests
                    </Typography>

                    <div className="hidden flex-grow mt-8 flex-col sm:flex">
                        <TableWithPagination
                            columns={columns}
                            isLoading={isLoading}
                            data={bookingRequestsData?.data?.rows?.map((row: any) =>
                                transformBookingRequest({
                                    ...row,
                                    hostPlatformFeePer: hostPlatformFeePercentage,
                                    hostTDSPer: hostTDSPercentage,
                                }),
                            )}
                            showPagination={true}
                            emptyMessage={<EmptyListComponent />}
                            totalPages={Math.ceil((bookingRequestsData?.data?.count || 0) / itemsPerPage)}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                        />
                    </div>

                    {/* Mobile View */}
                    {bookingRequestsData?.data?.rows?.length > 0 ? (
                        <div className="flex flex-col sm:hidden gap-4 w-full my-4 mt-8">
                            {bookingRequestsData?.data?.rows?.map((row: any) =>
                                transformBookingRequest({
                                    ...row,
                                    hostPlatformFeePer: hostPlatformFeePercentage,
                                    hostTDSPer: hostTDSPercentage,
                                })
                            ).map((item: any) => (
                                <BookingRequestCard
                                    key={item.id}
                                    item={item}
                                    onAccept={() => {
                                        setSelectedRow(item);
                                        approveBooking({ bookingId: item.id });
                                    }}
                                    onReject={() => {
                                        setSelectedRow(item);
                                        setIsRejectOpen(true);
                                    }}
                                />
                            ))}
                            <Pagination
                                limit={itemsPerPage}
                                count={bookingRequestsData?.data?.count}
                                currentPage={currentPage}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    ) : (
                        <div className="sm:hidden">
                            {!isLoading && <EmptyListComponent />}
                        </div>
                    )}
                </div>

                <AcceptReservationModal
                    isVisible={isAcceptOpen}
                    icon={<Image width={60} height={60} alt="tick" src={yellowTick} unoptimized />}
                    title="Booking Request Accepted"
                    onClose={() => setIsAcceptOpen(false)}
                    spaceData={transformToReservation(selectedRow)}
                />

                <CancelReservationModal
                    open={isRejectOpen}
                    spaceData={transformToReservation(selectedRow)}
                    onClose={() => setIsRejectOpen(false)}
                    reservationId={selectedRow?.id}
                    onSuccess={() => refetch()}
                    isCancel={false}
                    isBookingRequest={true}
                    isInHost
                />
            </div>
        </AppErrorBoundary>
    );
}
