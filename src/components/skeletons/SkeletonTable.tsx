
import { SkeletonBase } from './SkeletonBase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface SkeletonTableProps {
    rows?: number;
    columns?: number;
    showHeader?: boolean;
}

export function SkeletonTable({ rows = 5, columns = 4, showHeader = true }: SkeletonTableProps) {
    return (
        <div className="w-full border rounded-lg overflow-hidden">
            <Table>
                {showHeader && (
                    <TableHeader>
                        <TableRow>
                            {Array.from({ length: columns }).map((_, i) => (
                                <TableHead key={i}>
                                    <SkeletonBase className="h-4 w-24" />
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                )}
                <TableBody>
                    {Array.from({ length: rows }).map((_, rIndex) => (
                        <TableRow key={rIndex}>
                            {Array.from({ length: columns }).map((_, cIndex) => (
                                <TableCell key={cIndex}>
                                    <SkeletonBase className="h-4 w-full" />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
