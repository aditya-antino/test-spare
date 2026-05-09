
import { formatCurrency } from '@/lib/utils';
import React from 'react';

interface AmountRowProps {
    label: string;
    value: number | string;
    isNegative?: boolean;
    isPositive?: boolean;
}

export const AmountRow = ({
    label,
    value,
    isNegative = false,
    isPositive = false,
}: AmountRowProps) => (
    <div className="flex justify-between text-gray-600 text-sm">
        <span>{label}</span>
        <span
            className={isNegative ? 'text-red-500' : isPositive ? 'text-green-600' : 'text-gray-600'}
        >
            {isNegative && '-'}₹{formatCurrency(Math.abs(Number(value)))}
        </span>
    </div>
);

interface TotalRowProps {
    label: string;
    value: number | string;
    isPositive?: boolean;
}

export const TotalRow = ({ label, value, isPositive = true }: TotalRowProps) => (
    <div className="flex justify-between font-semibold border-t border-gray-200 pt-2 mt-2">
        <span>{label}</span>
        <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
            ₹{formatCurrency(value)}
        </span>
    </div>
);
