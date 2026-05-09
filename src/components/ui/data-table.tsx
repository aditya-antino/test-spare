import React from 'react';
import { cn } from '@/lib/utils';

interface Column {
    key: string;
    label: string;
    render?: (value: any, row: any) => React.ReactNode;
    className?: string;
}

interface DataTableProps {
    columns: Column[];
    data: any[];
    className?: string;
}

export function DataTable({ columns, data, className }: DataTableProps) {
    return (
        <div className={cn('overflow-x-auto', className)}>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b border-gray-200">
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={cn(
                                    'text-left py-3 px-4 font-semibold text-gray-700 text-sm',
                                    column.className,
                                )}
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                            {columns.map((column) => (
                                <td
                                    key={column.key}
                                    className={cn(
                                        'py-4 px-4 text-sm text-gray-900',
                                        column.className,
                                    )}
                                >
                                    {column.render
                                        ? column.render(row[column.key], row)
                                        : row[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
