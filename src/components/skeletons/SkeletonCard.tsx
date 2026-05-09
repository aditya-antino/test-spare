import { cn } from '@/lib/utils';
import { SkeletonBase } from './SkeletonBase';

export function SkeletonCard({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'flex flex-col gap-4 rounded-3xl bg-white overflow-hidden shadow-sm border-none my-2 w-full flex-1 sm:max-w-sm',
                className,
            )}
        >
            {/* Image Shimmer */}
            <SkeletonBase className="h-48 w-full rounded-none" />

            <div className="px-4 flex flex-col gap-2.5 pb-2">
                {/* Category Shimmer */}
                <SkeletonBase className="h-4 w-20 rounded-md" />

                {/* Title Shimmer */}
                <SkeletonBase className="h-6 w-3/4 rounded-md" />

                <div className="flex flex-col gap-2 mt-2">
                    {/* MapPin / Locality Shimmer */}
                    <div className="flex items-center gap-2">
                        <SkeletonBase className="h-4 w-4 rounded-full" />
                        <SkeletonBase className="h-4 w-1/2 rounded-md" />
                    </div>
                    {/* Users / Seats Shimmer */}
                    <div className="flex items-center gap-2">
                        <SkeletonBase className="h-4 w-4 rounded-full" />
                        <SkeletonBase className="h-4 w-1/4 rounded-md" />
                    </div>
                </div>
            </div>

            {/* Footer Shimmer */}
            <div className="flex justify-between items-center px-4 pb-4 mt-auto">
                <SkeletonBase className="h-6 w-24 rounded-md" />
                <SkeletonBase className="h-5 w-16 rounded-md" />
            </div>
        </div>
    );
}

export function SkeletonCardGrid({
    count = 6,
    gridClassName,
    cardClassName,
}: {
    count?: number;
    gridClassName?: string;
    cardClassName?: string;
}) {
    return (
        <div className={cn('grid gap-2 lg:gap-4', gridClassName)}>
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} className={cardClassName} />
            ))}
        </div>
    );
}
