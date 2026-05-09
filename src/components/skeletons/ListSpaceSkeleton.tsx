import { SkeletonBase } from './SkeletonBase';

export function ListSpaceSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Step Indicators */}
            <div className="flex justify-between items-center mb-12">
                {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <SkeletonBase variant="circle" className="w-8 h-8" />
                        <SkeletonBase className="h-3 w-12 hidden md:block" />
                    </div>
                ))}
            </div>

            {/* Form Container */}
            <div className="bg-white rounded-3xl border p-8 space-y-8 shadow-sm">
                {/* Title */}
                <div className="space-y-3">
                    <SkeletonBase className="h-10 w-3/4 rounded-lg" />
                    <SkeletonBase className="h-5 w-1/2 rounded-lg" />
                </div>

                {/* Form Inputs */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <SkeletonBase className="h-6 w-32" />
                        <SkeletonBase className="h-14 w-full rounded-xl" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <SkeletonBase className="h-6 w-32" />
                            <SkeletonBase className="h-14 w-full rounded-xl" />
                        </div>
                        <div className="space-y-4">
                            <SkeletonBase className="h-6 w-32" />
                            <SkeletonBase className="h-14 w-full rounded-xl" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <SkeletonBase className="h-6 w-32" />
                        <SkeletonBase className="h-32 w-full rounded-xl" />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-8 border-t">
                    <SkeletonBase className="h-12 w-32 rounded-xl" />
                    <SkeletonBase className="h-12 w-48 rounded-xl" />
                </div>
            </div>
        </div>
    );
}
