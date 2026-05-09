import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import React from 'react';

interface EarningsPaginationProps {
    page: number;
    totalPages: number;
    onPrev: () => void;
    onNext: () => void;
}

const EarningsPagination = ({ page, totalPages, onPrev, onNext }: EarningsPaginationProps) => {
    const isFirst = page === 1;
    const isLast = page === totalPages || totalPages === 0;

    return (
        <div className="flex flex-wrap items-center justify-end gap-3 pt-6">
            <Button
                variant="outline"
                onClick={onPrev}
                disabled={isFirst}
                className={`flex items-center p-1 text-sm font-medium transition-all duration-200 ${
                    isFirst
                        ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200'
                        : 'hover:bg-gray-100 hover:text-black'
                }`}
            >
                <ChevronLeft className="w-4 h-4" />
            </Button>

            <span className="text-sm text-gray-700 font-medium">
                Page {page} of {totalPages || 1}
            </span>

            <Button
                variant="outline"
                onClick={onNext}
                disabled={isLast}
                className={`flex items-center gap-1 p-1 text-sm font-medium transition-all duration-200 ${
                    isLast
                        ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200'
                        : 'hover:bg-gray-100 hover:text-black'
                }`}
            >
                <ChevronRight className="w-4 h-4" />
            </Button>
        </div>
    );
};

export default EarningsPagination;
