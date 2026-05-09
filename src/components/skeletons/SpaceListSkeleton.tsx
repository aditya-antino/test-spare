import { SkeletonBase } from './SkeletonBase';
import { SkeletonCard } from './SkeletonCard';
import { BannerSkeleton } from './BannerSkeleton';

export function SpaceListSkeleton() {
    return (
        <div className="w-full animate-in fade-in duration-500">
            {/* Search Bar Area Skeleton */}
            <div className="flex flex-col items-center mx-auto my-4 w-full max-w-6xl px-4">
                <SkeletonBase className="h-16 md:h-20 w-full rounded-2xl md:rounded-full opacity-60" />
            </div>

            {/* Dynamic Hero Banner Skeleton */}
            <div className="w-full max-w-6xl mx-auto px-4 mt-8">
                <BannerSkeleton />
            </div>

            {/* Main container with filters + listings */}
            <div className="px-4 md:px-16 mt-8">
                {/* Filter Pills Skeleton */}
                <div className="flex gap-3 mb-10 overflow-hidden">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <SkeletonBase key={i} className="h-10 w-32 rounded-full flex-shrink-0 opacity-80" />
                    ))}
                </div>

                {/* Grid Skeleton */}
                <div className="grid gap-8 grid-cols-[repeat(auto-fill,minmax(18rem,1fr))]">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="max-w-lg w-full scale-[0.98]">
                            <SkeletonCard />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
