'use client';

import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/ui/CustomPagination';
import { TableWithPagination } from '@/components/ui/table-with-pagination';
import { Tabs } from '@/components/ui/tabs';
import { MY_BOOKING_STATUS_TAB } from '@/constants/booking-status';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import MyBookingCard from '@/components/booking/MyBookingCard';
import MobileModal from './MobileModal';
import { GuestBooking } from '@/types/@types.guestBookings';
import { ROW_LIMIT } from '@/constants';
import { capitalizeWord } from '@/utils/helperFunctions';
import { SkeletonTable, BookingsSkeleton } from '@/components/skeletons';
import { EmptyState } from '@/components/common';
import {
    CancellationConfirmationModal,
    CancellationDetailModal,
    ReviewModal,
} from '@/components';
import Link from 'next/link';
import { PATHS } from '@/constants/path';


import { useMyBookings, TabStatus } from './useMyBookings';

const MyBookingsContent = () => {
    const {
        activeStatusTab,
        bookings,
        loading,
        pagination,
        showSuccessModal,
        setShowSuccessModal,
        selectedSpace,
        setSelectedSpace,
        isCancellationDetails,
        setIsCancellationDetails,
        isCancellationModalOpen,
        setIsCancellationModalOpen,
        isCancelling,
        processingBookingId,
        selectedBookingForAction,
        setSelectedBookingForAction,
        showModal,
        setShowModal,
        openReviewModal,
        setOpenReviewModal,
        ratingState,
        handleTabChange,
        handlePayNow,
        handleCancelBooking,
        getInvoice,
        getCancellationInvoice,
        handleAddRatingAndReview,
        fetchBookings,
        router,
    } = useMyBookings();

    const renderLocation = (row: GuestBooking) => {
        const space = row?.Space;
        if (!space) return '-';

        const { address, area, locality, pincode, City, street } = space;
        const city = City?.city;
        const state = City?.state;
        const isPaid = row?.bookingStatus === 'confirmed';
        const fullAddress = [street, address, area, locality, city, state, pincode]
            .filter(Boolean)
            .join(', ');
        const shortAddress = [city, state].filter(Boolean).join(', ');

        if (!fullAddress && !shortAddress) return '-';
        return isPaid && activeStatusTab == 'upcoming' ? fullAddress : shortAddress;
    };

    const columns = [
        {
            key: 'id',
            label: 'Booking Id',
            className: 'text-[#B7B7B7]',
            render: (_: any, row: GuestBooking) => (
                <div className="font-medium text-zinc-800 text-sm text-center">{row?.id}</div>
            ),
        },
        {
            key: 'host',
            label: 'Host',
            className: 'text-[#B7B7B7]',
            render: (_: any, row: GuestBooking) => {
                const shouldShowPhoneNumber =
                    activeStatusTab !== 'cancelled' &&
                    activeStatusTab !== 'completed' &&
                    row?.bookingStatus === 'confirmed';

                return (
                    <div>
                        <div
                            className="font-semibold text-zinc-800 text-sm cursor-pointer hover:underline transition-colors"
                            onClick={() =>
                                row?.Space?.User?.id &&
                                router.push(`/host-profile/${row.Space.User.id}`)
                            }
                        >
                            {row?.Space?.User
                                ? `${capitalizeWord(row.Space.User.first_name)}${row.Space.User.last_name
                                    ? ' ' + capitalizeWord(row.Space.User.last_name[0]) + '.'
                                    : ''
                                }`
                                : '-'}
                        </div>
                        <div className="text-zinc-400 text-sm font-semibold">
                            {shouldShowPhoneNumber
                                ? `${row?.Space?.User?.phone_number || '-'} | ${row.attendees || 0} Attendees`
                                : `${row.attendees || 0} Attendees`}
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'location',
            label: 'Location',
            className: 'text-[#B7B7B7]',
            render: (_: any, row: GuestBooking) => (
                <div className="min-w-[250px] xs:min-w-[320px] sm:min-w-[380px] md:min-w-[450px] lg:min-w-[500px] xl:min-w-[550px] 2xl:min-w-[600px]">
                    <Link
                        href={row?.mapsUrl || '#'}
                        target={row?.mapsUrl ? '_blank' : undefined}
                        rel={row?.mapsUrl ? 'noopener noreferrer' : undefined}
                        className={`font-semibold text-zinc-800 text-sm whitespace-pre-line ${row?.mapsUrl ? 'hover:underline cursor-pointer' : ''}`}
                    >
                        {renderLocation(row)}
                    </Link>
                </div>
            ),
        },
        {
            key: 'space',
            label: 'Space Name',
            className: 'text-[#B7B7B7]',
            render: (_: any, row: GuestBooking) => (
                <>
                    <div
                        className="font-semibold text-zinc-800 text-sm cursor-pointer hover:underline transition-colors truncate"
                        onClick={() => {
                            if (row?.Space?.slug) {
                                router.push(`/space-details/${row.Space.slug}`);
                            } else {
                                console.warn('Space slug is missing, cannot navigate');
                            }
                        }}
                    >
                        {capitalizeWord(row?.Space?.title || '-')}
                    </div>
                    <div className="text-zinc-400 text-sm font-semibold">
                        {row?.attendees || 0} Attendees
                    </div>
                </>
            ),
        },
        {
            key: 'activityCategory',
            label: 'Activity Category',
            className: 'text-[#B7B7B7]',
            render: (_: any, row: GuestBooking) => (
                <div className="font-semibold text-zinc-800 text-sm">
                    {capitalizeWord(row?.Space?.CategoryMaster?.name || 'N/A')}
                </div>
            ),
        },
        {
            key: 'dateTime',
            label: 'Date and Time',
            className: 'text-[#B7B7B7]',
            render: (_: any, row: GuestBooking) => (
                <div>
                    <div className="font-semibold text-zinc-800 text-sm">
                        {new Date(row.start_datetime).toLocaleDateString()}
                    </div>
                    <div className="text-zinc-400 text-sm font-semibold">
                        {new Date(row.start_datetime)
                            .toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                            })
                            .toUpperCase()}{' '}
                        to{' '}
                        {new Date(row.end_datetime)
                            .toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                            })
                            .toUpperCase()}
                    </div>
                </div>
            ),
        },
        {
            key: 'status',
            label:
                activeStatusTab === 'completed'
                    ? null
                    : activeStatusTab !== 'cancelled'
                        ? 'Status'
                        : 'Refund status',
            className: 'text-[#B7B7B7]',
            render: (_: any, row: GuestBooking) =>
                activeStatusTab === 'completed' ? null : (
                    <StatusBadge
                        status={
                            activeStatusTab === 'cancelled' ? row.refundStatus : row.bookingStatus
                        }
                    />
                ),
        },
        {
            key: 'totalAmount',
            label: activeStatusTab === 'cancelled' ? 'Refund Amount' : 'Total Amount',
            className: 'text-[#B7B7B7]',
            render: (_: any, row: GuestBooking) => {
                const isCancellationTab = activeStatusTab == 'cancelled';
                const guestCancellationTotal = parseFloat(
                    row?.Cancellations?.[0]?.refund_amount ?? 0,
                );

                const totalAmount = isCancellationTab
                    ? guestCancellationTotal
                    : Number(row.total_amount);
                return (
                    <div className="font-semibold text-zinc-800 text-sm">
                        ₹{totalAmount.toLocaleString()}
                    </div>
                );
            },
        },
        {
            key: 'buttons',
            label: '',
            render: (_, row: GuestBooking) => {
                const isPayToConfirm =
                    row.bookingStatus?.toLowerCase().replace(/_/g, ' ') === 'pay to confirm';
                const isProcessing = processingBookingId === row.id;
                return isPayToConfirm ? (
                    <Button
                        size="sm"
                        className="bg-[#F7CD29] hover:bg-[#F7CD29]/90 text-black font-semibold px-4 py-1 h-8 text-xs"
                        onClick={() => handlePayNow(row)}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Processing...' : 'Pay Now'}
                    </Button>
                ) : null;
            },
        },
        activeStatusTab === 'cancelled' && {
            key: 'cancellationDetails',
            label: '',
            render: (_, row: GuestBooking) => (
                <Button
                    onClick={() => {
                        setSelectedSpace(row);
                        setIsCancellationDetails(true);
                    }}
                    variant="outline"
                    size="sm"
                >
                    Details
                </Button>
            ),
        },
        activeStatusTab !== 'cancelled' && {
            key: 'actions',
            label: '',
            render: (_: any, row: GuestBooking) => {
                const isConfirmedBooking = row.bookingStatus === 'confirmed';
                const showDownloadInvoiceBtn = row.bookingStatus === 'confirmed';

                if (!isConfirmedBooking) {
                    return null;
                }

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <MoreHorizontal className="h-5 w-5 rotate-90" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-48 p-0">
                            {activeStatusTab !== 'completed' && (
                                <DropdownMenuItem
                                    className="py-2 px-3 text-sm font-medium hover:bg-gray-100"
                                    onSelect={() => {
                                        setSelectedBookingForAction(row);
                                        setIsCancellationModalOpen(true);
                                    }}
                                >
                                    Cancel
                                </DropdownMenuItem>
                            )}

                            {activeStatusTab === 'completed' && (
                                <DropdownMenuItem
                                    className="py-2 px-3 text-sm font-medium hover:bg-gray-100"
                                    onSelect={() => handleAddRatingAndReview(row)}
                                >
                                    Rating & Review
                                </DropdownMenuItem>
                            )}

                            {showDownloadInvoiceBtn && (
                                <>
                                    {!row?.isGst ? (
                                        <>
                                            <DropdownMenuItem
                                                className="py-2 px-3 text-sm font-medium hover:bg-gray-100"
                                                onSelect={() => getInvoice(row.id, 'guest_booking')}
                                            >
                                                Download Booking Invoice
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                className="py-2 px-3 text-sm font-medium hover:bg-gray-100"
                                                onSelect={() => getInvoice(row.id, 'guest_platform')}
                                            >
                                                Download Platform Invoice
                                            </DropdownMenuItem>
                                        </>
                                    ) : (
                                        <>
                                            <DropdownMenuItem
                                                className="py-2 px-3 text-sm font-medium hover:bg-gray-100"
                                                onSelect={() =>
                                                    getInvoice(row.id, 'guest_booking_gst')
                                                }
                                            >
                                                Download GST Booking Invoice
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                className="py-2 px-3 text-sm font-medium hover:bg-gray-100"
                                                onSelect={() =>
                                                    getInvoice(row.id, 'guest_platform_gst')
                                                }
                                            >
                                                Download GST Platform Invoice
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
        activeStatusTab === 'cancelled' && {
            key: 'actions',
            label: '',
            render: (_: any, row: GuestBooking) => {
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <MoreHorizontal className="h-5 w-5 rotate-90" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-48 p-0">
                            <>
                                {!row?.isGst ? (
                                    <>
                                        <DropdownMenuItem
                                            className="py-2 px-3 text-sm font-medium hover:bg-gray-100"
                                            onSelect={() =>
                                                getCancellationInvoice(row.id, 'guest_booking', true)
                                            }
                                        >
                                            Download Booking Cancellation Invoice
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                            className="py-2 px-3 text-sm font-medium hover:bg-gray-100"
                                            onSelect={() =>
                                                getCancellationInvoice(
                                                    row.id,
                                                    'guest_platform',
                                                    true,
                                                )
                                            }
                                        >
                                            Download Platform Cancellation Invoice
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="py-2 px-3 text-sm font-medium hover:bg-gray-100"
                                            onSelect={() =>
                                                getCancellationInvoice(
                                                    row.id,
                                                    'guest_booking',
                                                    false,
                                                )
                                            }
                                        >
                                            Download Booking Original Invoice
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="py-2 px-3 text-sm font-medium hover:bg-gray-100"
                                            onSelect={() =>
                                                getCancellationInvoice(
                                                    row.id,
                                                    'guest_platform',
                                                    false,
                                                )
                                            }
                                        >
                                            Download Platform Original Invoice
                                        </DropdownMenuItem>
                                    </>
                                ) : (
                                    <>
                                        <DropdownMenuItem
                                            className="py-2 px-3 text-sm font-medium hover:bg-gray-100"
                                            onSelect={() =>
                                                getCancellationInvoice(
                                                    row.id,
                                                    'guest_booking_gst',
                                                    true,
                                                )
                                            }
                                        >
                                            Download GST Booking Cancellation Invoice
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                            className="py-2 px-3 text-sm font-medium hover:bg-gray-100"
                                            onSelect={() =>
                                                getCancellationInvoice(
                                                    row.id,
                                                    'guest_platform_gst',
                                                    true,
                                                )
                                            }
                                        >
                                            Download GST Platform Cancellation Invoice
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="py-2 px-3 text-sm font-medium hover:bg-gray-100"
                                            onSelect={() =>
                                                getCancellationInvoice(
                                                    row.id,
                                                    'guest_booking_gst',
                                                    false,
                                                )
                                            }
                                        >
                                            Download GST Booking Original Invoice
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="py-2 px-3 text-sm font-medium hover:bg-gray-100"
                                            onSelect={() =>
                                                getCancellationInvoice(
                                                    row.id,
                                                    'guest_platform_gst',
                                                    false,
                                                )
                                            }
                                        >
                                            Download GST Platform Original Invoice
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ].filter(Boolean) as any[];

    return (
        <div className="max-w-[95%] mx-auto px-4 py-6 space-y-6">
            <h1 className="text-4xl sm:text-2xl font-bold text-[#F6CD28]">My Bookings</h1>

            <Tabs
                tabs={MY_BOOKING_STATUS_TAB}
                activeTab={activeStatusTab}
                onTabChange={handleTabChange}
                variant="underline"
                className="py-0"
                activeClass="text-base"
                inActiveClass="text-base"
            />

            {/* Desktop Table */}
            <div className="hidden flex-1 flex-col sm:flex">
                {loading ? (
                    <SkeletonTable rows={ROW_LIMIT} columns={columns.length} />
                ) : (
                    <TableWithPagination
                        columns={columns}
                        data={bookings}
                        showPagination={false}
                        emptyMessage={
                            <EmptyState
                                title="No bookings found"
                                description="You haven't made any bookings yet."
                                actionLabel="Explore Spaces"
                                onAction={() => router.push(PATHS.SPACE_LISTING_PAGE_GUEST)}
                            />
                        }
                    />
                )}
                <Pagination
                    limit={ROW_LIMIT}
                    count={pagination.totalItems}
                    currentPage={pagination.currentPage}
                    totalPage={pagination.totalPages}
                    onPageChange={(page) => fetchBookings(page)}
                />
            </div>
            <div className="flex flex-col sm:hidden gap-4 w-full">
                {loading ? (
                    <BookingsSkeleton />
                ) : bookings.length ? (
                    bookings.map((data, index) => (
                        <MyBookingCard
                            key={index}
                            data={data}
                            activeTab={activeStatusTab}
                            onActionClick={() => {
                                setSelectedBookingForAction(data);
                                setShowModal(true);
                            }}
                            onPayNowClick={() => handlePayNow(data)}
                            isProcessingPayment={processingBookingId === data.id}
                            onCancellationDetail={() => {
                                setIsCancellationDetails(true);
                                setSelectedSpace(data);
                            }}
                        />
                    ))
                ) : (
                    <EmptyState
                        title="No bookings found"
                        description="You haven't made any bookings yet."
                        actionLabel="Explore Spaces"
                        onAction={() => router.push(PATHS.SPACE_LISTING_PAGE_GUEST)}
                    />
                )}
                <Pagination
                    limit={ROW_LIMIT}
                    count={pagination.totalItems}
                    currentPage={pagination.currentPage}
                    totalPage={pagination.totalPages}
                    onPageChange={(page) => fetchBookings(page)}
                />
            </div>

            <MobileModal
                isOpen={showModal}
                isGst={selectedBookingForAction?.isGst}
                onCancel={() => {
                    setIsCancellationModalOpen(true);
                    setShowModal(false);
                }}
                onClose={() => {
                    setShowModal(false);
                    setSelectedBookingForAction(null);
                }}
                onBookingInvoice={() => {
                    if (selectedBookingForAction) {
                        if (activeStatusTab === 'cancelled') {
                            getCancellationInvoice(
                                selectedBookingForAction.id,
                                selectedBookingForAction.isGst
                                    ? 'guest_booking_gst'
                                    : 'guest_booking',
                                true,
                            );
                        } else {
                            getInvoice(selectedBookingForAction.id, 'guest_booking');
                        }
                    }
                    setShowModal(false);
                    setSelectedBookingForAction(null);
                }}
                onPlatformInvoice={() => {
                    if (selectedBookingForAction) {
                        if (activeStatusTab === 'cancelled') {
                            getCancellationInvoice(
                                selectedBookingForAction.id,
                                selectedBookingForAction.isGst
                                    ? 'guest_platform_gst'
                                    : 'guest_platform',
                                true,
                            );
                        } else {
                            getInvoice(selectedBookingForAction.id, 'guest_platform');
                        }
                    }
                    setShowModal(false);
                    setSelectedBookingForAction(null);
                }}
                onPlatformGSTInvoice={() => {
                    if (selectedBookingForAction) {
                        if (activeStatusTab === 'cancelled') {
                            getCancellationInvoice(
                                selectedBookingForAction.id,
                                'guest_platform_gst',
                                true,
                            );
                        } else {
                            getInvoice(selectedBookingForAction.id, 'guest_platform_gst');
                        }
                    }
                    setShowModal(false);
                    setSelectedBookingForAction(null);
                }}
                onGuestGSTInvoice={() => {
                    if (selectedBookingForAction) {
                        if (activeStatusTab === 'cancelled') {
                            getCancellationInvoice(
                                selectedBookingForAction.id,
                                'guest_booking_gst',
                                true,
                            );
                        } else {
                            getInvoice(selectedBookingForAction.id, 'guest_booking_gst');
                        }
                    }
                    setShowModal(false);
                    setSelectedBookingForAction(null);
                }}
                onBookingOriginalInvoice={() => {
                    if (selectedBookingForAction) {
                        getCancellationInvoice(
                            selectedBookingForAction.id,
                            'guest_booking',
                            false,
                        );
                    }
                    setShowModal(false);
                    setSelectedBookingForAction(null);
                }}
                onGuestOriginalGSTInvoice={() => {
                    if (selectedBookingForAction) {
                        getCancellationInvoice(
                            selectedBookingForAction.id,
                            'guest_booking_gst',
                            false,
                        );
                    }
                    setShowModal(false);
                    setSelectedBookingForAction(null);
                }}
                onPlatformOriginalInvoice={() => {
                    if (selectedBookingForAction) {
                        getCancellationInvoice(
                            selectedBookingForAction.id,
                            'guest_platform',
                            false,
                        );
                    }
                    setShowModal(false);
                    setSelectedBookingForAction(null);
                }}
                onPlatformOriginalGSTInvoice={() => {
                    if (selectedBookingForAction) {
                        getCancellationInvoice(
                            selectedBookingForAction.id,
                            'guest_platform_gst',
                            false,
                        );
                    }
                    setShowModal(false);
                    setSelectedBookingForAction(null);
                }}
                activeTab={activeStatusTab}
                onAddReview={handleAddRatingAndReview}
                bookingStatus={selectedBookingForAction?.bookingStatus}
            />
            <ReviewModal
                open={openReviewModal}
                onOpenChange={setOpenReviewModal}
                space={selectedSpace}
                state={ratingState}
                roleId={3}
                refreshData={() => fetchBookings(pagination.currentPage)}
            />
            <CancellationDetailModal
                isOpen={isCancellationDetails}
                onClose={() => {
                    setIsCancellationDetails(false);
                }}
                isInMyBookingsPage={true}
                data={selectedSpace}
            />
            <CancellationConfirmationModal
                isOpen={isCancellationModalOpen}
                onClose={() => setIsCancellationModalOpen(false)}
                onConfirm={handleCancelBooking}
                bookingId={selectedBookingForAction?.id?.toString() || ''}
                confirmText="Yes, Cancel Booking"
                cancelText="No, Keep Booking"
                isLoading={isCancelling}
            />
        </div>
    );
};

const MyBookingsClient = () => (
    <Suspense fallback={<BookingsSkeleton />}>
        <MyBookingsContent />
    </Suspense>
);

export default MyBookingsClient;
