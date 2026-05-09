'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, MapPin } from 'lucide-react';
import Typography from '../ui/typoGraphy';
import { Modal } from '../ui/modal';
import Loader from '../ui/loader';
import Image from 'next/image';

interface CancelBookingModalProps {
    open: boolean;
    onClose: () => void;
    isLoading: boolean;
    onSubmit: (data: any) => void;
    image: string;
    title: string;
    location: string;
}

export const ActivateSpaceModal: React.FC<CancelBookingModalProps> = ({
    open,
    onClose,
    isLoading,
    onSubmit,
    image,
    title,
    location,
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
            <Typography size="2xl" weight="semibold" align="left" color="text-gray-900">
                Activate this Listing?
            </Typography>

            <div className="shadow-sm my-6 w-full relative rounded-3xl overflow-hidden">
                <div className="w-full relative h-48">
                    <Image src={image} className="object-cover" alt="activate space" fill />
                </div>
                <div className="p-4 flex flex-col gap-1">
                    <Typography size="lg" weight="medium" align="left" color="text-black">
                        {title}
                    </Typography>
                    <span className="flex items-center gap-2 text-gray-500 text-sm">
                        <MapPin  className='w-4'/> {location}
                    </span>
                </div>
            </div>

            <Typography size="lg" weight="medium" align="center" color="text-black">
                Your listing will become visible to guests again. Users can find and book it
                immediately based on your availability and settings.
            </Typography>
            <div className="flex flex-col space-y-2 mt-6">
                <Button onClick={onSubmit} disabled={isLoading}>
                    {isLoading ? <Loader /> : 'Reactivate'}
                </Button>
                <Button variant="outline" onClick={onClose}>
                    Cancel
                </Button>
            </div>
        </Modal>
    );
};
