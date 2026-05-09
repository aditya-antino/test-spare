import { SkeletonBase } from '@/components/skeletons';

export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-16 space-y-12">
            <SkeletonBase className="h-20 w-3/4 mx-auto rounded-xl" />
            <SkeletonBase className="h-[500px] w-full rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <SkeletonBase className="h-64 w-full rounded-2xl" />
                <SkeletonBase className="h-64 w-full rounded-2xl" />
                <SkeletonBase className="h-64 w-full rounded-2xl" />
            </div>
        </div>
    );
}
