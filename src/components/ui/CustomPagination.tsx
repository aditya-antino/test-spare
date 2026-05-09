'use client';

import React, { useMemo } from 'react';

interface PaginationProps {
    limit: number;
    count: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    totalPage?: number;
}

export default function Pagination({
    limit,
    count,
    currentPage = 1,
    onPageChange,
    totalPage,
}: PaginationProps) {
    const totalPages = useMemo(() => {
        const c = Number(count) || 0;
        const l = Number(limit) || 1;
        return totalPage ?? Math.max(Math.ceil(c / l), 1);
    }, [count, limit, totalPage]);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 3;

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > maxVisible) pages.push('...');

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) pages.push(i);

            if (currentPage < totalPages - maxVisible) pages.push('...');
            pages.push(totalPages);
        }

        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex flex-col justify-center sm:flex-row mt-6 w-full gap-4 items-center">
            {/* <p className="text-sm text-gray-500">
                Page {Number(currentPage) || 1} of {totalPages}
            </p> */}

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage <= 1}
                    className="px-3 h-8 rounded-full text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 hover:cursor-pointer"
                >
                    Prev
                </button>

                {getPageNumbers().map((page, idx) =>
                    page === '...' ? (
                        <span key={idx} className="px-2 text-gray-400">
                            ...
                        </span>
                    ) : (
                        <button
                            key={idx}
                            onClick={() => onPageChange(page as number)}
                            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm  hover:cursor-pointer ${
                                currentPage === page
                                    ? 'bg-[#F6CD28] text-white font-semibold'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {page}
                        </button>
                    ),
                )}

                <button
                    onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage >= totalPages}
                    className="px-3 h-8 rounded-full text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50  hover:cursor-pointer"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
