import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Pagination from './CustomPagination';
import Loader from './loader';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Column {
    key: string;
    label: string;
    render?: (value: any, row: any, rowIndex: number) => React.ReactNode;
    className?: string;
}

interface TableWithPaginationProps {
    columns: Column[];
    data: any[];
    pageSize?: number;
    showPagination?: boolean;
    className?: string;
    emptyMessage?: any;
    currentPage?: number;
    totalPages?: number;
    setCurrentPage?: any;
    isLoading?: boolean;
}

export function TableWithPagination({
    columns = [],
    data = [],
    pageSize = 10,
    showPagination = true,
    className,
    emptyMessage = 'No records found.',
    currentPage,
    totalPages,
    setCurrentPage,
    isLoading = false,
}: TableWithPaginationProps) {
    // ❌ REMOVE the slice
    // const pageData = data; // API already returns correct page

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    const checkScrollPosition = () => {
        const container = scrollContainerRef.current;
        if (container) {
            const { scrollLeft, scrollWidth, clientWidth } = container;
            setShowLeftArrow(scrollLeft > 10);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkScrollPosition();
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScrollPosition);
            window.addEventListener('resize', checkScrollPosition);
            return () => {
                container.removeEventListener('scroll', checkScrollPosition);
                window.removeEventListener('resize', checkScrollPosition);
            };
        }
    }, [data]);

    const scrollLeft = () => {
        scrollContainerRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
    };

    const scrollRight = () => {
        scrollContainerRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
    };

    const renderCell = (col: Column, row: any, rowIndex: number) => {
        if (typeof col.render === 'function') return col.render(row[col.key], row, rowIndex);
        return row[col.key] ?? '';
    };

    return (
        <div className={cn('w-full h-full flex flex-col gap-6', className)}>
            <div className="relative">
                {/* Left scroll button */}
                {showLeftArrow && (
                    <button
                        onClick={scrollLeft}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 border border-gray-200 transition-all duration-200"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                )}

                {/* Right scroll button */}
                {showRightArrow && (
                    <button
                        onClick={scrollRight}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 border border-gray-200 transition-all duration-200"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                )}

                <div
                    ref={scrollContainerRef}
                    className="custom-horizontal-scroll h-full"
                    onScroll={checkScrollPosition}
                >
                    <table className="min-w-full">
                        <thead className="border-b border-neutral-300">
                            <tr>
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        scope="col"
                                        className={cn(
                                            'text-left pb-6 pt- px-4 font-semibold text-gray-700 text-sm whitespace-nowrap max-w-[300px] overflow-hidden overflow-ellipsis',
                                            col.className,
                                        )}
                                    >
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={columns.length} className="py-16">
                                        <div className="flex w-full justify-center items-center">
                                            <Loader />
                                        </div>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td
                                        className="px-4 py-6 text-center text-sm text-gray-500"
                                        colSpan={columns.length}
                                    >
                                        {emptyMessage}
                                    </td>
                                </tr>
                            ) : (
                                data.map((row, rIdx) => (
                                    <tr key={rIdx} className="border-b border-gray-100">
                                        {columns.map((col) => (
                                            <td
                                                key={col.key}
                                                className={cn(
                                                    'py-4 px-4 text-sm text-gray-900 whitespace-nowrap max-w-[300px] overflow-hidden overflow-ellipsis',
                                                    col.className,
                                                )}
                                            >
                                                {renderCell(col, row, rIdx)}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {showPagination && (
                <div className="mt-auto flex flex-col items-start w-full justify-between gap-3">
                    <Pagination
                        limit={pageSize}
                        count={totalPages}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}
        </div>
    );
}
