import { SkeletonBase } from './SkeletonBase';

export function BookingsSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-4 border rounded-lg p-4">
                    <SkeletonBase className="w-full md:w-48 h-32 rounded-lg" />
                    <div className="flex-1 space-y-3">
                        <div className="flex justify-between">
                            <SkeletonBase className="h-6 w-1/3" />
                            <SkeletonBase className="h-6 w-20 rounded-full" />
                        </div>
                        <SkeletonBase className="h-4 w-1/2" />
                        <SkeletonBase className="h-4 w-1/4" />
                        <div className="pt-2 flex gap-2">
                            <SkeletonBase className="h-9 w-24" />
                            <SkeletonBase className="h-9 w-24" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
