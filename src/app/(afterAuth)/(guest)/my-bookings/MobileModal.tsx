interface MobileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCancel?: () => void;
    onRating?: () => void;
    onBookingInvoice?: () => void;
    onPlatformInvoice?: () => void;
    onPlatformGSTInvoice?: () => void;
    onGuestGSTInvoice?: () => void;

    onBookingOriginalInvoice?: () => void;
    onGuestOriginalGSTInvoice?: () => void;
    onPlatformOriginalInvoice?: () => void;
    onPlatformOriginalGSTInvoice?: () => void;

    isGst?: boolean;

    activeTab?: string;
    onAddReview?: any;
    bookingStatus?: unknown;
}

export default function MobileModal({
    isOpen,
    onClose,
    onCancel,
    onBookingInvoice,
    onPlatformInvoice,
    onPlatformGSTInvoice,
    onGuestGSTInvoice,
    onBookingOriginalInvoice,
    onGuestOriginalGSTInvoice,
    onPlatformOriginalInvoice,
    onPlatformOriginalGSTInvoice,
    isGst,
    onAddReview,
    activeTab,
    bookingStatus,
}: MobileModalProps) {
    if (!isOpen) return null;

    const showDownloadInvoiceBtn = activeTab !== 'cancelled' && bookingStatus === 'confirmed';

    const showCanecllationInvoiceBtn = activeTab == 'cancelled' && bookingStatus === 'cancelled';

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

            <div className="relative w-full bg-white rounded-t-2xl shadow-lg p-4">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

                <ul className="divide-y divide-gray-200">
                    {activeTab === 'upcoming' && (
                        <li>
                            <button
                                onClick={onCancel}
                                className="py-3 w-full text-left font-medium"
                            >
                                Cancel Request
                            </button>
                        </li>
                    )}

                    {activeTab === 'completed' && (
                        <li>
                            <button
                                onClick={onAddReview}
                                className="py-3 w-full text-left font-medium"
                            >
                                Rating & Review
                            </button>
                        </li>
                    )}

                    {showDownloadInvoiceBtn && (
                        <>
                            {!isGst ? (
                                <>
                                    <li>
                                        <button
                                            className="py-3 w-full text-left font-medium"
                                            onClick={onBookingInvoice}
                                        >
                                            Download Booking Invoice
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className="py-3 w-full text-left font-medium"
                                            onClick={onPlatformInvoice}
                                        >
                                            Download Platform Invoice
                                        </button>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li>
                                        <button
                                            className="py-3 w-full text-left font-medium"
                                            onClick={onGuestGSTInvoice}
                                        >
                                            Download GST Booking Invoice
                                        </button>
                                    </li>

                                    <li>
                                        <button
                                            className="py-3 w-full text-left font-medium"
                                            onClick={onPlatformGSTInvoice}
                                        >
                                            Download GST Platform Invoice
                                        </button>
                                    </li>
                                </>
                            )}
                        </>
                    )}
                    {showCanecllationInvoiceBtn && (
                        <>
                            {!isGst ? (
                                <>
                                    <li>
                                        <button
                                            className="py-3 w-full text-left font-medium"
                                            onClick={onBookingInvoice}
                                        >
                                            Download Booking Cancellation Invoice
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className="py-3 w-full text-left font-medium"
                                            onClick={onPlatformInvoice}
                                        >
                                            Download Platform Cancellation Invoice
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className="py-3 w-full text-left font-medium"
                                            onClick={onBookingOriginalInvoice}
                                        >
                                            Download Booking Original Invoice
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className="py-3 w-full text-left font-medium"
                                            onClick={onPlatformOriginalInvoice}
                                        >
                                            Download Platform Original Invoice
                                        </button>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li>
                                        <button
                                            className="py-3 w-full text-left font-medium"
                                            onClick={onGuestGSTInvoice}
                                        >
                                            Download GST Booking Cancellation Invoice
                                        </button>
                                    </li>

                                    <li>
                                        <button
                                            className="py-3 w-full text-left font-medium"
                                            onClick={onPlatformGSTInvoice}
                                        >
                                            Download GST Platform Cancellation Invoice
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className="py-3 w-full text-left font-medium"
                                            onClick={onGuestOriginalGSTInvoice}
                                        >
                                            Download GST Booking Original Invoice
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className="py-3 w-full text-left font-medium"
                                            onClick={onPlatformOriginalGSTInvoice}
                                        >
                                            Download GST Platform Original Invoice
                                        </button>
                                    </li>
                                </>
                            )}
                        </>
                    )}
                </ul>
            </div>
        </div>
    );
}
