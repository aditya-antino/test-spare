'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import Typography from '../ui/typoGraphy';
import { Modal } from '../ui/modal';
import Loader from '../ui/loader';

interface CancelBookingModalProps {
    open: boolean;
    onClose: () => void;
    isLoading: boolean;
    onSubmit: (data: any) => void;
}

const cautions = [
    'Deactivation will hide your listing from search and stop new bookings.',
    'You are still responsible for hosting your existing confirmed reservations.',
];

export const DeactivateSpaceWarningModal: React.FC<CancelBookingModalProps> = ({
    open,
    onClose,
    isLoading,
    onSubmit,
}) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            showClose={false}
            className="sm:max-w-96 rounded-xl p-6 bg-white relative"
            ariaLabel="Cancel Booking Modal"
            closeOnOverlay={false}
        >
            <AlertTriangle className="mx-auto w-20 h-20 text-red-500" />
            <Typography
                size="2xl"
                weight="semibold"
                align="center"
                color="text-gray-900"
                className="my-4"
            >
                Deactivate Listing{' '}
            </Typography>
            <Typography
                size="sm"
                weight="medium"
                align="center"
                color="text-black"
                className="my-4"
            >
                Deactivating will hide your listing from search and prevent new bookings.
            </Typography>
            <div className="p-4 mt-4 bg-gray-100 flex flex-col w-full gap-2 rounded-lg">
                <ul className="list-disc  pl-4">
                    {cautions.map((caution, index) => (
                        <li key={index} className="text-zinc-800 text-sm">
                            {caution}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex flex-col space-y-2 mt-6">
                <Button variant="destructive" onClick={onSubmit} disabled={isLoading}>
                    {isLoading ? <Loader /> : 'Deactivate Anyway'}
                </Button>
                <Button variant="outline" onClick={onClose}>
                    Go Back
                </Button>
            </div>
        </Modal>
    );
};
