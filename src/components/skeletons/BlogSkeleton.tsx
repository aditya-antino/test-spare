import { SkeletonBase } from './SkeletonBase';

interface BlogSkeletonProps {
    variant?: 'list' | 'detail';
}

export function BlogSkeleton({ variant = 'list' }: BlogSkeletonProps) {
    if (variant === 'detail') {
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16 space-y-8">
                    {/* Hero Image */}
                    <SkeletonBase className="h-[400px] lg:h-[500px] w-full rounded-2xl" />

                    {/* Post Title */}
                    <div className="space-y-4">
                        <SkeletonBase className="h-12 w-3/4 rounded-lg" />
                        <SkeletonBase className="h-12 w-1/2 rounded-lg" />
                    </div>

                    {/* Author/Meta */}
                    <div className="flex items-center gap-4 py-4 border-b">
                        <SkeletonBase variant="circle" className="w-12 h-12" />
                        <div className="space-y-2">
                            <SkeletonBase className="h-5 w-32" />
                            <SkeletonBase className="h-4 w-24" />
                        </div>
                    </div>

                    {/* Content Blocks */}
                    <div className="space-y-6 pt-8">
                        <SkeletonBase className="h-6 w-full" />
                        <SkeletonBase className="h-6 w-full" />
                        <SkeletonBase className="h-6 w-5/6" />
                        <SkeletonBase className="h-6 w-full" />
                        <SkeletonBase className="h-6 w-4/5" />
                    </div>
                </div>
            </div>
        );
    }

    // Grid List Variant
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-2xl border overflow-hidden flex flex-col h-[450px]"
                    >
                        {/* Featured Image */}
                        <SkeletonBase className="h-56 w-full" />

                        <div className="p-6 flex flex-col flex-1 space-y-4">
                            {/* Title */}
                            <div className="space-y-2">
                                <SkeletonBase className="h-6 w-full" />
                                <SkeletonBase className="h-6 w-2/3" />
                            </div>

                            {/* Excerpt */}
                            <div className="space-y-2 flex-1">
                                <SkeletonBase className="h-4 w-full" />
                                <SkeletonBase className="h-4 w-full" />
                                <SkeletonBase className="h-4 w-1/2" />
                            </div>

                            {/* Link */}
                            <SkeletonBase className="h-5 w-24 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
