'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogOverlay,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2, XCircle, CheckCircle2, Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useGetGuestCancellationReason } from '@/services';
import { capitalizeWord } from '../../utils/helperFunctions';

interface CancellationConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    bookingId: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
}

const CancellationConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    bookingId,
    confirmText = 'Confirm Cancellation',
    cancelText = 'Go Back',
    isLoading = false,
}: CancellationConfirmationModalProps) => {
    const {
        data: cancellationData,
        isLoading: isLoadingPolicy,
        isError,
        error,
    } = useGetGuestCancellationReason(bookingId);

    const handleConfirm = () => {
        if (!isLoading && !isLoadingPolicy) {
            onConfirm();
        }
    };

    const handleClose = () => {
        if (!isLoading && !isLoadingPolicy) {
            onClose();
        }
    };

    const RenderContent = () => {
        if (isLoadingPolicy) {
            return (
                <div className="space-y-4 py-6">
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
                    </div>
                </div>
            );
        }

        if (isError) {
            return (
                <div className="py-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-red-900 mb-1">
                                Unable to load cancellation details
                            </h4>
                            <p className="text-sm text-red-700">
                                {error instanceof Error
                                    ? error.message
                                    : 'Please try again later or contact support.'}
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        if (!cancellationData?.data) {
            return (
                <div className="py-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                        <Info className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-yellow-900 mb-1">
                                No cancellation information available
                            </h4>
                            <p className="text-sm text-yellow-700">
                                Unable to retrieve cancellation policy details.
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        const policy = cancellationData.data;

        return (
            <>
                <div className="space-y-4 py-4">
                    <DialogDescription className="text-base">
                        Are you sure you want to cancel this booking? Please review the cancellation
                        details below.
                    </DialogDescription>

                    {policy.reason && policy.policyApplied && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                                <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="flex flex-col gap-2">
                                    <p className="text-sm text-blue-900 font-bold">
                                        Cancellation Policy: {capitalizeWord(policy.policyApplied || '')}
                                    </p>
                                    <p className="text-sm text-blue-900">{policy.reason}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900">Refund Summary</h4>

                        {policy?.refundPercent !== undefined && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Refund Percentage</span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {policy.refundPercent}%
                                </span>
                            </div>
                        )}

                        {policy.cancellationFee !== undefined && policy.cancellationFee > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Cancellation Fee</span>
                                <span className="text-sm font-semibold text-red-600">
                                    -₹{policy.cancellationFee.toFixed(2)}
                                </span>
                            </div>
                        )}

                        {policy.refundAmount !== undefined && (
                            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                <span className="text-base font-semibold text-gray-900">
                                    Refund Amount
                                </span>
                                <span className="text-lg font-bold text-green-600">
                                    ₹{policy.refundAmount.toFixed(2)}
                                </span>
                            </div>
                        )}
                    </div>

                    {policy.isPolicyApplicable === false && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-900">
                                    This booking is non-refundable or the cancellation window has
                                    passed.
                                </p>
                            </div>
                        </div>
                    )}

                    <p className="text-xs text-gray-500 pt-2">
                        The refund will be processed to your original payment method within 5-7
                        business days.
                    </p>
                </div>
                <DialogFooter className="flex flex-row gap-3 sm:justify-end">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading || isLoadingPolicy}
                        className="flex-1 sm:flex-none"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        className="flex-1 sm:flex-none"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Cancelling...
                            </>
                        ) : (
                            confirmText
                        )}
                    </Button>
                </DialogFooter>
            </>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogOverlay className="bg-black/50 backdrop-blur-sm" />
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-full">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <DialogTitle className="text-red-600">Cancel Booking</DialogTitle>
                    </div>
                </DialogHeader>

                <RenderContent />
            </DialogContent>
        </Dialog>
    );
};

export default CancellationConfirmationModal;
