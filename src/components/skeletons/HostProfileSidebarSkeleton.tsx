import React from 'react';
import { Card } from '@/components/ui/card';
import { SkeletonBase } from './SkeletonBase';

export function HostProfileSidebarSkeleton() {
    return (
        <Card className="p-6 sticky top-8 space-y-6">
            <div className="flex flex-col items-center">
                <SkeletonBase variant="circle" className="w-16 h-16" />
                <SkeletonBase className="h-6 w-32 mt-4" />
                <SkeletonBase className="h-4 w-24 mt-2" />
            </div>
            <div className="space-y-3 pt-4">
                <SkeletonBase className="h-4 w-full" />
                <SkeletonBase className="h-4 w-full" />
                <SkeletonBase className="h-4 w-2/3" />
            </div>
            <div className="space-y-3 pt-4 border-t">
                <SkeletonBase className="h-5 w-full" />
                <SkeletonBase className="h-5 w-full" />
                <SkeletonBase className="h-5 w-full" />
            </div>
        </Card>
    );
}
