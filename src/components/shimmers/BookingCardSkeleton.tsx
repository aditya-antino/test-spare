import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const BookingCardSkeleton: React.FC = () => {
    return (
        <Card className="animate-pulse shadow-sm min-w-72 flex-1 gap-4 rounded-3xl border-none bg-white inline-flex flex-col justify-start items-start overflow-hidden">
            <div className="w-full h-48 bg-gray-200 rounded-t-3xl" />

            <div className="w-full flex justify-end items-center gap-2 px-4 mt-2">
                <div className="w-4 h-4 rounded-full bg-gray-300" />
                <div className="h-4 w-20 bg-gray-300 rounded" />
            </div>

            <CardContent className="px-4 flex flex-col gap-2.5">
                <div className="h-4 w-24 bg-gray-300 rounded" />

                <div className="h-6 w-40 bg-gray-300 rounded mt-1" />

                <div className="flex flex-col gap-1.5 mt-2">
                    <div className="h-4 w-36 bg-gray-300 rounded" />
                    <div className="h-4 w-28 bg-gray-300 rounded" />
                    <div className="h-4 w-20 bg-gray-300 rounded" />
                </div>
            </CardContent>

            <div className="flex w-full justify-between items-center px-4 pb-4 mt-auto">
                <div className="h-5 w-20 bg-gray-300 rounded" />
                <div className="h-5 w-24 bg-gray-300 rounded" />
            </div>
        </Card>
    );
};
