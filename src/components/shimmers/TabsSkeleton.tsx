interface TabsSkeletonProps {
    count?: number;
}

export const TabsSkeleton: React.FC<TabsSkeletonProps> = ({ count = 4 }) => {
    return (
        <div className="flex gap-4 py-1 max-w-screen overflow-x-auto px-2">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="h-8 w-24 bg-gray-300 rounded-full animate-pulse" />
            ))}
        </div>
    );
};
