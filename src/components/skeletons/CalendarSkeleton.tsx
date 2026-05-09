import { SkeletonBase } from './SkeletonBase';

export function CalendarSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <SkeletonBase className="h-8 w-40" />
                <div className="flex gap-2">
                    <SkeletonBase className="h-9 w-20" />
                    <SkeletonBase className="h-9 w-20" />
                </div>
            </div>

            <div className="grid grid-cols-7 gap-4 mb-4">
                {Array.from({ length: 7 }).map((_, i) => (
                    <SkeletonBase key={i} className="h-8 w-1/2 mx-auto" />
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, i) => (
                    <SkeletonBase key={i} className="h-24 w-full rounded-lg" />
                ))}
            </div>
        </div>
    );
}
