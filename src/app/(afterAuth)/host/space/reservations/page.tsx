'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { Tabs } from '@/components/ui/tabs';
import { TableWithPagination } from '@/components/ui/table-with-pagination';
import { Button } from '@/components/ui/button';
import { FilterIcon, FileDown, MoreHorizontal, ArrowUp } from 'lucide-react';
import { FilterReservationsModal } from '@/components/modals/FilterReservationsModal';
import { ExportReservationsModal } from '@/components/modals/ExportReservationsModal';
import { Reservation } from '@/services';
import dayjs from 'dayjs';
import emptyPlaceHolder from '@/assets/emptyPlaceHolder.svg';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CancelReservationModal } from '@/components/modals/CancelReservationModal';
import Typography from '@/components/ui/typoGraphy';
import Pagination from '@/components/ui/CustomPagination';
import { useRouter } from 'next/navigation';
import ReservationDetails from '@/components/modals/reservationDetails';
import Image from 'next/image';
import { formatToIST } from '@/utils/helperFunctions';
import { PATHS } from '@/constants/path';
import { ReviewReservationModal } from '@/components/modals/ReviewReservationModal';
import { CancellationDetailModal, ReviewModal } from '@/components';
import Link from 'next/link';
import { useReservations } from './useReservations';
import { ReservationCard } from './ReservationCard';
import ArrowScrollWrapper from '@/components/ui/arrowScrollWrapper';
import { ReservationsSkeleton } from '@/components/shimmers/ReservationsSkeleton';
import { ErrorState } from '@/components/common';




export default function ReservationsPage() {
    const {
        activeStatusTab, setActiveStatusTab,
        currentPage, setCurrentPage,
        filters,
        showFilter, setShowFilter,
        showExport, setShowExport,
        selectedReservationId, setSelectedReservationId,
        selectedRow, setSelectedRow,
        showCancelModal, setShowCancelModal,
        showReviewModal, setShowReviewModal,
        isReservationDetails, setIsReservationDetails,
        isCancellationDetails, setIsCancellationDetails,
        isInHost,
        notifications,
        selectedSpace,
        openReviewModal, setOpenReviewModal,
        ratingState,
        reservations,
        totalPages,
        isLoading,
        error,
        refetchReservation,
        calculateHostAmount,
        handleAddRatingAndReview,
        handleExport,
        handleFilterApply,
        getInvoice,
        ReservationStatusTabs
    } = useReservations();

    const router = useRouter();
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const actions = useMemo(() => [
        {
            label: 'Cancel',
            onClick: (row: Reservation) => {
                setSelectedReservationId(row.id);
                setSelectedRow(row);
                setShowCancelModal(true);
            },
            allowedStatuses: ['upcoming'],
        },
        {
            label: 'Rating and Review',
            onClick: (row: Reservation) => {
                setSelectedReservationId(row.id);
                setSelectedRow(row);
                setShowReviewModal(true);
            },
            allowedStatuses: ['completed', 'cancelled', 'rejected'],
            shouldShow: (row: any) => {
                return row.Space?.Reviews && row.Space.Reviews.length > 0;
            },
        },
        {
            label: 'Download Invoice',
            onClick: (row: Reservation) => getInvoice(row.id),
            allowedStatuses: ['completed', 'pending_payout'],
        },
    ], [setSelectedReservationId, setSelectedRow, setShowCancelModal, setShowReviewModal, getInvoice]);

    const columns = useMemo(() => [
        {
            key: 'id',
            label: 'Booking Id',
            render: (_: any, row: Reservation) => (
                <div className="text-zinc-800 text-sm font-semibold text-center">{row?.id}</div>
            ),
        },
        {
            key: 'guest',
            label: 'Guest',
            render: (_: any, row: Reservation) => (
                <div>
                    <Link
                        href={`${PATHS.GUEST_DETAILS}/${row.User.id}`}
                        target="_blank"
                        className="font-semibold text-zinc-800 text-sm hover:underline"
                    >
                        {row?.User
                            ? `${row.User.first_name || ''} ${row.User.last_name ? row.User.last_name[0] + '.' : ''
                                }`.trim()
                            : '-'}
                    </Link>

                    <div className="text-zinc-400 text-sm font-semibold">
                        {row.attendees} Attendees
                    </div>
                </div>
            ),
        },
        {
            key: 'space',
            label: 'Space name',
            render: (_: any, row: Reservation) => (
                <div
                    className="font-semibold text-zinc-800 text-sm hover:underline cursor-pointer truncate"
                    onClick={() => router.push(`${PATHS.SPACE_DETAILS}?spaceId=${row.Space.id}`)}
                >
                    {row.Space.title}
                </div>
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
        ...(activeStatusTab === 'upcoming'
            ? [
                {
                    key: 'phone_number',
                    label: 'Mobile Number',
                    render: (_: any, row: Reservation) => (
                        <div className="font-semibold text-zinc-800 text-sm">
                            {row.User?.phone_number || 'N/A'}
                        </div>
                    ),
                },
            ]
            : []),
        {
            key: 'dateTime',
            label: 'Date and Time',
            render: (_: any, row: Reservation) => (
                <div>
                    <div className="font-semibold text-zinc-800 text-sm">
                        {dayjs(row.startDatetime).format('DD MMMM, YYYY')}
                    </div>
                    <div className="text-zinc-400 text-sm font-semibold">
                        {formatToIST(row.startDatetime)} to {formatToIST(row.endDatetime)}
                    </div>
                </div>
            ),
        },
        {
            key: 'bookedOn',
            label: 'Booked On',
            render: (_: any, row: Reservation) => (
                <div>
                    <div className="font-semibold text-zinc-800 text-sm">
                        {dayjs(row.created_at).format('DD MMMM, YYYY')}
                    </div>
                    <div className="text-zinc-400 text-sm font-semibold">
                        {formatToIST(row.created_at)}
                    </div>
                </div>
            ),
        },
        {
            key: 'totalPayout',
            label: 'Total Payout',
            render: (_: any, row: Reservation) => {
                const { totalHostAmount } = calculateHostAmount(row);

                return (
                    <div className="font-semibold text-zinc-800 text-sm">₹{totalHostAmount}</div>
                );
            },
        },
        {
            key: '',
            label: '',
            render: (_: any, row: Reservation) =>
                ['upcoming', 'completed', 'cancelled', 'pending_payout'].includes(
                    activeStatusTab,
                ) ? (
                    <Button
                        onClick={() => {
                            setSelectedRow(row);
                            if (activeStatusTab === 'cancelled') {
                                setIsCancellationDetails(true);
                            } else {
                                setIsReservationDetails(true);
                            }
                            setSelectedReservationId(row.id);
                        }}
                        variant="outline"
                    >
                        Details
                    </Button>
                ) : null,
        },
        {
            key: 'actions',
            label: '',
            render: (_: any, row: Reservation) =>
                ['upcoming', 'completed', 'pending_payout'].includes(activeStatusTab) ? (
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
                                        onSelect={() => handleAddRatingAndReview(row)}
                                    >
                                        Add Guest Review
                                    </DropdownMenuItem>
                                )}
                            {actions
                                .filter(
                                    (a) =>
                                        a.allowedStatuses.includes(activeStatusTab.toLowerCase()) &&
                                        (!a.shouldShow || a.shouldShow(row)),
                                )
                                .map((action, idx) => (
                                    <DropdownMenuItem
                                        key={idx}
                                        className={`${idx !== actions.length - 1 ? 'border-b' : ''} py-2 shadow-none rounded-none`}
                                        onClick={() => action.onClick(row)}
                                    >
                                        {action.label}
                                    </DropdownMenuItem>
                                ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : null,
        },
    ], [activeStatusTab, calculateHostAmount, setIsCancellationDetails, setIsReservationDetails, setSelectedReservationId, setSelectedRow, handleAddRatingAndReview, actions, router]);



    if (error) {
        return (
            <div className="p-6 h-full flex flex-col">
                <ErrorState
                    title="Failed to load reservations"
                    description="We couldn't fetch your reservations at this time. Please check your connection and try again."
                    onRetry={() => refetchReservation()}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6 px-6 py-4 sm:p-6 h-full flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <Typography size="4xl" weight="bold" color="text-[#F6CD28]">
                    Reservations
                </Typography>
                <div className="flex justify-end sm:justify-start gap-2">
                    <Button
                        variant="outline"
                        className="rounded-full"
                        onClick={() => setShowExport(true)}
                    >
                        <FileDown className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button
                        variant="outline"
                        className="rounded-full"
                        onClick={() => setShowFilter(true)}
                    >
                        <FilterIcon className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                </div>
            </div>

            <div>
                <ArrowScrollWrapper>
                    <Tabs
                        tabs={ReservationStatusTabs}
                        activeTab={activeStatusTab}
                        onTabChange={setActiveStatusTab}
                        variant="underline"
                        className="py-0"
                        activeClass="text-base"
                        inActiveClass="text-base"
                    />
                </ArrowScrollWrapper>
                <div className="w-full border-b border-neutral-300 -mt-[1px]" />
            </div>

            {isLoading ? (
                <ReservationsSkeleton />
            ) : (
                <>
                    <div className="hidden h-full sm:flex">
                        <TableWithPagination
                            columns={columns}
                            data={reservations}
                            showPagination={true}
                            emptyMessage={''}
                            currentPage={currentPage}
                            totalPages={totalPages || 1}
                            setCurrentPage={setCurrentPage}
                        />
                    </div>

                    {reservations.length ? (
                        <div className="sm:hidden">
                            <div className="flex flex-col sm:hidden gap-4 w-full">
                                {reservations?.map((data, index) => (
                                    <ReservationCard
                                        key={index}
                                        data={data}
                                        onClick={() => {
                                            setSelectedRow(data);
                                            setSelectedReservationId(data.id);
                                            if (activeStatusTab === 'cancelled') {
                                                setIsCancellationDetails(true);
                                            } else {
                                                setIsReservationDetails(true);
                                            }
                                        }}
                                        activeStatusTab={activeStatusTab}
                                        actions={actions}
                                        handleAddRatingAndReview={handleAddRatingAndReview}
                                        calculateHostAmount={calculateHostAmount}
                                        isInHost={isInHost}
                                    />
                                ))}
                            </div>
                            <Pagination
                                limit={10}
                                count={totalPages}
                                currentPage={currentPage}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    ) : (
                        <div className="flex text-center mx-auto mt-[12vh] max-w-96 items-center gap-4 flex-col h-full">
                            <Image src={emptyPlaceHolder} alt="No Listing" width={200} height={200} />
                            <Typography color="text-neutral-800" size="2xl" weight="medium">
                                No Data Available
                            </Typography>
                        </div>
                    )}
                </>
            )}

            <FilterReservationsModal
                open={showFilter}
                onClose={() => setShowFilter(false)}
                onApply={handleFilterApply}
                initialFilters={filters}
            />
            <ExportReservationsModal
                open={showExport}
                onClose={() => setShowExport(false)}
                onExport={handleExport}
                initialFilters={filters}
            />

            <CancelReservationModal
                open={showCancelModal}
                spaceData={selectedRow}
                onClose={() => setShowCancelModal(false)}
                reservationId={selectedReservationId}
                onSuccess={() => refetchReservation()}
                isInHost
            />
            {showReviewModal && (
                <ReviewReservationModal
                    open={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                    reservationId={selectedReservationId}
                />
            )}
            <ReservationDetails
                isOpen={isReservationDetails}
                onClose={() => {
                    setIsReservationDetails(false);
                }}
                data={selectedRow}
                activeTab={activeStatusTab}
            />
            <CancellationDetailModal
                isOpen={isCancellationDetails}
                onClose={() => {
                    setIsCancellationDetails(false);
                }}
                data={selectedRow}
            />
            <ReviewModal
                open={openReviewModal}
                onOpenChange={setOpenReviewModal}
                space={selectedSpace}
                state={ratingState}
                refreshData={refetchReservation}
            />

            {showScrollTop && (
                <Button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 rounded-full w-12 h-12 p-0 shadow-lg z-50 bg-[#F6CD28] hover:bg-yellow-500 text-black border-none"
                >
                    <ArrowUp className="w-6 h-6" />
                </Button>
            )}
        </div>
    );
}
