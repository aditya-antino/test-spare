'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface EmptyCalendarProps {
    onApproveRequests?: () => void;
}

export function EmptyCalendar({ onApproveRequests }: EmptyCalendarProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="text-gray-400 text-xl mb-6">No Data Available</div>
            <Button variant="yellow" className="rounded-full px-6 py-3" onClick={onApproveRequests}>
                Approve Booking Requests
            </Button>
        </div>
    );
}
