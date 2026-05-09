import { SkeletonBase } from './SkeletonBase';

export function ArticleSkeleton() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            {/* Header */}
            <div className="text-center mb-12 space-y-4">
                <SkeletonBase className="h-10 w-1/3 mx-auto rounded-lg" />
            </div>

            {/* Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2].map((i) => (
                    <div
                        key={i}
                        className="p-6 border rounded-2xl shadow-sm space-y-4"
                    >
                        {/* Icon */}
                        <SkeletonBase className="h-12 w-12 rounded-full" />

                        {/* Title */}
                        <SkeletonBase className="h-6 w-1/3 rounded-lg" />

                                                {/* Description */}
                        <div className="space-y-2">
                            <SkeletonBase className="h-4 w-full rounded" />
                            <SkeletonBase className="h-4 w-5/6 rounded" />
                        </div>
                    </div>
                     ))}
            </div>
        </div>
    );
}