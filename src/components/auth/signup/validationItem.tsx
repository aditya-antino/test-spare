'use client';
import React from 'react';
import { Check, X } from 'lucide-react';
import Typography from '@/components/ui/typoGraphy';

interface ValidationItemProps {
    isValid: boolean;
    text: string;
}

const ValidationItem: React.FC<ValidationItemProps> = ({ isValid, text }) => (
    <div className="flex items-center gap-2 transition-all duration-300">
        <div className="flex items-center justify-center w-5 h-5">
            {isValid ? (
                <Check className="text-green-600 animate-in zoom-in spin-in-12 duration-300" size={16} strokeWidth={2} />
            ) : (
                <X className="text-gray-400 animate-in zoom-in duration-300" size={16} strokeWidth={2} />
            )}
        </div>
        <Typography
            size="sm"
            className="text-[#334155]"
            weight="medium"
        >
            {text}
        </Typography>
    </div>
);

export default ValidationItem;
