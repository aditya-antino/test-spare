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
    onSuccess: (data: any) => void;
}

const cautions = [
    'Your listing will be completely removed from the platform.',
    'All upcoming reservations will be canceled automatically.',
    'Guests will be notified, and refunds will be processed by the platform.',
    'A penalty fee may apply if the listing is deleted with upcoming reservations.',
];

export const DeleteSpaceModal: React.FC<CancelBookingModalProps> = ({
    open,
    onClose,
    isLoading,
    onSuccess,
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
            <Typography size="2xl" weight="semibold" align='center' color="text-gray-900" className='my-4'>
                Delete Listing
            </Typography>
            <Typography size="sm" weight="medium" align='center' color="text-black" className='my-4'>
                Deleting this listing is permanent.
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
                <Button
                    variant="destructive"
                    onClick={onSuccess}
                    disabled={isLoading}
                >
                    {isLoading ? <Loader />  : 'Yes, Delete Permanently'}
                </Button>
                <Button variant="outline" onClick={onClose}>
                    Cancel
                </Button>
            </div>
        </Modal>
    );
};
