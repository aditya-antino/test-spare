import { SkeletonBase } from './SkeletonBase';

export function ProfileSkeleton() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <SkeletonBase variant="circle" className="w-32 h-32 md:w-40 md:h-40" />
                <div className="flex-1 space-y-4 w-full text-center md:text-left">
                    <SkeletonBase className="h-8 w-1/2 mx-auto md:mx-0" />
                    <SkeletonBase className="h-4 w-1/3 mx-auto md:mx-0" />
                    <div className="flex justify-center md:justify-start gap-4 pt-2">
                        <SkeletonBase className="h-10 w-32" />
                        <SkeletonBase className="h-10 w-32" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <SkeletonBase className="h-6 w-40" />
                    <div className="space-y-4 border rounded-xl p-6">
                        <SkeletonBase className="h-12 w-full" />
                        <SkeletonBase className="h-12 w-full" />
                        <SkeletonBase className="h-12 w-full" />
                    </div>
                </div>
                <div className="space-y-4">
                    <SkeletonBase className="h-6 w-40" />
                    <div className="space-y-4 border rounded-xl p-6">
                        <SkeletonBase className="h-24 w-full" />
                        <SkeletonBase className="h-24 w-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}
