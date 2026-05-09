import { SkeletonBase } from './SkeletonBase';

export function BookingReviewSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header / Breadcrumb */}
            <div className="flex items-center gap-4 mb-8">
                <SkeletonBase variant="circle" className="w-10 h-10" />
                <SkeletonBase className="h-8 w-64 rounded-lg" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Details & Form */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Main Image Section */}
                    <div className="space-y-4">
                        <SkeletonBase className="h-[400px] w-full rounded-2xl" />
                        <div className="flex justify-between items-center">
                            <SkeletonBase className="h-8 w-1/3" />
                            <SkeletonBase className="h-6 w-24" />
                        </div>
                    </div>

                    {/* Booking Details Section */}
                    <div className="space-y-6">
                        <SkeletonBase className="h-8 w-40" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SkeletonBase className="h-24 w-full rounded-xl" />
                            <SkeletonBase className="h-24 w-full rounded-xl" />
                        </div>
                    </div>

                    {/* Message to Host */}
                    <div className="space-y-4">
                        <SkeletonBase className="h-8 w-40" />
                        <SkeletonBase className="h-32 w-full rounded-xl" />
                    </div>
                </div>

                {/* Right Column: Price Breakdown */}
                <div className="lg:col-span-1">
                    <div className="border rounded-2xl p-6 shadow-sm sticky top-24 space-y-6">
                        <SkeletonBase className="h-8 w-1/2 mb-2" />

                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <SkeletonBase className="h-5 w-1/3" />
                                <SkeletonBase className="h-5 w-1/4" />
                            </div>
                            <div className="flex justify-between">
                                <SkeletonBase className="h-5 w-1/3" />
                                <SkeletonBase className="h-5 w-1/4" />
                            </div>
                            <div className="flex justify-between">
                                <SkeletonBase className="h-5 w-1/3" />
                                <SkeletonBase className="h-5 w-1/4" />
                            </div>
                        </div>

                        <div className="border-t pt-4 flex justify-between">
                            <SkeletonBase className="h-7 w-1/3" />
                            <SkeletonBase className="h-7 w-1/4" />
                        </div>

                        <SkeletonBase className="h-14 w-full rounded-xl mt-6" />
                    </div>
                </div>
            </div>
        </div>
    );
}
