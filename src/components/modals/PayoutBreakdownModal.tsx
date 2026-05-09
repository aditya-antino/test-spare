'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { useReservationPayout } from '@/services';
import type { PayoutBreakdown } from '@/types/reservations';

type Props = {
    open: boolean;
    onClose: () => void;
    reservationId?: number;
    payoutData?: PayoutBreakdown;
};

export function PayoutBreakdownModal({ open, onClose, reservationId, payoutData }: Props) {
    // Only fetch if payoutData is not provided
    const {
        data: apiData,
        isLoading,
        error,
    } = useReservationPayout(reservationId, { enabled: !payoutData && !!reservationId });

    const data = payoutData || apiData?.data;

    if (isLoading) {
        return (
            <Modal open={open} onClose={onClose} size="sm" title="">
                <div className="flex items-center justify-center py-8">
                    <div className="text-gray-500">Loading payout details...</div>
                </div>
            </Modal>
        );
    }

    if (error || !data) {
        return (
            <Modal open={open} onClose={onClose} size="sm" title="">
                <div className="flex items-center justify-center py-8">
                    <div className="text-red-500">Failed to load payout details</div>
                </div>
            </Modal>
        );
    }

    return (
        <Modal open={open} onClose={onClose} size="sm" title="">
            <div className="space-y-5">
                {[data.guest, data.host].map(
                    (section, idx) =>
                        section && (
                            <div key={idx}>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    {section.title}
                                </h3>
                                <div className="space-y-2">
                                    {section.rows.map((row, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between text-gray-700"
                                        >
                                            <span>{row.label}</span>
                                            <span>{row.value.formatted}</span>
                                        </div>
                                    ))}
                                    <div className="my-3 h-px bg-gray-200" />
                                    <div className="flex items-center justify-between text-gray-900 font-semibold">
                                        <span>Total</span>
                                        <span className="text-lg">{section.total.formatted}</span>
                                    </div>
                                </div>
                            </div>
                        ),
                )}
            </div>
        </Modal>
    );
}
