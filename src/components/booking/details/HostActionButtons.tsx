
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Check } from 'lucide-react';

interface HostActionButtonsProps {
    setRejectedModalView: React.Dispatch<React.SetStateAction<boolean>>;
    setAcceptModalView: React.Dispatch<React.SetStateAction<boolean>>;
    approveBooking: () => void;
}

export const HostActionButtons = ({
    setRejectedModalView,
    setAcceptModalView,
}: HostActionButtonsProps) => (
    <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="gap-2 h-11" onClick={() => setRejectedModalView(true)}>
            <X className="w-4 h-4" />
            Reject
        </Button>
        <Button className="gap-2 h-11 bg-yellow-400 hover:bg-yellow-500 text-black border-none" onClick={() => setAcceptModalView(true)}>
            <Check className="w-4 h-4" />
            Accept
        </Button>
    </div>
);
