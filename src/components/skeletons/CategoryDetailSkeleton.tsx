import { SkeletonBase } from './SkeletonBase';

export function CategoryDetailSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Search Bar */}
            <div className="bg-[#f5efe6] py-10">
                <div className="max-w-4xl mx-auto px-4">
                    <SkeletonBase className="h-12 w-full rounded-xl" />
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
                {/* Back Button */}
                <SkeletonBase className="h-4 w-24 rounded" />

                {/* Header Section */}
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <SkeletonBase className="h-12 w-12 rounded-xl" />

                    <div className="flex-1 space-y-3">
                        {/* Title */}
                        <SkeletonBase className="h-8 w-40 rounded-lg" />

                        {/* Description */}
                        <SkeletonBase className="h-4 w-3/4 rounded" />

                        {/* Articles count */}
                        <SkeletonBase className="h-3 w-24 rounded" />
                    </div>
                </div>

                {/* Section Title */}
                <div className="space-y-3">
                    <SkeletonBase className="h-6 w-64 rounded-lg" />
                    <div className="h-[1px] bg-gray-200 w-full" />
                </div>

                {/* Accordion List */}
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between border rounded-xl px-4 py-4"
                        >
                            <SkeletonBase className="h-4 w-3/4 rounded" />
                            <SkeletonBase className="h-4 w-4 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}