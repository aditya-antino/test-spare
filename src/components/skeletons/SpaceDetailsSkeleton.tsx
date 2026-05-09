import { SkeletonBase } from './SkeletonBase';
import { SkeletonText } from './SkeletonText';

export function SpaceDetailsSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Gallery Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[400px] mb-8 rounded-xl overflow-hidden">
                <SkeletonBase className="md:col-span-2 h-full" />
                <div className="hidden md:grid grid-cols-1 gap-4">
                    <SkeletonBase className="h-full" />
                    <SkeletonBase className="h-full" />
                </div>
                <div className="hidden md:grid grid-cols-1 gap-4">
                    <SkeletonBase className="h-full" />
                    <SkeletonBase className="h-full" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <SkeletonBase className="h-10 w-3/4 mb-4" />
                        <SkeletonText lines={1} className="w-1/2" />
                    </div>

                    <div className="border-t border-b py-6">
                        <div className="flex items-center gap-4">
                            <SkeletonBase variant="circle" className="w-14 h-14" />
                            <div>
                                <SkeletonBase className="h-5 w-32 mb-2" />
                                <SkeletonBase className="h-4 w-24" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <SkeletonBase className="h-6 w-40 mb-4" />
                        <SkeletonText lines={4} />
                    </div>

                    <div>
                        <SkeletonBase className="h-6 w-40 mb-4" />
                        <div className="grid grid-cols-2 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <SkeletonBase key={i} className="h-12 rounded-lg" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Booking Sidebar Skeleton */}
                <div className="lg:col-span-1">
                    <div className="border rounded-xl p-6 shadow-sm sticky top-24 h-[400px]">
                        <SkeletonBase className="h-8 w-1/3 mb-6" />
                        <SkeletonBase className="h-12 w-full mb-4" />
                        <SkeletonBase className="h-12 w-full mb-4" />
                        <SkeletonBase className="h-12 w-full mt-auto" />
                    </div>
                </div>
            </div>
        </div>
    );
}
