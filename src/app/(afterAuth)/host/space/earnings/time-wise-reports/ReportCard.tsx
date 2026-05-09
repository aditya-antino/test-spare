import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ReportCardProps {
    amount: string;
    year: string;
    month: string;
    onClick?: () => void;
}

export const ReportCard = ({ amount, year, month, onClick }: ReportCardProps) => (
    <Card
        onClick={onClick}
        className="flex-shrink-0 w-full sm:w-[220px] md:w-[260px] lg:w-60 px-4 py-5 shadow-none border border-gray-200 rounded-xl hover:shadow-md hover:border-gray-300 transition cursor-pointer"
    >
        <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{year}</span>
            </div>
            <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{month}</h3>
                <p className="text-base font-medium text-gray-900">₹{amount}</p>
            </div>
        </CardContent>
    </Card>
);
